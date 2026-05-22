import { useState } from 'react';
import { Download } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Análise detalhada das suas finanças</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Receitas ({months}m)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Despesas ({months}m)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Médio Mensal</p>
          <p className={`text-2xl font-bold mt-1 ${avgBalance >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
            {formatCurrency(avgBalance)}
          </p>
        </Card>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-4">
        <Select
          options={[
            { value: 3, label: 'Últimos 3 meses' },
            { value: 6, label: 'Últimos 6 meses' },
            { value: 12, label: 'Últimos 12 meses' },
            { value: 24, label: 'Últimos 24 meses' },
          ]}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="w-48"
        />
      </div>

      {/* Evolution area chart */}
      <Card title="Evolução de Receitas vs Despesas">
        {evolution && <EvolutionChart data={evolution} />}
      </Card>

      {/* Bar comparison */}
      <Card title="Comparativo Mensal">
        {evolution && <BarComparisonChart data={evolution} />}
      </Card>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Por Categoria"
          action={
            <div className="flex gap-1">
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                    ${activeTab === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
        <Card title="Ranking de Categorias">
          {byCategory ? (
            <div className="space-y-3">
              {byCategory
                .filter((d) => d.type === activeTab)
                .sort((a, b) => b.total - a.total)
                .slice(0, 8)
                .map((d, i) => {
                  const maxTotal = Math.max(...byCategory.filter((x) => x.type === activeTab).map((x) => x.total));
                  const pct = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
                  return (
                    <div key={d.categoryId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.category?.color }} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{d.category?.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(d.total)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: d.category?.color }} />
                      </div>
                    </div>
                  );
                })}
              {!byCategory.filter((d) => d.type === activeTab).length && (
                <p className="text-center text-gray-400 text-sm py-4">Sem dados</p>
              )}
            </div>
          ) : null}
        </Card>
      </div>

      {/* Export section */}
      <Card title="Exportar Dados">
        <div className="flex flex-col sm:flex-row items-end gap-4">
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
          <div className="flex gap-2">
            <Button
              variant="success"
              icon={<Download className="w-4 h-4" />}
              loading={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ format: 'excel', filters: exportFilters })}
            >
              Excel (.xlsx)
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
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
