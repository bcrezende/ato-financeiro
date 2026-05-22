import { useState } from 'react';
import { Plus, Search, Filter, Download, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TransactionBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { useTransactions, useDeleteTransaction, useExportTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Transaction, TransactionFilters } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export const TransactionsPage = () => {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useTransactions(filters);
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteTransaction();
  const exportMutation = useExportTransactions();

  const setFilter = (key: keyof TransactionFilters, value: any) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data?.pagination?.total ?? 0} transação(ões) encontrada(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate({ format: 'excel', filters })}
          >
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditingTx(null); setModalOpen(true); }}>
            <span className="hidden sm:inline">Nova Transação</span>
          </Button>
        </div>
      </div>

      {/* Search + filter bar */}
      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por descrição..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search ?? ''}
              onChange={(e) => setFilter('search', e.target.value || undefined)}
            />
          </div>
          <Button
            variant="secondary"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filtros {showFilters ? '↑' : '↓'}
          </Button>
        </div>

        {showFilters && (
          <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="De"
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) => setFilter('startDate', e.target.value || undefined)}
            />
            <Input
              label="Até"
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) => setFilter('endDate', e.target.value || undefined)}
            />
            <Select
              label="Tipo"
              placeholder="Todos"
              options={[{ value: 'INCOME', label: 'Receita' }, { value: 'EXPENSE', label: 'Despesa' }]}
              value={filters.type ?? ''}
              onChange={(e) => setFilter('type', e.target.value || undefined)}
            />
            <Select
              label="Categoria"
              placeholder="Todas"
              options={categoryOptions}
              value={filters.categoryId ?? ''}
              onChange={(e) => setFilter('categoryId', e.target.value || undefined)}
            />
            <Input
              label="Valor mín. (R$)"
              type="number"
              min="0"
              value={filters.minAmount ?? ''}
              onChange={(e) => setFilter('minAmount', e.target.value || undefined)}
            />
            <Input
              label="Valor máx. (R$)"
              type="number"
              min="0"
              value={filters.maxAmount ?? ''}
              onChange={(e) => setFilter('maxAmount', e.target.value || undefined)}
            />
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setFilters({ page: 1, limit: 20 })}
              >
                Limpar
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card noPadding>
        {isLoading ? (
          <PageLoader />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={RefreshCw}
            title="Nenhuma transação"
            description="Crie sua primeira transação clicando no botão acima"
            action={{ label: 'Nova Transação', onClick: () => setModalOpen(true) }}
          />
        ) : (
          <>
            {/* Mobile view */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700 sm:hidden">
              {data.data.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: t.category?.color ?? '#6366f1' }}>
                      {t.category?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(t.date)} · {t.category?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <button onClick={() => { setEditingTx(t); setModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-primary-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeletingId(t.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">Descrição</th>
                    <th className="px-4 py-3 text-left font-medium">Categoria</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.data.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t.description}</p>
                          {t.isRecurring && <span className="text-xs text-purple-600 dark:text-purple-400">↻ Recorrente</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.category?.color }} />
                          <span className="text-gray-700 dark:text-gray-300">{t.category?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><TransactionBadge type={t.type} /></td>
                      <td className={`px-4 py-3 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditingTx(t); setModalOpen(true); }} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeletingId(t.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Página {data.pagination.page} de {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={data.pagination.page <= 1}
                    onClick={() => setFilter('page', (filters.page ?? 1) - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={data.pagination.page >= data.pagination.totalPages}
                    onClick={() => setFilter('page', (filters.page ?? 1) + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        transaction={editingTx}
      />

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => { await deleteMutation.mutateAsync(deletingId!); setDeletingId(null); }}
        loading={deleteMutation.isPending}
        title="Remover transação"
        description="Esta ação não pode ser desfeita. A transação será permanentemente removida."
        confirmLabel="Remover"
      />
    </div>
  );
};
