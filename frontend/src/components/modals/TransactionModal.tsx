import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CategoryModal } from '@/components/modals/CategoryModal';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { toDateInput } from '@/utils/format';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

interface FormValues {
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  notes: string;
  isRecurring: boolean;
  frequency: string;
  installments: string;
  status: 'PAID' | 'PENDING';
}

export const TransactionModal = ({ open, onClose, transaction }: TransactionModalProps) => {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const isEditing = !!transaction;

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const prevCategoryIdsRef = useRef<Set<string>>(new Set());
  const [awaitingNewCategory, setAwaitingNewCategory] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      description: '', amount: '', type: 'EXPENSE',
      date: format(new Date(), 'yyyy-MM-dd'), categoryId: '',
      notes: '', isRecurring: false, frequency: '', installments: '',
      status: 'PENDING',
    },
  });

  const watchType = watch('type');
  const watchRecurring = watch('isRecurring');

  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amount: String(transaction.amount),
        type: transaction.type,
        date: toDateInput(transaction.date),
        categoryId: transaction.categoryId,
        notes: transaction.notes ?? '',
        isRecurring: transaction.isRecurring,
        frequency: transaction.frequency ?? '',
        installments: transaction.installments ? String(transaction.installments) : '',
        status: transaction.status ?? 'PENDING',
      });
    } else {
      reset({ description: '', amount: '', type: 'EXPENSE', date: format(new Date(), 'yyyy-MM-dd'), categoryId: '', notes: '', isRecurring: false, frequency: '', installments: '', status: 'PENDING' });
    }
  }, [transaction, reset, open]);

  const filteredCategories = categories.filter((c) => c.type === watchType);

  const handleOpenCategoryModal = () => {
    prevCategoryIdsRef.current = new Set(filteredCategories.map((c) => c.id));
    setAwaitingNewCategory(true);
    setCategoryModalOpen(true);
  };

  useEffect(() => {
    if (!awaitingNewCategory || categoryModalOpen) return;
    const newCat = filteredCategories.find((c) => !prevCategoryIdsRef.current.has(c.id));
    if (newCat) {
      setValue('categoryId', newCat.id);
      setAwaitingNewCategory(false);
    }
  }, [categories, awaitingNewCategory, categoryModalOpen, filteredCategories, setValue]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      date: `${data.date}T12:00:00.000Z`,
      categoryId: data.categoryId,
      notes: data.notes || undefined,
      isRecurring: data.isRecurring,
      frequency: data.isRecurring && data.frequency ? (data.frequency as any) : undefined,
      installments: data.isRecurring && data.installments ? parseInt(data.installments) : (isEditing ? null : undefined),
      status: data.status,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: transaction!.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload as any);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar Transação' : 'Nova Transação'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['EXPENSE', 'INCOME'] as const).map((t) => (
            <label
              key={t}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 cursor-pointer text-sm font-medium transition-colors
                ${watchType === t
                  ? t === 'INCOME' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              {t === 'INCOME' ? '↑ Receita' : '↓ Despesa'}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Descrição"
              placeholder="Ex: Supermercado, Salário..."
              required
              error={errors.description?.message}
              {...register('description', { required: 'Descrição obrigatória' })}
            />
          </div>

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            required
            error={errors.amount?.message}
            {...register('amount', { required: 'Valor obrigatório', min: { value: 0.01, message: 'Valor deve ser positivo' } })}
          />

          <Input
            label="Data"
            type="date"
            required
            error={errors.date?.message}
            {...register('date', { required: 'Data obrigatória' })}
          />

          <div className="sm:col-span-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="Categoria"
                  required
                  placeholder="Selecione uma categoria"
                  options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
                  error={errors.categoryId?.message}
                  {...register('categoryId', { required: 'Categoria obrigatória' })}
                />
              </div>
              <button
                type="button"
                title="Nova categoria"
                onClick={handleOpenCategoryModal}
                className="h-[38px] w-[38px] flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-400 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Notas (opcional)"
              placeholder="Observações sobre esta transação..."
              {...register('notes')}
            />
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['PENDING', 'PAID'] as const).map((s) => (
            <label
              key={s}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 cursor-pointer text-sm font-medium transition-colors
                ${watch('status') === s
                  ? s === 'PAID' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <input type="radio" value={s} {...register('status')} className="sr-only" />
              {s === 'PAID' ? '✓ Pago' : '⏳ Pendente'}
            </label>
          ))}
        </div>

        {/* Recurring */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
          <div className="flex items-center gap-3 p-3">
            <input
              type="checkbox"
              id="isRecurring"
              className="w-4 h-4 rounded text-primary-600"
              {...register('isRecurring')}
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Transação recorrente
            </label>
          </div>
          {watchRecurring && (
            <div className="px-3 pb-3 flex gap-3 border-t border-gray-200 dark:border-gray-600 pt-3">
              <Select
                label="Frequência"
                options={[
                  { value: 'DAILY', label: 'Diário' },
                  { value: 'WEEKLY', label: 'Semanal' },
                  { value: 'MONTHLY', label: 'Mensal' },
                  { value: 'YEARLY', label: 'Anual' },
                ]}
                placeholder="Selecionar"
                className="flex-1"
                {...register('frequency')}
              />
              <Input
                label="Parcelas"
                type="number"
                min="2"
                max="360"
                placeholder="∞"
                title="Deixe vazio para repetir indefinidamente"
                className="w-28"
                {...register('installments')}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Salvar Alterações' : 'Criar Transação'}
          </Button>
        </div>
      </form>
    </Modal>

    <CategoryModal
      open={categoryModalOpen}
      onClose={() => setCategoryModalOpen(false)}
    />
    </>
  );
};
