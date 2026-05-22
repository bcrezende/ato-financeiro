import api from './api';
import { Category, CategoryType } from '@/types';

export const categoryService = {
  getAll: () =>
    api.get('/categories').then((r) => r.data.data as Category[]),

  create: (data: { name: string; color: string; icon: string; type: CategoryType }) =>
    api.post('/categories', data).then((r) => r.data.data as Category),

  update: (id: string, data: { name?: string; color?: string; icon?: string }) =>
    api.put(`/categories/${id}`, data).then((r) => r.data.data as Category),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};
