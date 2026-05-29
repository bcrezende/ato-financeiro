import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lightbulb, Bug, Sparkles, MessageSquareMore, Trash2, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  useMySuggestions,
  useCreateSuggestion,
  useDeleteMySuggestion,
  Suggestion,
  SuggestionCategory,
  SuggestionStatus,
} from '@/hooks/useSuggestions';
import { formatDate } from '@/utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  category: SuggestionCategory;
  title: string;
  content: string;
}

const CATEGORIES: { value: SuggestionCategory; label: string; icon: typeof Lightbulb; color: string }[] = [
  { value: 'FEATURE', label: 'Nova ideia', icon: Lightbulb, color: 'text-amber-500' },
  { value: 'IMPROVEMENT', label: 'Melhoria', icon: Sparkles, color: 'text-indigo-500' },
  { value: 'BUG', label: 'Problema', icon: Bug, color: 'text-rose-500' },
  { value: 'OTHER', label: 'Outro', icon: MessageSquareMore, color: 'text-gray-500' },
];

const STATUS_BADGE: Record<SuggestionStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: 'Em análise', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  REVIEWED: { label: 'Revisada', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Eye },
  IMPLEMENTED: { label: 'Implementada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  DECLINED: { label: 'Não será feita', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: XCircle },
};

export const SuggestionModal = ({ open, onClose }: Props) => {
  const [view, setView] = useState<'new' | 'history'>('new');
  const { data: mySuggestions, isLoading } = useMySuggestions();
  const create = useCreateSuggestion();
  const remove = useDeleteMySuggestion();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { category: 'FEATURE', title: '', content: '' },
  });
  const selectedCategory = watch('category');

  useEffect(() => {
    if (open) {
      setView('new');
      reset({ category: 'FEATURE', title: '', content: '' });
    }
  }, [open, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await create.mutateAsync({
        content: data.content,
        title: data.title || undefined,
        category: data.category,
      });
      toast.success('Sugestão enviada! Obrigado por ajudar a melhorar a Ato 💜');
      reset({ category: 'FEATURE', title: '', content: '' });
      setView('history');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao enviar sugestão.');
    }
  };

  const handleDelete = async (s: Suggestion) => {
    if (!confirm('Remover esta sugestão?')) return;
    try {
      await remove.mutateAsync(s.id);
      toast.success('Sugestão removida.');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao remover.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Mande sua sugestão" size="lg">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setView('new')}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
            view === 'new'
              ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Nova sugestão
        </button>
        <button
          type="button"
          onClick={() => setView('history')}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
            view === 'history'
              ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Minhas sugestões {mySuggestions?.length ? `(${mySuggestions.length})` : ''}
        </button>
      </div>

      {view === 'new' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => {
                const active = selectedCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('category', value)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      active
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? color : 'text-gray-400'}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Título (opcional)"
            placeholder="Ex: Importar extrato OFX"
            maxLength={120}
            error={errors.title?.message}
            {...register('title', { maxLength: { value: 120, message: 'Máximo 120 caracteres' } })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Sua sugestão <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              maxLength={2000}
              placeholder="Conte com detalhes o que você gostaria de ver na Ato, ou descreva um problema que está enfrentando..."
              {...register('content', {
                required: 'Conta um pouquinho da sua ideia 🙂',
                minLength: { value: 5, message: 'Pelo menos 5 caracteres' },
                maxLength: { value: 2000, message: 'Máximo 2000 caracteres' },
              })}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all resize-none
                focus:outline-none focus:ring-4
                ${errors.content
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                  : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/15'}
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                hover:border-gray-300 dark:hover:border-gray-600`}
            />
            {errors.content && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span>⚠</span>{errors.content.message}
              </p>
            )}
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Sua sugestão vai direto para a equipe da Ato. Lemos todas. 💜
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={create.isPending}>Enviar sugestão</Button>
          </div>
        </form>
      ) : (
        <div>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">Carregando...</div>
          ) : !mySuggestions?.length ? (
            <div className="py-10 text-center">
              <Lightbulb className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">Você ainda não mandou nenhuma sugestão.</p>
              <button
                type="button"
                onClick={() => setView('new')}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 mt-2"
              >
                Mandar a primeira →
              </button>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
              {mySuggestions.map((s) => {
                const badge = STATUS_BADGE[s.status];
                const cat = CATEGORIES.find((c) => c.value === s.category);
                const CatIcon = cat?.icon ?? MessageSquareMore;
                const BadgeIcon = badge.icon;
                return (
                  <li key={s.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          <CatIcon className={`w-3 h-3 ${cat?.color}`} />
                          {cat?.label}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(s.createdAt)}</span>
                      </div>
                      {s.status === 'PENDING' && (
                        <button
                          onClick={() => handleDelete(s)}
                          disabled={remove.isPending}
                          className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {s.title && <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{s.title}</p>}
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{s.content}</p>
                    {s.adminNote && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
                          Resposta da equipe Ato
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{s.adminNote}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
};
