import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { CategoryType } from '@/types';
import toast from 'react-hot-toast';

export const CATEGORY_KEYS = {
  all: ['categories'] as const,
};

export const useCategories = () =>
  useQuery({ queryKey: CATEGORY_KEYS.all, queryFn: categoryService.getAll });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color: string; icon: string; type: CategoryType }) =>
      categoryService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all }); toast.success('Categoria criada!'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao criar categoria'),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all }); toast.success('Categoria atualizada!'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao atualizar'),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all }); toast.success('Categoria removida!'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Não é possível remover categoria em uso'),
  });
};
