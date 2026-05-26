import { useState } from 'react';
import { TrendingUp, TrendingDown, Sparkles, FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EvolutionChart } from '@/components/charts/EvolutionChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { BarComparisonChart } from '@/components/charts/BarComparisonChart';
import { useMonthlyEvolution, useTransactionsByCategory, useExportTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/format';
import { PageLoader } from '@/components/ui/Spinner';

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  intent: 'income' | 'expense' | 'balance';
  subtitle?: string;
}

const StatCard = ({ label, value, icon: Icon, intent, subtitle }: StatCardProps) => {
  const styles = {
    income: { iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-200/50 dark:shadow-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-900/40' },
    expense: { iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600', shadow: 'shadow-rose-200/50 dark:shadow-rose-900/30', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-900/40' },
    balance: { iconBg: 'bg-gradient-to-br from-primary-500 to-indigo-600', shadow: 'shadow-primary-200/50 dark:shadow-primary-900/30', text: value >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400', ring: 'ring-primary-100 dark:ring-primary-900/40' },
  }[intent];

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${styles.iconBg} ${styles.shadow} ring-4 ${styles.ring} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-2xl sm:text-[26px] font-extrabold tracking-tight ${styles.text}`}>{formatCurrency(value)}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export const ReportsPage = () => {
  const [months, setMonths] = useState(12);
  const [exportFilters, setExportFilters] = useState({ startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const { data: evolution, isLoading } = useMonthlyEvolution(months);
  const { data: byCategory } = useTransactionsByCategory(
    exportFilters.startDate || undefined,
    exportFilters.endDate || undefined,
  );
  const exportMutation = useExportTransactions();

  const totalIncome = evolution?.reduce((s, m) => s + m.income, 0) ?? 0;
  const totalExpense = evolution?.reduce((s, m) => s + m.expense, 0) ?? 0;
  const avgBalance = evolution?.length ? (totalIncome - totalExpense) / evolution.length : 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Análise detalhada das suas finanças</p>
        </div>
        <Select
          options={[
            { value: 3, label: 'Últimos 3 meses' },
            { value: 6, label: 'Últimos 6 meses' },
            { value: 12, label: 'Últimos 12 meses' },
            { value: 24, label: 'Últimos 24 meses' },
          ]}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="w-full sm:w-56"
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={`Receitas (${months}m)`} value={totalIncome} icon={TrendingUp} intent="income" />
        <StatCard label={`Despesas (${months}m)`} value={totalExpense} icon={TrendingDown} intent="expense" />
        <StatCard label="Saldo médio mensal" value={avgBalance} icon={Sparkles} intent="balance" />
      </div>

      {/* Evolution area chart */}
      <Card title="Evolução de receitas vs despesas" subtitle={`Últimos ${months} meses`}>
        {evolution && <EvolutionChart data={evolution} />}
      </Card>

      {/* Bar comparison */}
      <Card title="Comparativo mensal" subtitle="Receitas e despesas lado a lado">
        {evolution && <BarComparisonChart data={evolution} />}
      </Card>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Por categoria"
          subtitle={activeTab === 'INCOME' ? 'Origem das suas receitas' : 'Para onde vai seu dinheiro'}
          action={
            <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                    activeTab === t
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {t === 'INCOME' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </div>
          }
        >
          {byCategory && <CategoryPieChart data={byCategory} type={activeTab} />}
        </Card>

        {/* Category list */}
        <Card title="Ranking de categorias" subtitle="Top 8 por valor">
          {byCategory ? (
            <div className="space-y-3.5">
              {byCategory
                .filter((d) => d.type === activeTab)
                .sort((a, b) => b.total - a.total)
                .slice(0, 8)
                .map((d, i) => {
                  const maxTotal = Math.max(...byCategory.filter((x) => x.type === activeTab).map((x) => x.total));
                  const pct = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
                  return (
                    <div key={d.categoryId} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 w-5">#{i + 1}</span>
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.category?.color }} />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{d.category?.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(d.total)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${d.category?.color}80, ${d.category?.color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {!byCategory.filter((d) => d.type === activeTab).length && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-400 text-sm">Sem dados ainda</p>
                </div>
              )}
            </div>
          ) : null}
        </Card>
      </div>

      {/* Export section */}
      <Card title="Exportar dados" subtitle="Baixe um período específico em Excel ou CSV">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            <Input
              label="Data inicial"
              type="date"
              value={exportFilters.startDate}
              onChange={(e) => setExportFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              label="Data final"
              type="date"
              value={exportFilters.endDate}
              onChange={(e) => setExportFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="success"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              loading={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ format: 'excel', filters: exportFilters })}
            >
              Excel
            </Button>
            <Button
              variant="secondary"
              icon={<FileText className="w-4 h-4" />}
              loading={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ format: 'csv', filters: exportFilters })}
            >
              CSV
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
