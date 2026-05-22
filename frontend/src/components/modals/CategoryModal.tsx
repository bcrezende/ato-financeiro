import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { Category } from '@/types';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316',
  '#f59e0b','#22c55e','#10b981','#06b6d4','#0ea5e9',
  '#3b82f6','#64748b',
];

const ICONS = [
  'tag','home','car','utensils','heart','book','smile',
  'shopping-bag','file-text','briefcase','laptop','trending-up',
  'coffee','music','gift','globe','star','zap',
];

interface FormValues {
  name: string;
  color: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

export const CategoryModal = ({ open, onClose, category }: CategoryModalProps) => {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEditing = !!category;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', color: '#6366f1', icon: 'tag', type: 'EXPENSE' },
  });

  const watchColor = watch('color');
  const watchIcon = watch('icon');

  useEffect(() => {
    if (category) {
      reset({ name: category.name, color: category.color, icon: category.icon, type: category.type });
    } else {
      reset({ name: '', color: '#6366f1', icon: 'tag', type: 'EXPENSE' });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: FormValues) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: category!.id, data: { name: data.name, color: data.color, icon: data.icon } });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          placeholder="Ex: Alimentação"
          required
          error={errors.name?.message}
          {...register('name', { required: 'Nome obrigatório' })}
        />

        {!isEditing && (
          <Select
            label="Tipo"
            options={[{ value: 'EXPENSE', label: 'Despesa' }, { value: 'INCOME', label: 'Receita' }]}
            {...register('type')}
          />
        )}

        {/* Color picker */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Cor</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${watchColor === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={watchColor}
              onChange={(e) => setValue('color', e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200"
              title="Cor personalizada"
            />
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Ícone</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setValue('icon', icon)}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-mono transition-all hover:scale-105
                  ${watchIcon === icon ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
              >
                {icon.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: watchColor }}>
            {watchIcon.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{watch('name') || 'Preview'}</span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Salvar' : 'Criar Categoria'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
