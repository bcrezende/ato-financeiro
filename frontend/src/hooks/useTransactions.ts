import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';
import { TransactionFilters } from '@/types';
import toast from 'react-hot-toast';

export const TRANSACTION_KEYS = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
  detail: (id: string) => ['transactions', id] as const,
  summary: (month?: number, year?: number) => ['transactions', 'summary', month, year] as const,
  byCategory: (start?: string, end?: string) => ['transactions', 'byCategory', start, end] as const,
  evolution: (months?: number) => ['transactions', 'evolution', months] as const,
};

export const useTransactions = (filters: TransactionFilters = {}) =>
  useQuery({
    queryKey: TRANSACTION_KEYS.list(filters),
    queryFn: () => transactionService.getAll(filters),
    placeholderData: (prev) => prev,
  });

export const useTransactionSummary = (month?: number, year?: number) =>
  useQuery({
    queryKey: TRANSACTION_KEYS.summary(month, year),
    queryFn: () => transactionService.getSummary(month, year),
  });

export const useTransactionsByCategory = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: TRANSACTION_KEYS.byCategory(startDate, endDate),
    queryFn: () => transactionService.getByCategory(startDate, endDate),
  });

export const useMonthlyEvolution = (months = 12) =>
  useQuery({
    queryKey: TRANSACTION_KEYS.evolution(months),
    queryFn: () => transactionService.getMonthlyEvolution(months),
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      toast.success('Transação criada com sucesso!');
    },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao criar transação'),
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      toast.success('Transação atualizada!');
    },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao atualizar'),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      toast.success('Transação removida!');
    },
    onError: () => toast.error('Erro ao remover transação'),
  });
};

export const useExportTransactions = () =>
  useMutation({
    mutationFn: async ({ format, filters }: { format: 'excel' | 'csv'; filters?: any }) => {
      const res = format === 'excel'
        ? await transactionService.exportExcel(filters)
        : await transactionService.exportCsv(filters);
      const { downloadBlob } = await import('../utils/format');
      const ext = format === 'excel' ? 'xlsx' : 'csv';
      downloadBlob(res.data, `transacoes-${Date.now()}.${ext}`);
    },
    onSuccess: () => toast.success('Exportação iniciada!'),
    onError: () => toast.error('Erro ao exportar'),
  });
