import api from './api';
import { Transaction, TransactionFilters, MonthlySummary, MonthlyEvolution, CategoryBreakdown } from '@/types';

export const transactionService = {
  getAll: (filters: TransactionFilters = {}) =>
    api.get('/transactions', { params: filters }).then((r) => ({
      data: r.data.data as Transaction[],
      pagination: r.data.pagination,
    })),

  getById: (id: string) =>
    api.get(`/transactions/${id}`).then((r) => r.data.data as Transaction),

  create: (data: Omit<Transaction, 'id' | 'category' | 'createdAt'> & { categoryId: string }) =>
    api.post('/transactions', data).then((r) => r.data.data as Transaction),

  update: (id: string, data: Partial<Transaction>) =>
    api.put(`/transactions/${id}`, data).then((r) => r.data.data as Transaction),

  delete: (id: string) =>
    api.delete(`/transactions/${id}`),

  getSummary: (month?: number, year?: number) =>
    api.get('/transactions/summary', { params: { month, year } }).then((r) => r.data.data as MonthlySummary),

  getByCategory: (startDate?: string, endDate?: string) =>
    api.get('/transactions/by-category', { params: { startDate, endDate } }).then((r) => r.data.data as CategoryBreakdown[]),

  getMonthlyEvolution: (months = 12) =>
    api.get('/transactions/monthly-evolution', { params: { months } }).then((r) => r.data.data as MonthlyEvolution[]),

  exportExcel: (filters: { startDate?: string; endDate?: string } = {}) =>
    api.get('/transactions/export/excel', { params: filters, responseType: 'blob' }),

  exportCsv: (filters: { startDate?: string; endDate?: string } = {}) =>
    api.get('/transactions/export/csv', { params: filters, responseType: 'blob' }),
};
