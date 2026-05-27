import api from './api';
import { Budget } from '@/types';

export const budgetService = {
  getAll: (month?: number, year?: number) =>
    api.get('/budgets', { params: { month, year } }).then((r) => r.data.data as Budget[]),

  create: (data: { name: string; amount: number; categoryId: string; month: number; year: number; alertAt?: number }) =>
    api.post('/budgets', data).then((r) => r.data.data as Budget),

  update: (id: string, data: { name?: string; amount?: number; alertAt?: number }) =>
    api.put(`/budgets/${id}`, data).then((r) => r.data.data as Budget),

  delete: (id: string) =>
    api.delete(`/budgets/${id}`),

  getAlerts: () =>
    api.get('/budgets/alerts').then((r) => r.data.data as Budget[]),

  getMonths: () =>
    api.get('/budgets/months').then((r) => r.data.data as { month: number; year: number; count: number }[]),
};
