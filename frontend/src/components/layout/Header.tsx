import { Menu, Bell, Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { useBudgetAlerts } from '@/hooks/useBudgets';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export const Header = ({ onMenuToggle, darkMode, onToggleDark }: HeaderProps) => {
  const { user, refreshToken, logout } = useAuthStore();
  const [showUser, setShowUser] = useState(false);
  const { data: alerts = [] } = useBudgetAlerts();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!showUser) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showUser]);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      logout();
      navigate('/login');
      toast.success('Sessão encerrada');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Alternar tema"
        >
          {darkMode
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Alerts bell */}
        <button
          onClick={() => navigate('/budgets')}
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Alertas de orçamento"
        >
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </>
          )}
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative ml-1">
          <button
            onClick={() => setShowUser((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-primary-200 dark:shadow-primary-900/50">
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-400 transition-transform ${showUser ? 'rotate-180' : ''}`} />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/40 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 py-1.5 z-50 animate-fade-in-up overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowUser(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" /> Perfil & Configurações
              </button>
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
