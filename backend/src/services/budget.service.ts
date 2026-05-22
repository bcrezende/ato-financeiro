import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export const budgetService = {
  async findAll(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: { userId, month: m, year: y },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return budgets.map((b) => ({
      ...b,
      remaining: Math.max(0, b.amount - b.spent),
      percentage: b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0,
      isOverBudget: b.spent > b.amount,
      isAlerted: b.amount > 0 && (b.spent / b.amount) * 100 >= b.alertAt,
    }));
  },

  async create(userId: string, data: {
    name: string;
    amount: number;
    categoryId: string;
    month: number;
    year: number;
    alertAt?: number;
  }) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { isDefault: true }] },
    });
    if (!category) throw new NotFoundError('Category');

    const exists = await prisma.budget.findFirst({
      where: { userId, categoryId: data.categoryId, month: data.month, year: data.year },
    });
    if (exists) throw new ConflictError('Budget for this category/month/year already exists');

    const startDate = new Date(data.year, data.month - 1, 1);
    const endDate = new Date(data.year, data.month, 0, 23, 59, 59);
    const spent = await prisma.transaction.aggregate({
      where: { userId, categoryId: data.categoryId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });

    return prisma.budget.create({
      data: { ...data, userId, spent: spent._sum.amount ?? 0 },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
  },

  async update(userId: string, id: string, data: { name?: string; amount?: number; alertAt?: number }) {
    const budget = await prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundError('Budget');
    if (budget.userId !== userId) throw new ForbiddenError();

    return prisma.budget.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
  },

  async delete(userId: string, id: string) {
    const budget = await prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundError('Budget');
    if (budget.userId !== userId) throw new ForbiddenError();
    await prisma.budget.delete({ where: { id } });
  },

  async getAlerts(userId: string) {
    const now = new Date();
    const budgets = await this.findAll(userId, now.getMonth() + 1, now.getFullYear());
    return budgets.filter((b) => b.isAlerted || b.isOverBudget);
  },
};
