import { useState, useEffect } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Sparkles,
} from 'lucide-react';
import { useTourStore } from '@/store/tour.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TransactionBadge } from '@/components/ui/Badge';
import { CategoryAvatar } from '@/utils/icons';
import { PageLoader } from '@/components/ui/Spinner';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { EvolutionChart } from '@/components/charts/EvolutionChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { useTransactions, useTransactionSummary, useMonthlyEvolution, useTransactionsByCategory } from '@/hooks/useTransactions';
import { useBudgetAlerts } from '@/hooks/useBudgets';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate } from '@/utils/format';

// ─────────────────────────────────────────────────────────────
//  Summary card (premium)
// ─────────────────────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: number;
  icon: any;
  intent: 'income' | 'expense' | 'balance' | 'cash';
  trend?: number;
}

const SummaryCard = ({ label, value, icon: Icon, intent, trend }: SummaryCardProps) => {
  const intentStyles = {
    income: {
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      iconShadow: 'shadow-emerald-200 dark:shadow-emerald-900/30',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      ringColor: 'ring-emerald-100 dark:ring-emerald-900/40',
      bars: 'from-emerald-200 to-emerald-500',
    },
    expense: {
      iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600',
      iconShadow: 'shadow-rose-200 dark:shadow-rose-900/30',
      valueColor: 'text-rose-600 dark:text-rose-400',
      ringColor: 'ring-rose-100 dark:ring-rose-900/40',
      bars: 'from-rose-200 to-rose-500',
    },
    balance: {
      iconBg: 'bg-gradient-to-br from-primary-500 to-indigo-600',
      iconShadow: 'shadow-primary-200 dark:shadow-primary-900/30',
      valueColor: value >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400',
      ringColor: 'ring-primary-100 dark:ring-primary-900/40',
      bars: 'from-primary-200 to-primary-500',
    },
    cash: {
      iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-600',
      iconShadow: 'shadow-cyan-200 dark:shadow-cyan-900/30',
      valueColor: value >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400',
      ringColor: 'ring-cyan-100 dark:ring-cyan-900/40',
      bars: 'from-cyan-200 to-cyan-500',
    },
  };
  const styles = intentStyles[intent];

  return (
    <div className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5`}>
      {/* Decorative blob */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 ${styles.iconBg}`} />

      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${styles.iconBg} ${styles.iconShadow} ring-4 ${styles.ringColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-2xl sm:text-[26px] font-extrabold tracking-tight ${styles.valueColor}`}>
        {formatCurrency(value)}
      </p>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}%
          <span className="text-gray-400 dark:text-gray-500 font-normal">vs. mês anterior</span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Greeting based on hour
// ─────────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

// ─────────────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: summary, isLoading: loadingSummary } = useTransactionSummary(month, year);
  const { data: transactions, isLoading: loadingTx } = useTransactions({ page: 1, limit: 5 });
  const { data: evolution } = useMonthlyEvolution(6);
  const { data: byCategory } = useTransactionsByCategory();
  const { data: alerts = [] } = useBudgetAlerts();

  // Auto-start the guided tour for first-time users, once the dashboard is painted
  const { completed: tourCompleted, run: tourRunning, start: startTour } = useTourStore();
  useEffect(() => {
    if (!tourCompleted && !tourRunning && !loadingSummary && !loadingTx) {
      const t = setTimeout(() => startTour(), 600);
      return () => clearTimeout(t);
    }
  }, [tourCompleted, tourRunning, loadingSummary, loadingTx, startTour]);

  if (loadingSummary || loadingTx) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-indigo-900 dark:from-gray-950 dark:via-primary-950 dark:to-indigo-950 rounded-3xl p-6 sm:p-8 text-white">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-primary-200 font-medium mb-1">
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
              Sua visão geral
            </h1>
            <p className="text-sm text-primary-200/80 capitalize">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Button
            data-tour="new-transaction"
            onClick={() => setModalOpen(true)}
            className="!bg-white !text-gray-900 hover:!bg-primary-50 dark:hover:!bg-primary-100 shadow-xl !text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Budget alerts */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
              {alerts.length} orçamento{alerts.length > 1 ? 's' : ''} próximo{alerts.length > 1 ? 's' : ''} do limite
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {alerts.map((a) => a.category?.name).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="summary-cards">
        <SummaryCard label="Receitas do Mês" value={summary?.income ?? 0} icon={TrendingUp} intent="income" />
        <SummaryCard label="Despesas do Mês" value={summary?.expense ?? 0} icon={TrendingDown} intent="expense" />
        <SummaryCard label="Saldo do Mês" value={summary?.balance ?? 0} icon={Sparkles} intent="balance" />
        <SummaryCard label="Caixa Atual" value={summary?.caixa ?? 0} icon={Wallet} intent="cash" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolução dos últimos 6 meses" subtitle="Receitas vs. despesas">
          {evolution
            ? <EvolutionChart data={evolution} />
            : <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">Carregando...</div>}
        </Card>

        <Card title="Despesas por Categoria" subtitle="No mês atual">
          {byCategory
            ? <CategoryPieChart data={byCategory} type="EXPENSE" />
            : <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">Carregando...</div>}
        </Card>
      </div>

      {/* Recent transactions */}
      <Card
        title="Transações recentes"
        subtitle="Últimas movimentações"
        action={
          <a
            href="/transactions"
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            Ver todas <ArrowUpRight className="w-3 h-3" />
          </a>
        }
        noPadding
      >
        {!transactions?.data?.length ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Nenhuma transação ainda</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Comece registrando sua primeira movimentação</p>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Nova Transação
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.data.map((t) => {
              const isIncome = t.type === 'INCOME';
              return (
                <div
                  key={t.id}
                  className="group flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryAvatar
                      icon={t.category?.icon ?? 'tag'}
                      color={t.category?.color ?? '#6366f1'}
                      name={t.category?.name}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{formatDate(t.date)}</span>
                        <Badge color={t.category?.color}>{t.category?.name}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <TransactionBadge type={t.type} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
