import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GOAL_ICONS, GOAL_COLORS, getGoalIcon } from '@/utils/goalIcons';
import { useCreateGoal, useUpdateGoal } from '@/hooks/useGoals';
import { Goal } from '@/services/goal.service';

interface FormValues {
  title: string;
  description: string;
  type: 'FINANCIAL' | 'OTHER';
  targetValue: string;
  targetDate: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onSaved?: (goal: Goal) => void;
}

export const GoalModal = ({ open, onClose, goal, onSaved }: Props) => {
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const isEditing = !!goal;

  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [icon, setIcon] = useState('target');
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { title: '', description: '', type: 'FINANCIAL', targetValue: '', targetDate: '' },
  });

  const watchType = watch('type');

  useEffect(() => {
    if (!open) return;
    if (goal) {
      reset({
        title: goal.title,
        description: goal.description ?? '',
        type: goal.type,
        targetValue: goal.targetValue ? String(goal.targetValue) : '',
        targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      });
      setColor(goal.color);
      setIcon(goal.icon);
      setSteps([]); // edição não mexe nas etapas já criadas (faz isso na detail)
    } else {
      reset({ title: '', description: '', type: 'FINANCIAL', targetValue: '', targetDate: '' });
      setColor(GOAL_COLORS[0]);
      setIcon('target');
      setSteps([]);
    }
    setNewStep('');
  }, [open, goal, reset]);

  const addLocalStep = () => {
    const t = newStep.trim();
    if (!t) return;
    setSteps((s) => [...s, t]);
    setNewStep('');
  };

  const onSubmit = async (data: FormValues) => {
    const payload: any = {
      title: data.title,
      description: data.description || undefined,
      type: data.type,
      targetValue: data.type === 'FINANCIAL' && data.targetValue ? parseFloat(data.targetValue) : undefined,
      targetDate: data.targetDate ? `${data.targetDate}T12:00:00.000Z` : null,
      color,
      icon,
    };
    if (isEditing) {
      const updated = await update.mutateAsync({ id: goal!.id, data: payload });
      onSaved?.(updated);
    } else {
      payload.initialSteps = steps;
      const created = await create.mutateAsync(payload);
      onSaved?.(created);
    }
    onClose();
  };

  const Icon = getGoalIcon(icon);
  const isLoading = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar Meta' : 'Nova Meta'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          {(['FINANCIAL', 'OTHER'] as const).map((t) => (
            <label
              key={t}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer text-sm font-bold transition-colors ${
                watchType === t
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              {t === 'FINANCIAL' ? '💰 Financeira' : '✅ Não financeira'}
            </label>
          ))}
        </div>

        {/* Preview do ícone com cor */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: color }}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Pré-visualização do ícone e cor</div>
        </div>

        <Input
          label="Título"
          placeholder="Ex: Fechar o ano com R$50k na poupança"
          required
          error={errors.title?.message}
          {...register('title', { required: 'Título obrigatório' })}
        />

        <Input
          label="Descrição (opcional)"
          placeholder="Detalhes, motivações..."
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {watchType === 'FINANCIAL' && (
            <Input
              label="Valor alvo (R$)"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="50000.00"
              error={errors.targetValue?.message}
              {...register('targetValue', {
                validate: (v) => watchType !== 'FINANCIAL' || (v && parseFloat(v) > 0) || 'Valor obrigatório',
              })}
            />
          )}
          <Input
            label="Data alvo (opcional)"
            type="date"
            {...register('targetDate')}
          />
        </div>

        {/* Cor */}
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Cor</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        {/* Ícone */}
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Ícone</p>
          <div className="grid grid-cols-8 gap-2">
            {GOAL_ICONS.map((g) => {
              const G = g.icon;
              return (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setIcon(g.name)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    icon === g.name
                      ? 'bg-primary-600 text-white scale-110 shadow'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <G className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Etapas (só na criação) */}
        {!isEditing && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Etapas (opcional)</p>
            <div className="space-y-1.5 mb-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{s}</span>
                  <button type="button" onClick={() => setSteps((arr) => arr.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocalStep(); } }}
                placeholder="Ex: Fazer consórcio, economizar R$500/mês..."
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addLocalStep} icon={<Plus className="w-4 h-4" />}>Adicionar</Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Você poderá adicionar/editar etapas depois também.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isLoading}>{isEditing ? 'Salvar' : 'Criar Meta'}</Button>
        </div>
      </form>
    </Modal>
  );
};
