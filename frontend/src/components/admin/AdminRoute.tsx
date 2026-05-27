import { Navigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin.store';
import { AdminLayout } from './AdminLayout';

export const AdminRoute = () => {
  const { isAdminAuthenticated } = useAdminStore();
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return <AdminLayout />;
};
