import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/store/auth.store';
import { useSubscriptionStatus } from '@/hooks/useSubscription';

export const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const { data: subStatus } = useSubscriptionStatus();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Block access if expired/canceled
  const blocked = subStatus && !['TRIAL', 'ACTIVE'].includes(subStatus.subscriptionStatus);
  if (blocked) return <Navigate to="/subscription" replace />;

  // Also block if TRIAL but expired (daysLeft === 0 and status is EXPIRED after backend auto-updates)
  const isTrial = subStatus?.subscriptionStatus === 'TRIAL';
  const daysLeft = subStatus?.daysLeft ?? 0;
  const showTrialBanner = isTrial;
  const trialUrgent = daysLeft <= 7;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {showTrialBanner && (
            <div className={`mb-4 rounded-xl px-4 py-3 flex items-center justify-between border ${
              trialUrgent
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <p className={`text-sm font-medium ${trialUrgent ? 'text-red-800 dark:text-red-400' : 'text-blue-800 dark:text-blue-400'}`}>
                {trialUrgent ? '⚠️' : '🎉'}{' '}
                {daysLeft > 0
                  ? <>Período gratuito: <strong>{daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}</strong></>
                  : <strong>Seu período gratuito expirou</strong>
                }
              </p>
              <Link to="/subscription">
                <button className={`flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${
                  trialUrgent ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}>
                  <Zap className="w-3 h-3" />
                  Assinar agora
                </button>
              </Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
