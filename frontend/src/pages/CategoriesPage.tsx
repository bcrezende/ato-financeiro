import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { CategoryModal } from '@/components/modals/CategoryModal';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { CategoryAvatar } from '@/utils/icons';
import { Category } from '@/types';

export const CategoriesPage = () => {
  const { data: categories = [], isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const filtered = categories.filter((c) => c.type === activeType);
  const defaults = filtered.filter((c) => c.isDefault);
  const custom = filtered.filter((c) => !c.isDefault);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Categorias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{categories.length}</span> categorias disponíveis
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditingCat(null); setModalOpen(true); }}>
          Nova Categoria
        </Button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1 w-fit shadow-inner">
        {(['EXPENSE', 'INCOME'] as const).map((t) => {
          const count = categories.filter((c) => c.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                ${activeType === t
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              {t === 'INCOME' ? 'Receitas' : 'Despesas'}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                activeType === t
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Default categories */}
      {defaults.length > 0 && (
        <Card title="Categorias Padrão" subtitle="Fornecidas pelo sistema, não podem ser editadas">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {defaults.map((c) => (
              <CategoryItem key={c.id} category={c} />
            ))}
          </div>
        </Card>
      )}

      {/* Custom categories */}
      <Card
        title="Categorias Personalizadas"
        subtitle="Criadas por você"
        action={
          <Button size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => { setEditingCat(null); setModalOpen(true); }}>
            Adicionar
          </Button>
        }
      >
        {!custom.length ? (
          <EmptyState
            icon={Tag}
            title="Nenhuma categoria personalizada"
            description={`Adicione categorias de ${activeType === 'INCOME' ? 'receita' : 'despesa'} personalizadas`}
            action={{ label: 'Criar Categoria', onClick: () => setModalOpen(true) }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {custom.map((c) => (
              <CategoryItem
                key={c.id}
                category={c}
                onEdit={() => { setEditingCat(c); setModalOpen(true); }}
                onDelete={() => setDeletingId(c.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCat(null); }}
        category={editingCat}
      />

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => { await deleteMutation.mutateAsync(deletingId!); setDeletingId(null); }}
        loading={deleteMutation.isPending}
        title="Remover categoria"
        description="A categoria só pode ser removida se não estiver em uso por nenhuma transação."
        confirmLabel="Remover"
      />
    </div>
  );
};

const CategoryItem = ({ category: c, onEdit, onDelete }: { category: Category; onEdit?: () => void; onDelete?: () => void }) => (
  <div className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 hover:shadow-sm transition-all">
    <CategoryAvatar icon={c.icon} color={c.color} name={c.name} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.name}</p>
      {c.isDefault && (
        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md mt-0.5">
          Padrão
        </span>
      )}
    </div>
    {!c.isDefault && (
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    )}
  </div>
);
