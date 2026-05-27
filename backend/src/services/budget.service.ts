import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

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

    // Spent calculado a partir das despesas do mês (range em UTC, consistente com as datas ancoradas ao meio-dia UTC)
    const startDate = new Date(Date.UTC(data.year, data.month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(data.year, data.month, 1, 0, 0, 0) - 1);
    const spentAgg = await prisma.transaction.aggregate({
      where: { userId, categoryId: data.categoryId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });
    const spent = spentAgg._sum.amount ?? 0;

    // Upsert: se já existe orçamento para esta categoria/mês/ano, atualiza em vez de dar erro.
    return prisma.budget.upsert({
      where: { userId_categoryId_month_year: { userId, categoryId: data.categoryId, month: data.month, year: data.year } },
      create: { ...data, userId, spent },
      update: { name: data.name, amount: data.amount, alertAt: data.alertAt, spent },
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

  async listMonths(userId: string) {
    const grouped = await prisma.budget.groupBy({
      by: ['month', 'year'],
      where: { userId },
      _count: { _all: true },
    });
    return grouped
      .map((g) => ({ month: g.month, year: g.year, count: g._count._all }))
      .sort((a, b) => a.year - b.year || a.month - b.month);
  },

  async getAlerts(userId: string) {
    const now = new Date();
    const budgets = await this.findAll(userId, now.getMonth() + 1, now.getFullYear());
    return budgets.filter((b) => b.isAlerted || b.isOverBudget);
  },
};
