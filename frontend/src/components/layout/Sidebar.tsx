import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  Tag, Settings, X, Sparkles, Crown, Zap, CheckCircle2,
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscription';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/reports', icon: PieChart, label: 'Relatórios' },
  { to: '/budgets', icon: Target, label: 'Orçamentos' },
  { to: '/categories', icon: Tag, label: 'Categorias' },
  { to: '/dream-board', icon: Sparkles, label: 'Quadro dos Sonhos' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

const SubscriptionCTA = () => {
  const { data: sub } = useSubscriptionStatus();
  if (!sub) return null;

  if (sub.subscriptionStatus === 'ACTIVE') {
    return (
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Plano Pro ativo</p>
            <p className="text-xs text-green-600 dark:text-green-500">R$19,90/mês</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <Link to="/subscription" className="block">
        <div className="rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 p-3 text-white cursor-pointer hover:opacity-95 transition-opacity">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-wide">Ato Pro</span>
          </div>
          {sub.subscriptionStatus === 'TRIAL' && sub.daysLeft !== null && (
            <p className="text-xs text-primary-200 mb-2">
              {sub.daysLeft > 0 ? `${sub.daysLeft} dias de trial restantes` : 'Trial expirado'}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">R$19,90<span className="text-xs font-normal text-primary-200">/mês</span></span>
            <div className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-2.5 py-1">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-semibold">Assinar</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export const Sidebar = ({ open, onClose }: SidebarProps) => (
  <>
    {/* Mobile overlay */}
    {open && (
      <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
    )}

    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <img src="/logo-wide.png" alt="Ato Financeiro" className="h-10 w-auto object-contain" />
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all
              ${isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Subscription CTA */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <SubscriptionCTA />
        <div className="px-6 pb-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">v1.0.0</p>
        </div>
      </div>
    </aside>
  </>
);
