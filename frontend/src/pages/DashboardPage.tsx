import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

const SummaryCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <Card className="flex-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{formatCurrency(value)}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/30' : color === 'text-red-600' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(trend).toFixed(1)}% vs mês anterior
      </div>
    )}
  </Card>
);

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

  if (loadingSummary || loadingTx) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Nova Transação
        </Button>
      </div>

      {/* Budget alerts */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            ⚠️ {alerts.length} orçamento{alerts.length > 1 ? 's' : ''} atingiu{alerts.length > 1 ? 'ram' : ''} o limite de alerta
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
            {alerts.map((a) => a.category?.name).join(', ')}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Receitas do Mês" value={summary?.income ?? 0} icon={TrendingUp} color="text-green-600" />
        <SummaryCard label="Despesas do Mês" value={summary?.expense ?? 0} icon={TrendingDown} color="text-red-600" />
        <SummaryCard
          label="Saldo do Mês"
          value={summary?.balance ?? 0}
          icon={DollarSign}
          color={(summary?.balance ?? 0) >= 0 ? 'text-primary-600' : 'text-red-600'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolução dos últimos 6 meses">
          {evolution ? <EvolutionChart data={evolution} /> : <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">Carregando...</div>}
        </Card>

        <Card title="Despesas por Categoria (Mês)">
          {byCategory ? <CategoryPieChart data={byCategory} type="EXPENSE" /> : <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">Carregando...</div>}
        </Card>
      </div>

      {/* Recent transactions */}
      <Card
        title="Transações Recentes"
        action={
          <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todas →
          </a>
        }
      >
        {!transactions?.data?.length ? (
          <p className="text-center text-gray-400 text-sm py-6">Nenhuma transação ainda</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 -mx-6 -mb-6">
            {transactions.data.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <CategoryAvatar
                    icon={t.category?.icon ?? 'tag'}
                    color={t.category?.color ?? '#6366f1'}
                    name={t.category?.name}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(t.date)}</span>
                      <Badge color={t.category?.color}>{t.category?.name}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <TransactionBadge type={t.type} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
