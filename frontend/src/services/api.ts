import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Backend now enforces subscription server-side. If access lapses mid-session,
    // the API returns 402 SUBSCRIPTION_REQUIRED — route the user to the paywall.
    if (error.response?.status === 402 && error.response?.data?.error?.code === 'SUBSCRIPTION_REQUIRED') {
      if (window.location.pathname !== '/subscription') {
        window.location.href = '/subscription';
      }
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const { refreshToken, setTokens, logout } = useAuthStore.getState();
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`, { refreshToken });
      const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
      setTokens(newAccess, newRefresh);
      processQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (err) {
      processQueue(err);
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
