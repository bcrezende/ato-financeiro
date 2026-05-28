import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Sparkles, FileSpreadsheet, FileText, CalendarRange, BarChart3, FileSearch } from 'lucide-react';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
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

const PRESETS = [3, 6, 12, 24] as const;
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }),
);

export const ReportsPage = () => {
  const now = new Date();
  const [activeView, setActiveView] = useState<'overview' | 'builder'>('overview');
  const [preset, setPreset] = useState<number | null>(12); // null = modo personalizado
  const [from, setFrom] = useState({ month: now.getMonth() + 1, year: now.getFullYear() }); // será sobrescrito quando entrar em custom
  const [to, setTo] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [exportFilters, setExportFilters] = useState({ startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  // Quando entra no modo custom, inicializa from/to coerentes com o preset atual
  const switchToCustom = () => {
    const ref = preset ?? 12;
    const start = new Date(now.getFullYear(), now.getMonth() - (ref - 1), 1);
    setFrom({ month: start.getMonth() + 1, year: start.getFullYear() });
    setTo({ month: now.getMonth() + 1, year: now.getFullYear() });
    setPreset(null);
  };

  const evolutionOpts = preset
    ? { months: preset }
    : { fromMonth: from.month, fromYear: from.year, toMonth: to.month, toYear: to.year };

  const { data: evolution, isLoading } = useMonthlyEvolution(evolutionOpts);

  // Para o breakdown por categoria, derivamos start/end do range em vigor (1º dia do from → último dia do to)
  const categoryRange = useMemo(() => {
    if (preset) {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const start = new Date(now.getFullYear(), now.getMonth() - (preset - 1), 1);
      return {
        startDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`,
        endDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`,
      };
    }
    const lastDay = new Date(to.year, to.month, 0).getDate();
    return {
      startDate: `${from.year}-${String(from.month).padStart(2, '0')}-01`,
      endDate: `${to.year}-${String(to.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, from.month, from.year, to.month, to.year]);

  const { data: byCategory } = useTransactionsByCategory(categoryRange.startDate, categoryRange.endDate);
  const exportMutation = useExportTransactions();

  const totalIncome = evolution?.reduce((s, m) => s + m.income, 0) ?? 0;
  const totalExpense = evolution?.reduce((s, m) => s + m.expense, 0) ?? 0;
  const avgBalance = evolution?.length ? (totalIncome - totalExpense) / evolution.length : 0;

  const rangeLabel = preset
    ? `Últimos ${preset} meses`
    : `${MONTH_NAMES[from.month - 1].slice(0, 3)}/${String(from.year).slice(2)} → ${MONTH_NAMES[to.month - 1].slice(0, 3)}/${String(to.year).slice(2)}`;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Relatórios</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Análise detalhada das suas finanças</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1 w-fit shadow-inner">
        {([
          { v: 'overview', l: 'Visão geral', icon: BarChart3 },
          { v: 'builder',  l: 'Gerador de relatórios', icon: FileSearch },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.v}
              onClick={() => setActiveView(t.v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeView === t.v
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.l}
            </button>
          );
        })}
      </div>

      {/* Gerador */}
      {activeView === 'builder' && <ReportBuilder />}

      {/* Visão geral */}
      {activeView === 'overview' && isLoading && <PageLoader />}
      {activeView === 'overview' && !isLoading && (<>

      {/* Seletor de período */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarRange className="w-4 h-4 text-primary-500" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Período: <span className="text-primary-600 dark:text-primary-400 capitalize">{rangeLabel}</span>
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                preset === m
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {m}m
            </button>
          ))}
          <button
            onClick={() => preset !== null ? switchToCustom() : null}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              preset === null
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarRange className="w-3 h-3" /> Personalizado
          </button>
        </div>

        {/* Range custom */}
        {preset === null && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Mês inicial</label>
              <Select
                options={MONTH_NAMES.map((label, i) => ({ value: i + 1, label }))}
                value={from.month}
                onChange={(e) => setFrom((f) => ({ ...f, month: Number(e.target.value) }))}
                className="capitalize"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Ano inicial</label>
              <Select
                options={Array.from({ length: 6 }, (_, i) => ({ value: now.getFullYear() - 3 + i, label: String(now.getFullYear() - 3 + i) }))}
                value={from.year}
                onChange={(e) => setFrom((f) => ({ ...f, year: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Mês final</label>
              <Select
                options={MONTH_NAMES.map((label, i) => ({ value: i + 1, label }))}
                value={to.month}
                onChange={(e) => setTo((t) => ({ ...t, month: Number(e.target.value) }))}
                className="capitalize"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Ano final</label>
              <Select
                options={Array.from({ length: 6 }, (_, i) => ({ value: now.getFullYear() - 3 + i, label: String(now.getFullYear() - 3 + i) }))}
                value={to.year}
                onChange={(e) => setTo((t) => ({ ...t, year: Number(e.target.value) }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Receitas" value={totalIncome} icon={TrendingUp} intent="income" subtitle={rangeLabel} />
        <StatCard label="Despesas" value={totalExpense} icon={TrendingDown} intent="expense" subtitle={rangeLabel} />
        <StatCard label="Saldo médio mensal" value={avgBalance} icon={Sparkles} intent="balance" />
      </div>

      {/* Evolution area chart */}
      <Card title="Evolução de receitas vs despesas" subtitle={rangeLabel}>
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
      </>)}
    </div>
  );
};
