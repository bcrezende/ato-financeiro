import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { TransactionFilters } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const transactionService = {
  async create(userId: string, data: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: Date;
    categoryId: string;
    notes?: string;
    isRecurring?: boolean;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    installments?: number;
    status?: 'PAID' | 'PENDING';
  }) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { isDefault: true }] },
    });
    if (!category) throw new NotFoundError('Category');

    const { installments, ...baseData } = data;
    const useInstallments = installments && installments > 1 && data.isRecurring && data.frequency;

    if (useInstallments) {
      const recurringId = crypto.randomUUID();
      const count = installments!;

      const created = await prisma.$transaction(async (tx) => {
        const results = [];
        for (let i = 0; i < count; i++) {
          const date = advanceDate(baseData.date, baseData.frequency!, i);
          const t = await tx.transaction.create({
            data: { ...baseData, userId, date, recurringId, installments: count, installmentNumber: i + 1 },
            include: { category: { select: { id: true, name: true, color: true, icon: true } } },
          });
          results.push(t);
        }
        return results;
      });

      if (data.type === 'EXPENSE') {
        for (const t of created) {
          const d = new Date(t.date);
          await prisma.budget.updateMany({
            where: { userId, categoryId: data.categoryId, month: d.getMonth() + 1, year: d.getFullYear() },
            data: { spent: { increment: data.amount } },
          });
        }
      }

      return created[0];
    }

    const transaction = await prisma.transaction.create({
      data: { ...baseData, userId },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });

    if (data.type === 'EXPENSE') {
      const d = new Date(data.date);
      await prisma.budget.updateMany({
        where: { userId, categoryId: data.categoryId, month: d.getMonth() + 1, year: d.getFullYear() },
        data: { spent: { increment: data.amount } },
      });
    }

    return transaction;
  },

  async findAll(userId: string, filters: TransactionFilters, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    const where: any = { userId };

    if (filters.startDate) where.date = { ...((where.date) || {}), gte: new Date(filters.startDate) };
    if (filters.endDate) where.date = { ...((where.date) || {}), lte: new Date(filters.endDate) };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.type) where.type = filters.type;
    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = parseFloat(filters.minAmount);
      if (filters.maxAmount) where.amount.lte = parseFloat(filters.maxAmount);
    }
    if (filters.search) {
      // SQLite: busca case-sensitive por padrão
      where.description = { contains: filters.search };
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: { category: { select: { id: true, name: true, color: true, icon: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: transactions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(userId: string, id: string) {
    const t = await prisma.transaction.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
    if (!t) throw new NotFoundError('Transaction');
    if (t.userId !== userId) throw new ForbiddenError();
    return t;
  },

  async update(userId: string, id: string, data: Record<string, any>) {
    const existing = await this.findById(userId, id);

    if (existing.type === 'EXPENSE') {
      const d = new Date(existing.date);
      await prisma.budget.updateMany({
        where: { userId, categoryId: existing.categoryId, month: d.getMonth() + 1, year: d.getFullYear() },
        data: { spent: { decrement: existing.amount } },
      });
    }

    const safeData: Record<string, any> = {};
    const allowed = ['description', 'amount', 'type', 'date', 'categoryId', 'notes', 'isRecurring', 'frequency', 'installments', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) safeData[key] = data[key] ?? null;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: safeData,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });

    const newType = data.type ?? existing.type;
    const newAmount = data.amount ?? existing.amount;
    const newCategoryId = data.categoryId ?? existing.categoryId;
    const newDate = data.date ?? existing.date;

    if (newType === 'EXPENSE') {
      const d = new Date(newDate);
      await prisma.budget.updateMany({
        where: { userId, categoryId: newCategoryId, month: d.getMonth() + 1, year: d.getFullYear() },
        data: { spent: { increment: newAmount } },
      });
    }

    return updated;
  },

  async delete(userId: string, id: string) {
    const t = await this.findById(userId, id);

    if (t.type === 'EXPENSE') {
      const d = new Date(t.date);
      await prisma.budget.updateMany({
        where: { userId, categoryId: t.categoryId, month: d.getMonth() + 1, year: d.getFullYear() },
        data: { spent: { decrement: t.amount } },
      });
    }

    await prisma.transaction.delete({ where: { id } });
  },

  async getSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [incomeAgg, expenseAgg, paidIncomeAgg, paidExpenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', status: 'PAID', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', status: 'PAID', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const income = incomeAgg._sum.amount ?? 0;
    const expense = expenseAgg._sum.amount ?? 0;
    const paidIncome = paidIncomeAgg._sum.amount ?? 0;
    const paidExpense = paidExpenseAgg._sum.amount ?? 0;
    return { income, expense, balance: income - expense, paidIncome, paidExpense, caixa: paidIncome - paidExpense };
  },

  async getByCategory(userId: string, startDate: Date, endDate: Date) {
    const results = await prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });

    const categories = await prisma.category.findMany({
      where: { id: { in: results.map((r) => r.categoryId) } },
      select: { id: true, name: true, color: true, icon: true },
    });

    return results.map((r) => ({
      ...r,
      category: categories.find((c) => c.id === r.categoryId),
      total: r._sum.amount ?? 0,
    }));
  },

  async getMonthlyEvolution(userId: string, months = 12) {
    const results = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const summary = await this.getSummary(userId, m, y);
      results.push({ month: m, year: y, label: `${m}/${y}`, ...summary });
    }
    return results;
  },
};

function advanceDate(date: Date, frequency: string, count: number): Date {
  const d = new Date(date);
  switch (frequency) {
    case 'DAILY':   d.setDate(d.getDate() + count); break;
    case 'WEEKLY':  d.setDate(d.getDate() + count * 7); break;
    case 'MONTHLY': d.setMonth(d.getMonth() + count); break;
    case 'YEARLY':  d.setFullYear(d.getFullYear() + count); break;
  }
  return d;
}
