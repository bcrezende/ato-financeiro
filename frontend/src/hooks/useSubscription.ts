import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

export const useSubscriptionStatus = () =>
  useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await api.get('/subscription/status');
      return res.data.data as { subscriptionStatus: string; trialEndsAt: string | null; daysLeft: number | null };
    },
    staleTime: 60_000,
  });

export const useCheckout = () =>
  useMutation({
    mutationFn: async () => {
      const res = await api.post('/subscription/checkout');
      return res.data.data as { url: string };
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => toast.error('Erro ao iniciar pagamento'),
  });

export const useBillingPortal = () =>
  useMutation({
    mutationFn: async () => {
      const res = await api.post('/subscription/portal');
      return res.data.data as { url: string };
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => toast.error('Erro ao abrir portal de cobrança'),
  });
