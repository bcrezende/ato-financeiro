import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';

const SALT_ROUNDS = 12;
const MONTHLY_PRICE = 19.9;

export const adminService = {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedError('Credenciais inválidas');
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedError('Credenciais inválidas');

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: 'ADMIN' },
      process.env.ADMIN_JWT_SECRET!,
      { expiresIn: '1d' } as jwt.SignOptions,
    );
    await this.logAction(admin.id, 'LOGIN', null, null, null);
    return { admin: { id: admin.id, name: admin.name, email: admin.email }, token };
  },

  async logAction(adminId: string, action: string, targetType: string | null, targetId: string | null, metadata: any) {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetType: targetType ?? undefined,
        targetId: targetId ?? undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    }).catch(() => {});
  },

  async getMetrics() {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const d7 = new Date(now.getTime() - 7 * 86400000);
    const d30 = new Date(now.getTime() - 30 * 86400000);
    const in7 = new Date(now.getTime() + 7 * 86400000);

    const [
      totalUsers, newToday, new7d, new30d,
      byStatus,
      trialsExpiring,
      transactions, customCategories, budgets, dreamItems,
      activeUserRows,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      prisma.user.count({ where: { createdAt: { gte: d30 } } }),
      prisma.user.groupBy({ by: ['subscriptionStatus'], _count: { _all: true } }),
      prisma.user.count({ where: { subscriptionStatus: 'TRIAL', trialEndsAt: { gte: now, lte: in7 } } }),
      prisma.transaction.count(),
      prisma.category.count({ where: { userId: { not: null } } }),
      prisma.budget.count(),
      prisma.dreamItem.count(),
      prisma.transaction.groupBy({ by: ['userId'], where: { createdAt: { gte: d30 } } }),
    ]);

    const statusCounts: Record<string, number> = {
      TRIAL: 0, ACTIVE: 0, EXPIRED: 0, CANCELED: 0, PAST_DUE: 0,
    };
    for (const row of byStatus) statusCounts[row.subscriptionStatus] = row._count._all;

    return {
      users: { total: totalUsers, today: newToday, last7d: new7d, last30d: new30d, active30d: activeUserRows.length },
      subscriptions: statusCounts,
      mrr: Number((statusCounts.ACTIVE * MONTHLY_PRICE).toFixed(2)),
      trialsExpiring7d: trialsExpiring,
      content: { transactions, customCategories, budgets, dreamItems },
    };
  },

  async getSignups(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    for (const u of users) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (key in buckets) buckets[key]++;
    }
    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  },

  async listUsers(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: any = {};
    if (params.status) where.subscriptionStatus = params.status;
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, subscriptionStatus: true, trialEndsAt: true,
          isBlocked: true, createdAt: true,
          _count: { select: { transactions: true, budgets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  },

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, currency: true, locale: true,
        subscriptionStatus: true, trialEndsAt: true, stripeCustomerId: true,
        isBlocked: true, createdAt: true,
        _count: { select: { transactions: true, budgets: true, categories: true, dreamItems: true } },
        transactions: {
          select: { id: true, description: true, amount: true, type: true, date: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async updateUserSubscription(adminId: string, id: string, data: { subscriptionStatus?: string; trialEndsAt?: string | null }) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundError('User');

    const update: any = {};
    if (data.subscriptionStatus) update.subscriptionStatus = data.subscriptionStatus;
    if (data.trialEndsAt !== undefined) update.trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null;

    const updated = await prisma.user.update({
      where: { id },
      data: update,
      select: { id: true, subscriptionStatus: true, trialEndsAt: true },
    });
    await this.logAction(adminId, 'USER_SUBSCRIPTION_UPDATE', 'USER', id, update);
    return updated;
  },

  async setUserBlocked(adminId: string, id: string, blocked: boolean) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundError('User');
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: blocked },
      select: { id: true, isBlocked: true },
    });
    if (blocked) await prisma.refreshToken.deleteMany({ where: { userId: id } });
    await this.logAction(adminId, blocked ? 'USER_BLOCK' : 'USER_UNBLOCK', 'USER', id, null);
    return updated;
  },

  async deleteUser(adminId: string, id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
    if (!user) throw new NotFoundError('User');
    await prisma.user.delete({ where: { id } });
    await this.logAction(adminId, 'USER_DELETE', 'USER', id, { email: user.email });
  },

  async listAdmins() {
    return prisma.admin.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async createAdmin(adminId: string, data: { name: string; email: string; password: string }) {
    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Já existe um admin com este email');
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const admin = await prisma.admin.create({
      data: { name: data.name, email: data.email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    await this.logAction(adminId, 'ADMIN_CREATE', 'ADMIN', admin.id, { email: admin.email });
    return admin;
  },

  async listSuggestions(params: { status?: string; category?: string; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.category) where.category = params.category;

    const [total, byStatus, suggestions] = await Promise.all([
      prisma.suggestion.count({ where }),
      prisma.suggestion.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.suggestion.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const counts: Record<string, number> = { PENDING: 0, REVIEWED: 0, IMPLEMENTED: 0, DECLINED: 0 };
    for (const row of byStatus) counts[row.status] = row._count._all;

    return {
      data: suggestions,
      counts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateSuggestion(adminId: string, id: string, data: { status?: string; adminNote?: string | null }) {
    const suggestion = await prisma.suggestion.findUnique({ where: { id } });
    if (!suggestion) throw new NotFoundError('Suggestion');

    const update: any = {};
    if (data.status) update.status = data.status;
    if (data.adminNote !== undefined) update.adminNote = data.adminNote;

    const updated = await prisma.suggestion.update({
      where: { id },
      data: update,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await this.logAction(adminId, 'SUGGESTION_UPDATE', 'SUGGESTION', id, update);
    return updated;
  },

  async deleteSuggestion(adminId: string, id: string) {
    const suggestion = await prisma.suggestion.findUnique({ where: { id }, select: { id: true } });
    if (!suggestion) throw new NotFoundError('Suggestion');
    await prisma.suggestion.delete({ where: { id } });
    await this.logAction(adminId, 'SUGGESTION_DELETE', 'SUGGESTION', id, null);
  },

  async listAudit(page = 1, limit = 50) {
    const take = Math.min(limit, 100);
    const [total, logs] = await Promise.all([
      prisma.adminAuditLog.count(),
      prisma.adminAuditLog.findMany({
        include: { admin: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
    ]);
    return { data: logs, pagination: { total, page, limit: take, totalPages: Math.ceil(total / take) } };
  },
};
