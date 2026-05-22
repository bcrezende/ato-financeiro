import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: { id: string; email: string; name: string };
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE';
  minAmount?: string;
  maxAmount?: string;
  search?: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  month: { income: number; expense: number; balance: number };
  recentTransactions: any[];
  topCategories: { categoryId: string; name: string; color: string; total: number }[];
}
