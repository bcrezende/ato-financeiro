import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  Tag, Settings, X, Sparkles, Crown, Zap, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscription';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
        <div className="relative overflow-hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Plano Pro ativo</p>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80">R$19,90/mês</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <Link to="/subscription" className="block group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 p-3.5 text-white shadow-lg shadow-primary-200/50 dark:shadow-primary-900/30 transition-all group-hover:shadow-xl group-hover:-translate-y-0.5">
          {/* Decorative blob */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />

          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ato Pro</span>
            </div>
            {sub.subscriptionStatus === 'TRIAL' && sub.daysLeft !== null && (
              <p className="text-[11px] text-primary-200 mb-2">
                {sub.daysLeft > 0 ? `${sub.daysLeft} dia${sub.daysLeft !== 1 ? 's' : ''} de trial` : 'Trial expirado'}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold">R$19,90<span className="text-[10px] font-medium text-primary-200">/mês</span></span>
              <div className="flex items-center gap-1 bg-white/20 group-hover:bg-white/30 transition-colors rounded-lg px-2 py-1">
                <Zap className="w-3 h-3" />
                <span className="text-[10px] font-bold">Assinar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
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
      <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
    )}

    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-950 border-r border-gray-200/60 dark:border-gray-800/60 flex flex-col transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/60 dark:border-gray-800/60">
        <img src="/logo-wide.png" alt="Ato Financeiro" className="h-10 w-auto object-contain" />
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold mb-0.5 transition-all
              ${isActive
                ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 dark:from-primary-900/40 dark:to-indigo-900/40 dark:text-primary-300 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Subscription CTA */}
      <div className="border-t border-gray-200/60 dark:border-gray-800/60 pt-3">
        <SubscriptionCTA />
        <div className="px-6 pb-3">
          <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">v1.0.0</p>
        </div>
      </div>
    </aside>
  </>
);
