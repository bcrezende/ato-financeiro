import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '@/services/budget.service';
import toast from 'react-hot-toast';

export const BUDGET_KEYS = {
  all: ['budgets'] as const,
  list: (month?: number, year?: number) => ['budgets', 'list', month, year] as const,
  alerts: ['budgets', 'alerts'] as const,
};

export const useBudgets = (month?: number, year?: number) =>
  useQuery({
    queryKey: BUDGET_KEYS.list(month, year),
    queryFn: () => budgetService.getAll(month, year),
  });

export const useBudgetAlerts = () =>
  useQuery({ queryKey: BUDGET_KEYS.alerts, queryFn: budgetService.getAlerts });

export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: BUDGET_KEYS.all }); toast.success('Orçamento criado!'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao criar orçamento'),
  });
};

export const useUpdateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => budgetService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BUDGET_KEYS.all }); toast.success('Orçamento atualizado!'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao atualizar'),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: BUDGET_KEYS.all }); toast.success('Orçamento removido!'); },
    onError: () => toast.error('Erro ao remover orçamento'),
  });
};
