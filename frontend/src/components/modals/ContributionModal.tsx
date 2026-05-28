import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAddContribution } from '@/hooks/useGoals';

interface Form { amount: string; note: string; date: string }

interface Props {
  open: boolean;
  onClose: () => void;
  goalId: string;
  goalTitle: string;
}

export const ContributionModal = ({ open, onClose, goalId, goalTitle }: Props) => {
  const addContrib = useAddContribution(goalId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    defaultValues: { amount: '', note: '', date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => { if (open) reset({ amount: '', note: '', date: new Date().toISOString().slice(0, 10) }); }, [open, reset]);

  const onSubmit = async (data: Form) => {
    await addContrib.mutateAsync({
      amount: parseFloat(data.amount),
      note: data.note || undefined,
      date: data.date ? `${data.date}T12:00:00.000Z` : undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Adicionar aporte — ${goalTitle}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0.01"
          required
          autoFocus
          error={errors.amount?.message}
          {...register('amount', { required: 'Valor obrigatório', min: { value: 0.01, message: 'Deve ser positivo' } })}
        />
        <Input
          label="Data"
          type="date"
          {...register('date')}
        />
        <Input
          label="Nota (opcional)"
          placeholder="Ex: transferi dos consultos"
          {...register('note')}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={addContrib.isPending}>Adicionar aporte</Button>
        </div>
      </form>
    </Modal>
  );
};
