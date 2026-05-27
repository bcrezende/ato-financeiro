import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProductTour } from '@/components/tour/ProductTour';
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
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-950 overflow-hidden">
      <ProductTour />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {showTrialBanner && (
            <div className={`mb-4 rounded-2xl px-4 py-3 flex items-center justify-between border shadow-sm ${
              trialUrgent
                ? 'bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border-rose-200/60 dark:border-rose-800/60'
                : 'bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-200/60 dark:border-primary-800/60'
            }`}>
              <p className={`text-sm font-medium flex items-center gap-2 ${trialUrgent ? 'text-rose-800 dark:text-rose-300' : 'text-primary-800 dark:text-primary-300'}`}>
                <span className="text-lg">{trialUrgent ? '⚠️' : '🎉'}</span>
                {daysLeft > 0
                  ? <>Período gratuito: <strong className="font-bold">{daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}</strong></>
                  : <strong>Seu período gratuito expirou</strong>
                }
              </p>
              <Link to="/subscription">
                <button className={`flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                  trialUrgent ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary-600 hover:bg-primary-700'
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
