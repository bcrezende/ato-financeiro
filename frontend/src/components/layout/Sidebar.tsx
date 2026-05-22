import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  Tag, Settings, X, TrendingUp, Sparkles,
} from 'lucide-react';

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
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Ato Financeiro</span>
        </div>
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

      {/* Version */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">v1.0.0</p>
      </div>
    </aside>
  </>
);
