import api from './api';
import { User } from '@/types';

export const authService = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data.data as User),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data.data as { user: User; accessToken: string; refreshToken: string }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  getProfile: () =>
    api.get('/auth/profile').then((r) => r.data.data as User),

  updateProfile: (data: { name?: string; currency?: string; locale?: string }) =>
    api.put('/auth/profile', data).then((r) => r.data.data as User),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};
