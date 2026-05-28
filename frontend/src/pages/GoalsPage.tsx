import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Archive, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { GoalModal } from '@/components/modals/GoalModal';
import { useGoals } from '@/hooks/useGoals';
import { getGoalIcon } from '@/utils/goalIcons';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Goal } from '@/services/goal.service';

const GoalCard = ({ goal }: { goal: Goal }) => {
  const Icon = getGoalIcon(goal.icon);
  const progress = Math.min(100, goal.stats.combined);
  const isDone = goal.status === 'COMPLETED';

  // Dias para a data alvo
  let daysLeft: number | null = null;
  if (goal.targetDate) {
    const target = new Date(goal.targetDate).getTime();
    daysLeft = Math.ceil((target - Date.now()) / 86400000);
  }

  return (
    <Link to={`/metas/${goal.id}`} className="block group">
      <div className={`relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5 ${isDone ? 'opacity-90' : ''}`}>
        {isDone && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> Concluída
          </span>
        )}
        {goal.status === 'ARCHIVED' && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
            <Archive className="w-3 h-3" /> Arquivada
          </span>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: goal.color }}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pr-12">
            <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{goal.title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {goal.type === 'FINANCIAL' ? 'Financeira' : 'Não financeira'}
              {goal.targetDate && (
                <>
                  {' · '}
                  <Calendar className="inline w-3 h-3 -mt-0.5" /> {formatDate(goal.targetDate)}
                  {daysLeft !== null && !isDone && (
                    <span className={`ml-1 font-semibold ${daysLeft < 0 ? 'text-rose-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-gray-400'}`}>
                      ({daysLeft < 0 ? `${-daysLeft}d atrás` : daysLeft === 0 ? 'hoje' : `${daysLeft}d`})
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progresso</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${goal.color}80, ${goal.color})` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          {goal.type === 'FINANCIAL' ? (
            <span>
              <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(goal.stats.contributed)}</strong>
              {goal.targetValue && <> de {formatCurrency(goal.targetValue)}</>}
            </span>
          ) : <span>&nbsp;</span>}
          {goal.stats.stepCount > 0 && (
            <span><strong className="text-gray-700 dark:text-gray-300">{goal.stats.doneCount}/{goal.stats.stepCount}</strong> etapas</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export const GoalsPage = () => {
  const { data: goals = [], isLoading } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  const filtered = goals.filter((g) => filter === 'ALL' ? true : g.status === filter);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Metas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{goals.length} meta(s) cadastrada(s)</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Nova Meta</Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1 w-fit shadow-inner">
        {([
          { v: 'ACTIVE', l: 'Ativas' },
          { v: 'COMPLETED', l: 'Concluídas' },
          { v: 'ALL', l: 'Todas' },
        ] as const).map((t) => (
          <button
            key={t.v}
            onClick={() => setFilter(t.v)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === t.v ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >{t.l}</button>
        ))}
      </div>

      {!filtered.length ? (
        <Card>
          <EmptyState
            icon={Target}
            title={filter === 'ACTIVE' ? 'Nenhuma meta ativa' : filter === 'COMPLETED' ? 'Nenhuma meta concluída ainda' : 'Nenhuma meta'}
            description="Crie uma meta financeira (ex: poupar R$50k) ou não financeira (ex: perder 5kg). Acompanhe progresso por aportes e etapas."
            action={{ label: 'Criar meta', onClick: () => setModalOpen(true) }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
