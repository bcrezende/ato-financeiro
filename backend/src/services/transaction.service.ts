import { Prisma } from '@prisma/client';
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
  }) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { isDefault: true }] },
    });
    if (!category) throw new NotFoundError('Category');

    const transaction = await prisma.transaction.create({
      data: { ...data, userId, amount: new Prisma.Decimal(data.amount) },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });

    // Update budget spent if expense
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
    const where: Prisma.TransactionWhereInput = { userId };

    if (filters.startDate) where.date = { ...((where.date as any) || {}), gte: new Date(filters.startDate) };
    if (filters.endDate) where.date = { ...((where.date as any) || {}), lte: new Date(filters.endDate) };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.type) where.type = filters.type;
    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) (where.amount as any).gte = new Prisma.Decimal(filters.minAmount);
      if (filters.maxAmount) (where.amount as any).lte = new Prisma.Decimal(filters.maxAmount);
    }
    if (filters.search) {
      where.description = { contains: filters.search, mode: 'insensitive' };
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

  async update(userId: string, id: string, data: Partial<{
    description: string; amount: number; type: 'INCOME' | 'EXPENSE';
    date: Date; categoryId: string; notes: string; isRecurring: boolean;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  }>) {
    const existing = await this.findById(userId, id);

    // Reverse old budget impact
    if (existing.type === 'EXPENSE') {
      const d = new Date(existing.date);
      await prisma.budget.updateMany({
        where: { userId, categoryId: existing.categoryId, month: d.getMonth() + 1, year: d.getFullYear() },
        data: { spent: { decrement: Number(existing.amount) } },
      });
    }

    const updateData: Prisma.TransactionUpdateInput = { ...data };
    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });

    // Apply new budget impact
    const newType = data.type ?? existing.type;
    const newAmount = data.amount ?? Number(existing.amount);
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
        data: { spent: { decrement: Number(t.amount) } },
      });
    }

    await prisma.transaction.delete({ where: { id } });
  },

  async getSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expense = Number(expenseAgg._sum.amount ?? 0);
    return { income, expense, balance: income - expense };
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
      total: Number(r._sum.amount ?? 0),
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
