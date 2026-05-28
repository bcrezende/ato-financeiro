import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Pencil, CheckCircle2, Circle,
  Calendar, Wallet, ListChecks, Archive, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GoalModal } from '@/components/modals/GoalModal';
import { ContributionModal } from '@/components/modals/ContributionModal';
import { useGoal, useAddStep, useToggleStep, useDeleteStep, useDeleteContribution, useDeleteGoal, useUpdateGoal } from '@/hooks/useGoals';
import { formatCurrency, formatDate } from '@/utils/format';
import { getGoalIcon } from '@/utils/goalIcons';

export const GoalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: goal, isLoading } = useGoal(id);
  const addStep = useAddStep(id ?? '');
  const toggleStep = useToggleStep(id ?? '');
  const deleteStep = useDeleteStep(id ?? '');
  const deleteContrib = useDeleteContribution(id ?? '');
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();

  const [editOpen, setEditOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [newStep, setNewStep] = useState('');

  if (isLoading || !goal) return <PageLoader />;

  const Icon = getGoalIcon(goal.icon);
  const progress = Math.min(100, goal.stats.combined);
  const isCompleted = goal.status === 'COMPLETED';

  const handleAddStep = async () => {
    const title = newStep.trim();
    if (!title) return;
    await addStep.mutateAsync(title);
    setNewStep('');
  };

  const handleToggleArchive = () => {
    updateGoal.mutate({ id: goal.id, data: { status: goal.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' } });
  };

  const handleDelete = async () => {
    await deleteGoal.mutateAsync(goal.id);
    navigate('/metas');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Link to="/metas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Voltar para Metas
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${goal.color}, ${goal.color}cc)` }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isCompleted && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/30 px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3" /> Concluída</span>}
              {goal.status === 'ARCHIVED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded"><Archive className="w-3 h-3" /> Arquivada</span>}
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/15 px-2 py-0.5 rounded">{goal.type === 'FINANCIAL' ? 'Financeira' : 'Não financeira'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{goal.title}</h1>
            {goal.description && <p className="text-sm text-white/80 mt-1">{goal.description}</p>}
            {goal.targetDate && (
              <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Alvo: {formatDate(goal.targetDate)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30" onClick={() => setEditOpen(true)} icon={<Pencil className="w-3.5 h-3.5" />}>Editar</Button>
          </div>
        </div>

        {/* Barra de progresso grande */}
        <div className="relative mt-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Progresso</span>
            <span className="text-2xl font-extrabold">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          {/* Sub-barras quando financeira com etapas */}
          {goal.type === 'FINANCIAL' && goal.stats.stepCount > 0 && goal.stats.valueProgress !== null && (
            <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
              <div>
                <p className="text-white/70 mb-1">Valor — {Math.round(goal.stats.valueProgress)}%</p>
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-emerald-300 rounded-full" style={{ width: `${goal.stats.valueProgress}%` }} />
                </div>
              </div>
              <div>
                <p className="text-white/70 mb-1">Etapas — {Math.round(goal.stats.stepsProgress ?? 0)}%</p>
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-amber-300 rounded-full" style={{ width: `${goal.stats.stepsProgress ?? 0}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {goal.type === 'FINANCIAL' && (
          <Card>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aportado</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(goal.stats.contributed)}</p>
            {goal.targetValue && (
              <p className="text-[11px] text-gray-500 mt-0.5">Falta {formatCurrency(Math.max(0, goal.targetValue - goal.stats.contributed))}</p>
            )}
          </Card>
        )}
        {goal.type === 'FINANCIAL' && goal.targetValue && (
          <Card>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valor alvo</p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{formatCurrency(goal.targetValue)}</p>
          </Card>
        )}
        <Card>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Etapas</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{goal.stats.doneCount}/{goal.stats.stepCount}</p>
        </Card>
      </div>

      {/* Etapas + Aportes lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Etapas */}
        <Card title="Etapas" action={<ListChecks className="w-4 h-4 text-gray-400" />}>
          {goal.steps.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">Nenhuma etapa ainda.</p>
          ) : (
            <ul className="space-y-1.5 mb-3">
              {goal.steps.map((s) => (
                <li key={s.id} className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <button onClick={() => toggleStep.mutate({ stepId: s.id, isDone: !s.isDone })} className="text-gray-400 hover:text-emerald-500">
                    {s.isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <span className={`flex-1 text-sm ${s.isDone ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{s.title}</span>
                  <button onClick={() => deleteStep.mutate(s.id)} className="p-1 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStep(); } }}
              placeholder="Nova etapa..."
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2"
            />
            <Button size="sm" variant="secondary" onClick={handleAddStep} icon={<Plus className="w-4 h-4" />}>Adicionar</Button>
          </div>
        </Card>

        {/* Aportes (só financeira) */}
        {goal.type === 'FINANCIAL' && (
          <Card
            title="Aportes"
            action={<Wallet className="w-4 h-4 text-gray-400" />}
          >
            {goal.contributions.length === 0 ? (
              <p className="text-sm text-gray-500 mb-3">Nenhum aporte ainda.</p>
            ) : (
              <ul className="space-y-1.5 mb-3 max-h-64 overflow-y-auto">
                {goal.contributions.map((c) => (
                  <li key={c.id} className="group flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-emerald-600">+{formatCurrency(c.amount)}</p>
                      <p className="text-[11px] text-gray-500">{formatDate(c.date)} {c.note && <> · {c.note}</>}</p>
                    </div>
                    <button onClick={() => deleteContrib.mutate(c.id)} className="p-1 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button size="sm" onClick={() => setContribOpen(true)} icon={<Plus className="w-4 h-4" />}>Adicionar aporte</Button>
          </Card>
        )}
      </div>

      {/* Ações secundárias */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="secondary" onClick={handleToggleArchive} icon={<Archive className="w-4 h-4" />}>
          {goal.status === 'ARCHIVED' ? 'Desarquivar' : 'Arquivar'}
        </Button>
        {!isCompleted && progress === 100 && (
          <Button variant="success" onClick={() => updateGoal.mutate({ id: goal.id, data: { status: 'COMPLETED' } })} icon={<Sparkles className="w-4 h-4" />}>
            Marcar concluída
          </Button>
        )}
        <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)} icon={<Trash2 className="w-4 h-4" />}>Excluir meta</Button>
      </div>

      {/* Modals */}
      <GoalModal open={editOpen} onClose={() => setEditOpen(false)} goal={goal} />
      <ContributionModal open={contribOpen} onClose={() => setContribOpen(false)} goalId={goal.id} goalTitle={goal.title} />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteGoal.isPending}
        title="Excluir meta"
        description="A meta e todas as etapas e aportes serão removidos permanentemente."
        confirmLabel="Excluir"
      />
    </div>
  );
};
