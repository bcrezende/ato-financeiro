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

  update: (id: string, data: Partial<Transaction>, scope?: 'this' | 'future' | 'all') =>
    api.put(`/transactions/${id}`, data, { params: scope && scope !== 'this' ? { scope } : undefined })
      .then((r) => r.data.data as Transaction),

  delete: (id: string, scope?: 'this' | 'future' | 'all') =>
    api.delete(`/transactions/${id}`, { params: scope && scope !== 'this' ? { scope } : undefined }),

  generateNext: (id: string) =>
    api.post(`/transactions/${id}/generate-next`)
      .then((r) => r.data.data as { transaction: Transaction; alreadyExisted: boolean }),

  getSummary: (month?: number, year?: number) =>
    api.get('/transactions/summary', { params: { month, year } }).then((r) => r.data.data as MonthlySummary),

  getByCategory: (startDate?: string, endDate?: string) =>
    api.get('/transactions/by-category', { params: { startDate, endDate } }).then((r) => r.data.data as CategoryBreakdown[]),

  getMonthlyEvolution: (opts: { months?: number; fromMonth?: number; fromYear?: number; toMonth?: number; toYear?: number } = {}) =>
    api.get('/transactions/monthly-evolution', { params: opts }).then((r) => r.data.data as MonthlyEvolution[]),

  exportExcel: (filters: { startDate?: string; endDate?: string } = {}) =>
    api.get('/transactions/export/excel', { params: filters, responseType: 'blob' }),

  exportCsv: (filters: { startDate?: string; endDate?: string } = {}) =>
    api.get('/transactions/export/csv', { params: filters, responseType: 'blob' }),

  generateReport: (
    filters: TransactionFilters,
    reportType: 'category-sintetico' | 'category-analitico',
    format: 'pdf' | 'excel',
  ) =>
    api.post('/transactions/report', { filters, reportType, format }, { responseType: 'blob' }),
};
