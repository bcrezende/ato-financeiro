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
            where: { userId, categoryId: data.categoryId, month: d.getUTCMonth() + 1, year: d.getUTCFullYear() },
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
        where: { userId, categoryId: data.categoryId, month: d.getUTCMonth() + 1, year: d.getUTCFullYear() },
        data: { spent: { increment: data.amount } },
      });
    }

    return transaction;
  },

  async findAll(userId: string, filters: TransactionFilters, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    const where: any = { userId };

    if (filters.startDate) where.date = { ...((where.date) || {}), gte: new Date(`${filters.startDate}T00:00:00.000Z`) };
    // endDate inclusivo: cobre o dia inteiro em UTC (transações são ancoradas ao meio-dia UTC)
    if (filters.endDate) where.date = { ...((where.date) || {}), lte: new Date(`${filters.endDate}T23:59:59.999Z`) };
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
        where: { userId, categoryId: existing.categoryId, month: d.getUTCMonth() + 1, year: d.getUTCFullYear() },
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
        where: { userId, categoryId: newCategoryId, month: d.getUTCMonth() + 1, year: d.getUTCFullYear() },
        data: { spent: { increment: newAmount } },
      });
    }

    return updated;
  },

  /**
   * Recomputa `budget.spent` para um mês/categoria do zero, baseado nas
   * despesas existentes. Usado após operações em lote, onde calcular o delta
   * incremental seria frágil.
   */
  async recomputeBudgetSpent(userId: string, categoryId: string, month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0) - 1);
    const agg = await prisma.transaction.aggregate({
      where: { userId, categoryId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });
    await prisma.budget.updateMany({
      where: { userId, categoryId, month, year },
      data: { spent: agg._sum.amount ?? 0 },
    });
  },

  /** Bulk update por série recorrente. scope: 'future' (>= date desta) ou 'all'. */
  async updateScope(userId: string, id: string, scope: 'future' | 'all', data: Record<string, any>) {
    const anchor = await this.findById(userId, id);
    if (!anchor.recurringId) {
      // não é série — degrada para update normal
      return this.update(userId, id, data);
    }

    // Allowlist: campos que fazem sentido em lote
    const allowed: Record<string, any> = {};
    for (const key of ['description', 'amount', 'categoryId', 'status', 'notes']) {
      if (data[key] !== undefined) allowed[key] = data[key];
    }

    const where: any = { userId, recurringId: anchor.recurringId };
    if (scope === 'future') where.date = { gte: anchor.date };

    // Captura buckets ANTES para recálculo (categoria/mês antigos)
    const rowsBefore = await prisma.transaction.findMany({
      where, select: { categoryId: true, date: true, type: true },
    });

    if (allowed.categoryId !== undefined) {
      // valida ownership da nova categoria
      const cat = await prisma.category.findFirst({
        where: { id: allowed.categoryId, OR: [{ userId }, { isDefault: true }] },
      });
      if (!cat) throw new NotFoundError('Category');
    }

    await prisma.transaction.updateMany({ where, data: allowed });

    // Buckets afetados (categoria antiga + nova) × cada mês envolvido
    const buckets = new Set<string>();
    for (const r of rowsBefore) {
      const d = new Date(r.date);
      buckets.add(`${r.categoryId}|${d.getUTCMonth() + 1}|${d.getUTCFullYear()}`);
      if (allowed.categoryId && allowed.categoryId !== r.categoryId) {
        buckets.add(`${allowed.categoryId}|${d.getUTCMonth() + 1}|${d.getUTCFullYear()}`);
      }
    }
    for (const k of buckets) {
      const [categoryId, m, y] = k.split('|');
      await this.recomputeBudgetSpent(userId, categoryId, parseInt(m), parseInt(y));
    }

    return this.findById(userId, id);
  },

  /** Bulk delete por série recorrente. scope: 'future' (>= date desta) ou 'all'. */
  async deleteScope(userId: string, id: string, scope: 'future' | 'all') {
    const anchor = await this.findById(userId, id);
    if (!anchor.recurringId) {
      // não é série — degrada para delete normal
      return this.delete(userId, id);
    }

    const where: any = { userId, recurringId: anchor.recurringId };
    if (scope === 'future') where.date = { gte: anchor.date };

    const rows = await prisma.transaction.findMany({
      where, select: { categoryId: true, date: true, type: true },
    });

    await prisma.transaction.deleteMany({ where });

    const buckets = new Set<string>();
    for (const r of rows) {
      if (r.type !== 'EXPENSE') continue;
      const d = new Date(r.date);
      buckets.add(`${r.categoryId}|${d.getUTCMonth() + 1}|${d.getUTCFullYear()}`);
    }
    for (const k of buckets) {
      const [categoryId, m, y] = k.split('|');
      await this.recomputeBudgetSpent(userId, categoryId, parseInt(m), parseInt(y));
    }
  },

  async delete(userId: string, id: string) {
    const t = await this.findById(userId, id);

    if (t.type === 'EXPENSE') {
      const d = new Date(t.date);
      await prisma.budget.updateMany({
        where: { userId, categoryId: t.categoryId, month: d.getUTCMonth() + 1, year: d.getUTCFullYear() },
        data: { spent: { decrement: t.amount } },
      });
    }

    await prisma.transaction.delete({ where: { id } });
  },

  async getSummary(userId: string, month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0) - 1); // último instante do mês em UTC

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
    case 'DAILY':   d.setUTCDate(d.getUTCDate() + count); break;
    case 'WEEKLY':  d.setUTCDate(d.getUTCDate() + count * 7); break;
    case 'MONTHLY': d.setUTCMonth(d.getUTCMonth() + count); break;
    case 'YEARLY':  d.setUTCFullYear(d.getUTCFullYear() + count); break;
  }
  return d;
}
