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
  evolution: (opts?: object) => ['transactions', 'evolution', opts] as const,
};

export interface EvolutionOpts {
  months?: number;
  fromMonth?: number;
  fromYear?: number;
  toMonth?: number;
  toYear?: number;
}

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

export const useMonthlyEvolution = (opts: EvolutionOpts | number = 12) => {
  const params: EvolutionOpts = typeof opts === 'number' ? { months: opts } : opts;
  return useQuery({
    queryKey: TRANSACTION_KEYS.evolution(params),
    queryFn: () => transactionService.getMonthlyEvolution(params),
  });
};

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
    mutationFn: ({ id, data, scope }: { id: string; data: any; scope?: 'this' | 'future' | 'all' }) =>
      transactionService.update(id, data, scope),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      const msg = vars.scope === 'future' ? 'Esta e as próximas parcelas atualizadas!'
        : vars.scope === 'all' ? 'Todas as parcelas atualizadas!'
        : 'Transação atualizada!';
      toast.success(msg);
    },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao atualizar'),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope?: 'this' | 'future' | 'all' }) =>
      transactionService.delete(id, scope),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      const msg = vars.scope === 'future' ? 'Esta e as próximas parcelas removidas!'
        : vars.scope === 'all' ? 'Todas as parcelas removidas!'
        : 'Transação removida!';
      toast.success(msg);
    },
    onError: () => toast.error('Erro ao remover transação'),
  });
};

export const useGenerateNextTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionService.generateNext(id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      toast.success(result.alreadyExisted ? 'A próxima parcela já existia.' : 'Próxima parcela gerada!');
    },
    onError: () => toast.error('Erro ao gerar próxima parcela'),
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
