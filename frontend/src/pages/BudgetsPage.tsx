import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, Target } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orçamentos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Defina e acompanhe limites de gastos</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditingBudget(null); setModalOpen(true); }}>
          Novo Orçamento
        </Button>
      </div>

      {/* Month/year selector */}
      <div className="flex items-center gap-4">
        <Select
          options={months}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="w-36"
        />
        <Select
          options={years}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-28"
        />
      </div>

      {/* Overview cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Orçamento Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalBudget)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Gasto</p>
            <p className={`text-2xl font-bold mt-1 ${totalSpent > totalBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(totalSpent)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Alertas Ativos</p>
            <p className={`text-2xl font-bold mt-1 ${alertCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {alertCount}
            </p>
          </Card>
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
  const barColor = b.isOverBudget ? '#ef4444' : b.isAlerted ? '#f59e0b' : b.category?.color ?? '#6366f1';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryAvatar icon={b.category?.icon ?? 'tag'} color={b.category?.color ?? '#6366f1'} name={b.category?.name} />
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">{b.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{b.category?.name}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {(b.isAlerted || b.isOverBudget) && (
            <AlertTriangle className={`w-4 h-4 ${b.isOverBudget ? 'text-red-500' : 'text-amber-500'}`} />
          )}
          <button onClick={onEdit} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{formatCurrency(b.spent)} gasto</span>
          <span>{formatPercent(b.percentage)}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(b.percentage, 100)}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Limite</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(b.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Restante</p>
          <p className={`text-sm font-bold ${b.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            {b.isOverBudget ? '-' : ''}{formatCurrency(b.remaining)}
          </p>
        </div>
      </div>

      {b.isOverBudget && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">⚠ Limite excedido!</p>
      )}
      {b.isAlerted && !b.isOverBudget && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">⚡ Alerta: {b.alertAt}% atingido</p>
      )}
    </Card>
  );
};
