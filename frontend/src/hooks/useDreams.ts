import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export interface Dream {
  id: string;
  imageData: string;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'wide' | 'tall';
  createdAt: string;
}

export const useDreams = () =>
  useQuery({
    queryKey: ['dreams'],
    queryFn: async () => {
      const res = await api.get('/dreams');
      return res.data.data as Dream[];
    },
  });

export const useCreateDream = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { imageData: string; title: string; size: string }) => {
      const res = await api.post('/dreams', data);
      return res.data.data as Dream;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dreams'] }),
  });
};

export const useDeleteDream = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/dreams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dreams'] }),
  });
};
