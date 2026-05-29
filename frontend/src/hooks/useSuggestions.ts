import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import adminApi from '@/services/adminApi';

export type SuggestionCategory = 'FEATURE' | 'BUG' | 'IMPROVEMENT' | 'OTHER';
export type SuggestionStatus = 'PENDING' | 'REVIEWED' | 'IMPLEMENTED' | 'DECLINED';

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  title: string | null;
  content: string;
  status: SuggestionStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSuggestion extends Suggestion {
  user: { id: string; name: string; email: string };
}

// ──────────────── USER HOOKS ────────────────

export const useMySuggestions = () =>
  useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => (await api.get('/suggestions')).data.data as Suggestion[],
  });

export const useCreateSuggestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; title?: string; category?: SuggestionCategory }) => {
      const res = await api.post('/suggestions', data);
      return res.data.data as Suggestion;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suggestions'] }),
  });
};

export const useDeleteMySuggestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/suggestions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suggestions'] }),
  });
};

// ──────────────── ADMIN HOOKS ────────────────

export interface AdminSuggestionsResponse {
  data: AdminSuggestion[];
  counts: Record<SuggestionStatus, number>;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const useAdminSuggestions = (params: { status?: string; category?: string; page?: number }) =>
  useQuery({
    queryKey: ['admin', 'suggestions', params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.status) qs.set('status', params.status);
      if (params.category) qs.set('category', params.category);
      qs.set('page', String(params.page ?? 1));
      const res = await adminApi.get(`/admin/suggestions?${qs.toString()}`);
      return res.data as AdminSuggestionsResponse;
    },
  });

export const useUpdateAdminSuggestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status?: SuggestionStatus; adminNote?: string | null } }) =>
      (await adminApi.patch(`/admin/suggestions/${id}`, data)).data.data as AdminSuggestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suggestions'] }),
  });
};

export const useDeleteAdminSuggestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/admin/suggestions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suggestions'] }),
  });
};
