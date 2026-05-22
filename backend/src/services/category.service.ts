import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export const categoryService = {
  async findAll(userId: string) {
    return prisma.category.findMany({
      where: { OR: [{ userId }, { isDefault: true, userId: null }] },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  },

  async create(userId: string, data: { name: string; color: string; icon: string; type: string }) {
    const exists = await prisma.category.findFirst({
      where: { name: data.name, userId },
    });
    if (exists) throw new ConflictError(`Category "${data.name}" already exists`);

    return prisma.category.create({ data: { ...data, userId } });
  },

  async update(userId: string, id: string, data: { name?: string; color?: string; icon?: string }) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Category');
    if (cat.isDefault) throw new ForbiddenError('Cannot modify default categories');
    if (cat.userId !== userId) throw new ForbiddenError();

    return prisma.category.update({ where: { id }, data });
  },

  async delete(userId: string, id: string) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Category');
    if (cat.isDefault) throw new ForbiddenError('Cannot delete default categories');
    if (cat.userId !== userId) throw new ForbiddenError();

    const inUse = await prisma.transaction.count({ where: { categoryId: id } });
    if (inUse > 0) throw new ConflictError('Category is in use by transactions');

    await prisma.category.delete({ where: { id } });
  },
};
