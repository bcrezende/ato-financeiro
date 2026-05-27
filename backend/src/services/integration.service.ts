import prisma from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';
import { normalizePhone } from '../utils/phone';
import { transactionService } from './transaction.service';

/** Resolve o usuário pelo telefone (normalizado) e garante que pode usar o produto. */
async function resolveUser(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new AppError('Telefone inválido', 400, 'INVALID_PHONE');

  const user = await prisma.user.findUnique({
    where: { phone: normalized },
    select: { id: true, name: true, isBlocked: true, subscriptionStatus: true, trialEndsAt: true },
  });
  if (!user) throw new AppError('Número não cadastrado. Cadastre seu telefone no perfil do Ato.', 404, 'PHONE_NOT_REGISTERED');
  if (user.isBlocked) throw new AppError('Conta suspensa.', 403, 'BLOCKED');

  let status = user.subscriptionStatus;
  if (status === 'TRIAL' && user.trialEndsAt && user.trialEndsAt < new Date()) {
    await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: 'EXPIRED' } });
    status = 'EXPIRED';
  }
  if (status !== 'ACTIVE' && status !== 'TRIAL') {
    throw new AppError('Assinatura inativa. Renove para continuar usando o Ato.', 402, 'SUBSCRIPTION_REQUIRED');
  }
  return user;
}

/** Acha a categoria por nome (aprox.) ou cai no "Outros" padrão do tipo. */
async function resolveCategory(userId: string, type: 'INCOME' | 'EXPENSE', name?: string) {
  const categories = await prisma.category.findMany({
    where: { type, OR: [{ userId }, { isDefault: true }] },
    select: { id: true, name: true, isDefault: true },
  });

  if (name) {
    const q = name.trim().toLowerCase();
    const exact = categories.find((c) => c.name.toLowerCase() === q);
    if (exact) return exact;
    const partial = categories.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()));
    if (partial) return partial;
  }

  const fallbackName = type === 'INCOME' ? 'outros (receita)' : 'outros (despesa)';
  const fallback = categories.find((c) => c.name.toLowerCase() === fallbackName)
    ?? categories.find((c) => c.isDefault)
    ?? categories[0];
  if (!fallback) throw new NotFoundError('Category');
  return fallback;
}

/** Data: usa a passada (YYYY-MM-DD) ou o dia atual no horário de Brasília, ancorado ao meio-dia UTC. */
function resolveDate(dateStr?: string): Date {
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T12:00:00.000Z`);
  }
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate(), 12, 0, 0));
}

export const integrationService = {
  async createTransaction(input: {
    phone: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    category?: string;
    date?: string;
    status?: 'PAID' | 'PENDING';
  }) {
    const user = await resolveUser(input.phone);
    const category = await resolveCategory(user.id, input.type, input.category);

    const tx = await transactionService.create(user.id, {
      description: input.description,
      amount: input.amount,
      type: input.type,
      date: resolveDate(input.date),
      categoryId: category.id,
      status: input.status ?? 'PAID',
    });

    return {
      id: tx.id,
      user: user.name,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: category.name,
      date: tx.date,
      status: tx.status,
    };
  },

  async getSummary(phone: string, month?: number, year?: number) {
    const user = await resolveUser(phone);
    const now = new Date(Date.now() - 3 * 60 * 60 * 1000); // referência Brasília
    const m = month ?? now.getUTCMonth() + 1;
    const y = year ?? now.getUTCFullYear();
    const summary = await transactionService.getSummary(user.id, m, y);
    return { user: user.name, month: m, year: y, ...summary };
  },

  async listCategories(phone: string) {
    const user = await resolveUser(phone);
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: user.id }, { isDefault: true }] },
      select: { name: true, type: true },
      orderBy: { name: 'asc' },
    });
    return { user: user.name, categories };
  },
};
