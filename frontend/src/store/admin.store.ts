import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
}

interface AdminState {
  admin: AdminInfo | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  setAdminAuth: (admin: AdminInfo, token: string) => void;
  logoutAdmin: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      adminToken: null,
      isAdminAuthenticated: false,
      setAdminAuth: (admin, adminToken) => set({ admin, adminToken, isAdminAuthenticated: true }),
      logoutAdmin: () => set({ admin: null, adminToken: null, isAdminAuthenticated: false }),
    }),
    {
      name: 'ato-admin-auth',
      partialize: (s) => ({ admin: s.admin, adminToken: s.adminToken, isAdminAuthenticated: s.isAdminAuthenticated }),
    },
  ),
);
