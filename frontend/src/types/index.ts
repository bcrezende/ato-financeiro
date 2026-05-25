export type TransactionType = 'INCOME' | 'EXPENSE';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  currency: string;
  locale: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
  isDefault: boolean;
  userId?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
  notes?: string;
  isRecurring: boolean;
  frequency?: RecurrenceFreq;
  installments?: number;
  installmentNumber?: number;
  recurringId?: string;
  status?: 'PAID' | 'PENDING';
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isAlerted: boolean;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
  month: number;
  year: number;
  alertAt: number;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
  caixa?: number;
}

export interface MonthlyEvolution {
  month: number;
  year: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  type: TransactionType;
  total: number;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  minAmount?: string;
  maxAmount?: string;
  search?: string;
  page?: number;
  limit?: number;
}
