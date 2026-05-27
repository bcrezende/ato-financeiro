import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets';
import { Budget } from '@/types';

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget?: Budget | null;
  defaultMonth?: number;
  defaultYear?: number;
  onSaved?: (month: number, year: number) => void;
}

interface FormValues {
  name: string;
  amount: string;
  categoryId: string;
  month: string;
  year: string;
  alertAt: string;
}

export const BudgetModal = ({ open, onClose, budget, defaultMonth, defaultYear, onSaved }: BudgetModalProps) => {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isEditing = !!budget;
  const now = new Date();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '', amount: '', categoryId: '',
      month: String(defaultMonth ?? now.getMonth() + 1),
      year: String(defaultYear ?? now.getFullYear()),
      alertAt: '80',
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        amount: String(budget.amount),
        categoryId: budget.categoryId,
        month: String(budget.month),
        year: String(budget.year),
        alertAt: String(budget.alertAt),
      });
    } else {
      reset({
        name: '', amount: '', categoryId: '',
        month: String(defaultMonth ?? now.getMonth() + 1),
        year: String(defaultYear ?? now.getFullYear()),
        alertAt: '80',
      });
    }
  }, [budget, open, reset]);

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }),
  }));
  const years = Array.from({ length: 5 }, (_, i) => ({ value: now.getFullYear() + i - 1, label: String(now.getFullYear() + i - 1) }));

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      amount: parseFloat(data.amount),
      categoryId: data.categoryId,
      month: parseInt(data.month),
      year: parseInt(data.year),
      alertAt: parseInt(data.alertAt),
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: budget!.id, data: { name: data.name, amount: parseFloat(data.amount), alertAt: parseInt(data.alertAt) } });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSaved?.(payload.month, payload.year);
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          placeholder="Ex: Alimentação de Agosto"
          required
          error={errors.name?.message}
          {...register('name', { required: 'Nome obrigatório' })}
        />

        <Input
          label="Valor limite (R$)"
          type="number"
          step="0.01"
          min="0.01"
          required
          error={errors.amount?.message}
          {...register('amount', { required: 'Valor obrigatório', min: { value: 0.01, message: 'Deve ser positivo' } })}
        />

        {!isEditing && (
          <Select
            label="Categoria (Despesa)"
            required
            placeholder="Selecione"
            options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.categoryId?.message}
            {...register('categoryId', { required: 'Categoria obrigatória' })}
          />
        )}

        {!isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <Select label="Mês" options={months} {...register('month')} />
            <Select label="Ano" options={years} {...register('year')} />
          </div>
        )}

        <div className="flex items-center gap-3">
          <Input
            label="Alerta ao atingir (%)"
            type="number"
            min="1"
            max="100"
            className="w-24"
            {...register('alertAt')}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-5">
            Você será alertado quando o gasto atingir esta porcentagem do limite.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
