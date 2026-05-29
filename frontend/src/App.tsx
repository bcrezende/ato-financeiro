import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DreamBoardPage } from '@/pages/DreamBoardPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { GoalDetailPage } from '@/pages/GoalDetailPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { SubscriptionSuccessPage } from '@/pages/SubscriptionSuccessPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { LandingPage } from '@/pages/LandingPage';
import { useAuthStore } from '@/store/auth.store';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';
import { AdminsPage } from '@/pages/admin/AdminsPage';
import { AuditLogPage } from '@/pages/admin/AuditLogPage';
import { AdminSuggestionsPage } from '@/pages/admin/AdminSuggestionsPage';

const HomeRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin (isolado do app de usuário) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        <Route path="/admin/admins" element={<AdminsPage />} />
        <Route path="/admin/suggestions" element={<AdminSuggestionsPage />} />
        <Route path="/admin/audit" element={<AuditLogPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dream-board" element={<DreamBoardPage />} />
        <Route path="/metas" element={<GoalsPage />} />
        <Route path="/metas/:id" element={<GoalDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
