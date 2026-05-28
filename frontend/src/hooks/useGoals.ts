import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goal.service';
import toast from 'react-hot-toast';

export const GOAL_KEYS = {
  all: ['goals'] as const,
  list: ['goals', 'list'] as const,
  detail: (id: string) => ['goals', 'detail', id] as const,
};

export const useGoals = () =>
  useQuery({ queryKey: GOAL_KEYS.list, queryFn: goalService.list });

export const useGoal = (id: string | undefined) =>
  useQuery({
    queryKey: GOAL_KEYS.detail(id ?? ''),
    queryFn: () => goalService.getById(id!),
    enabled: !!id,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOAL_KEYS.all });
      toast.success('Meta criada!');
    },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao criar meta'),
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => goalService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOAL_KEYS.all }),
    onError: () => toast.error('Erro ao atualizar meta'),
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOAL_KEYS.all });
      toast.success('Meta removida');
    },
    onError: () => toast.error('Erro ao remover'),
  });
};

export const useAddStep = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => goalService.addStep(goalId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOAL_KEYS.all }),
  });
};

export const useToggleStep = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, isDone }: { stepId: string; isDone: boolean }) =>
      goalService.updateStep(goalId, stepId, { isDone }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: GOAL_KEYS.all });
      if (res.goalCompleted) toast.success('🎉 Meta concluída! Parabéns!', { duration: 5000 });
    },
  });
};

export const useDeleteStep = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => goalService.removeStep(goalId, stepId),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOAL_KEYS.all }),
  });
};

export const useAddContribution = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; note?: string; date?: string }) =>
      goalService.addContribution(goalId, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: GOAL_KEYS.all });
      toast.success(res.goalCompleted ? '🎉 Meta concluída! Parabéns!' : 'Aporte registrado!', {
        duration: res.goalCompleted ? 5000 : 2500,
      });
    },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao adicionar aporte'),
  });
};

export const useDeleteContribution = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contribId: string) => goalService.removeContribution(goalId, contribId),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOAL_KEYS.all }),
  });
};
