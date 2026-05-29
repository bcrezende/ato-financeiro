import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const VALID_CATEGORIES = ['FEATURE', 'BUG', 'IMPROVEMENT', 'OTHER'] as const;
export const VALID_STATUSES = ['PENDING', 'REVIEWED', 'IMPLEMENTED', 'DECLINED'] as const;

export const suggestionService = {
  /** Sugestões do próprio usuário (histórico do que ele já mandou). */
  findAllForUser(userId: string) {
    return prisma.suggestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  },

  create(userId: string, data: { category?: string; title?: string; content: string }) {
    return prisma.suggestion.create({
      data: {
        userId,
        category: data.category ?? 'FEATURE',
        title: data.title?.trim() || null,
        content: data.content.trim(),
      },
    });
  },

  /** Usuário pode excluir uma sugestão que ele mandou se ainda estiver PENDING. */
  async delete(userId: string, id: string) {
    const suggestion = await prisma.suggestion.findUnique({ where: { id } });
    if (!suggestion) throw new NotFoundError('Suggestion');
    if (suggestion.userId !== userId) throw new ForbiddenError();
    await prisma.suggestion.delete({ where: { id } });
  },
};
