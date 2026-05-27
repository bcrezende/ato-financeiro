import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const dreamService = {
  findAll(userId: string) {
    return prisma.dreamItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  },

  create(userId: string, data: { imageData: string; title?: string; size?: string }) {
    return prisma.dreamItem.create({
      data: {
        userId,
        imageData: data.imageData,
        title: data.title ?? '',
        size: data.size ?? 'sm',
      },
    });
  },

  async delete(userId: string, id: string) {
    const item = await prisma.dreamItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Dream');
    if (item.userId !== userId) throw new ForbiddenError();
    await prisma.dreamItem.delete({ where: { id } });
  },
};
