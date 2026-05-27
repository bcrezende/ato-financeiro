import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/services/adminApi';

export interface AdminMetrics {
  users: { total: number; today: number; last7d: number; last30d: number; active30d: number };
  subscriptions: { TRIAL: number; ACTIVE: number; EXPIRED: number; CANCELED: number; PAST_DUE: number };
  mrr: number;
  trialsExpiring7d: number;
  content: { transactions: number; customCategories: number; budgets: number; dreamItems: number };
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  isBlocked: boolean;
  createdAt: string;
  _count: { transactions: number; budgets: number };
}

export const useAdminMetrics = () =>
  useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => (await adminApi.get('/admin/metrics')).data.data as AdminMetrics,
  });

export const useAdminSignups = (days = 30) =>
  useQuery({
    queryKey: ['admin', 'signups', days],
    queryFn: async () => (await adminApi.get(`/admin/metrics/signups?days=${days}`)).data.data as { date: string; count: number }[],
  });

export const useAdminUsers = (params: { search?: string; status?: string; page?: number }) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.status) qs.set('status', params.status);
      qs.set('page', String(params.page ?? 1));
      const res = await adminApi.get(`/admin/users?${qs.toString()}`);
      return res.data as { data: AdminUserRow[]; pagination: { total: number; page: number; totalPages: number } };
    },
  });

export const useAdminUser = (id: string | undefined) =>
  useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => (await adminApi.get(`/admin/users/${id}`)).data.data,
    enabled: !!id,
  });

export const useUpdateUserSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { subscriptionStatus?: string; trialEndsAt?: string | null } }) =>
      (await adminApi.patch(`/admin/users/${id}/subscription`, data)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
};

export const useToggleUserBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, blocked }: { id: string; blocked: boolean }) =>
      (await adminApi.patch(`/admin/users/${id}/block`, { blocked })).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
};

export const useAdmins = () =>
  useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: async () => (await adminApi.get('/admin/admins')).data.data as { id: string; name: string; email: string; createdAt: string }[],
  });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) =>
      (await adminApi.post('/admin/admins', data)).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'admins'] }),
  });
};

export const useAuditLog = (page = 1) =>
  useQuery({
    queryKey: ['admin', 'audit', page],
    queryFn: async () => {
      const res = await adminApi.get(`/admin/audit?page=${page}`);
      return res.data as { data: any[]; pagination: { total: number; page: number; totalPages: number } };
    },
  });
