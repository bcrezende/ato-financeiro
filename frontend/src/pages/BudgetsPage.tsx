import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, Target, Wallet, TrendingDown, Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { BudgetModal } from '@/components/modals/BudgetModal';
import { useBudgets, useDeleteBudget } from '@/hooks/useBudgets';
import { CategoryAvatar } from '@/utils/icons';
import { Budget } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/format';

interface StatCardProps {
  label: string;
  value: string;
  icon: any;
  intent: 'primary' | 'expense' | 'alert' | 'safe';
}

const StatCard = ({ label, value, icon: Icon, intent }: StatCardProps) => {
  const styles = {
    primary: { iconBg: 'bg-gradient-to-br from-primary-500 to-indigo-600', shadow: 'shadow-primary-200/50 dark:shadow-primary-900/30', text: 'text-gray-900 dark:text-white', ring: 'ring-primary-100 dark:ring-primary-900/40' },
    expense: { iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600', shadow: 'shadow-rose-200/50 dark:shadow-rose-900/30', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-900/40' },
    alert: { iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500', shadow: 'shadow-amber-200/50 dark:shadow-amber-900/30', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-900/40' },
    safe: { iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-200/50 dark:shadow-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-900/40' },
  }[intent];

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${styles.iconBg} ${styles.shadow} ring-4 ${styles.ring} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-2xl sm:text-[26px] font-extrabold tracking-tight ${styles.text}`}>{value}</p>
    </div>
  );
};

export const BudgetsPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: budgets = [], isLoading } = useBudgets(month, year);
  const deleteMutation = useDeleteBudget();

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }),
  }));
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: now.getFullYear() + i - 1,
    label: String(now.getFullYear() + i - 1),
  }));

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const alertCount = budgets.filter((b) => b.isAlerted || b.isOverBudget).length;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Orçamentos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Defina e acompanhe limites de gastos</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditingBudget(null); setModalOpen(true); }}>
          Novo Orçamento
        </Button>
      </div>

      {/* Month/year selector */}
      <div className="flex items-center gap-3">
        <Select
          options={months}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="!w-40 capitalize"
        />
        <Select
          options={years}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="!w-28"
        />
      </div>

      {/* Overview cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Orçamento total" value={formatCurrency(totalBudget)} icon={Wallet} intent="primary" />
          <StatCard label="Total gasto" value={formatCurrency(totalSpent)} icon={TrendingDown} intent={totalSpent > totalBudget ? 'expense' : 'primary'} />
          <StatCard label="Alertas ativos" value={String(alertCount)} icon={Bell} intent={alertCount > 0 ? 'alert' : 'safe'} />
        </div>
      )}

      {/* Budget cards */}
      {isLoading ? (
        <PageLoader />
      ) : !budgets.length ? (
        <Card>
          <EmptyState
            icon={Target}
            title="Nenhum orçamento"
            description="Crie orçamentos para controlar seus gastos por categoria"
            action={{ label: 'Criar Orçamento', onClick: () => setModalOpen(true) }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={() => { setEditingBudget(b); setModalOpen(true); }}
              onDelete={() => setDeletingId(b.id)}
            />
          ))}
        </div>
      )}

      <BudgetModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBudget(null); }}
        budget={editingBudget}
        defaultMonth={month}
        defaultYear={year}
      />

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => { await deleteMutation.mutateAsync(deletingId!); setDeletingId(null); }}
        loading={deleteMutation.isPending}
        title="Remover orçamento"
        description="O orçamento será removido permanentemente."
        confirmLabel="Remover"
      />
    </div>
  );
};

const BudgetCard = ({ budget: b, onEdit, onDelete }: { budget: Budget; onEdit: () => void; onDelete: () => void }) => {
  const status = b.isOverBudget ? 'over' : b.isAlerted ? 'warn' : 'ok';
  const statusStyles = {
    over: { bar: 'from-rose-400 to-rose-600', ring: 'ring-rose-100 dark:ring-rose-900/30', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    warn: { bar: 'from-amber-400 to-orange-500', ring: 'ring-amber-100 dark:ring-amber-900/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    ok: { bar: `from-primary-400 to-primary-600`, ring: 'ring-primary-100 dark:ring-primary-900/30', badge: '' },
  }[status];

  return (
    <div className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`ring-4 ${statusStyles.ring} rounded-xl`}>
            <CategoryAvatar icon={b.category?.icon ?? 'tag'} color={b.category?.color ?? '#6366f1'} name={b.category?.name} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{b.category?.name}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progresso</span>
          <span className={`text-xs font-extrabold tabular-nums ${b.isOverBudget ? 'text-rose-600 dark:text-rose-400' : b.isAlerted ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
            {formatPercent(b.percentage)}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${statusStyles.bar} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(b.percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gasto</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(b.spent)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Limite</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(b.amount)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Restante</p>
          <p className={`text-sm font-bold tabular-nums ${b.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {b.isOverBudget ? '-' : ''}{formatCurrency(Math.abs(b.remaining))}
          </p>
        </div>
      </div>

      {b.isOverBudget && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5" /> Limite excedido
        </div>
      )}
      {b.isAlerted && !b.isOverBudget && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
          <Bell className="w-3.5 h-3.5" /> Alerta de {b.alertAt}%
        </div>
      )}
    </div>
  );
};
