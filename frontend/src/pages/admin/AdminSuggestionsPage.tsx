import { useState } from 'react';
import {
  Lightbulb, Bug, Sparkles, MessageSquareMore,
  Clock, Eye, CheckCircle2, XCircle, Trash2, ChevronDown, ChevronUp, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdminSuggestions,
  useUpdateAdminSuggestion,
  useDeleteAdminSuggestion,
  AdminSuggestion,
  SuggestionStatus,
  SuggestionCategory,
} from '@/hooks/useSuggestions';
import { formatDate } from '@/utils/format';

const CATEGORY_META: Record<SuggestionCategory, { label: string; icon: typeof Lightbulb; color: string }> = {
  FEATURE: { label: 'Ideia', icon: Lightbulb, color: 'text-amber-400' },
  IMPROVEMENT: { label: 'Melhoria', icon: Sparkles, color: 'text-indigo-400' },
  BUG: { label: 'Bug', icon: Bug, color: 'text-rose-400' },
  OTHER: { label: 'Outro', icon: MessageSquareMore, color: 'text-gray-400' },
};

const STATUS_META: Record<SuggestionStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-900/40 text-amber-300', icon: Clock },
  REVIEWED: { label: 'Revisada', color: 'bg-indigo-900/40 text-indigo-300', icon: Eye },
  IMPLEMENTED: { label: 'Implementada', color: 'bg-emerald-900/40 text-emerald-300', icon: CheckCircle2 },
  DECLINED: { label: 'Recusada', color: 'bg-gray-800 text-gray-400', icon: XCircle },
};

const STATUS_FILTERS: { value: '' | SuggestionStatus; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'REVIEWED', label: 'Revisadas' },
  { value: 'IMPLEMENTED', label: 'Implementadas' },
  { value: 'DECLINED', label: 'Recusadas' },
];

const SuggestionRow = ({ s }: { s: AdminSuggestion }) => {
  const [expanded, setExpanded] = useState(false);
  const [adminNote, setAdminNote] = useState(s.adminNote ?? '');
  const update = useUpdateAdminSuggestion();
  const remove = useDeleteAdminSuggestion();

  const cat = CATEGORY_META[s.category];
  const stat = STATUS_META[s.status];
  const CatIcon = cat.icon;
  const StatIcon = stat.icon;

  const updateStatus = async (status: SuggestionStatus) => {
    try {
      await update.mutateAsync({ id: s.id, data: { status } });
      toast.success(`Status alterado para ${STATUS_META[status].label.toLowerCase()}.`);
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao atualizar.');
    }
  };

  const saveNote = async () => {
    try {
      await update.mutateAsync({ id: s.id, data: { adminNote: adminNote.trim() || null } });
      toast.success('Resposta salva.');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao salvar.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir sugestão de ${s.user.name}?`)) return;
    try {
      await remove.mutateAsync(s.id);
      toast.success('Sugestão excluída.');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao excluir.');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-800/50 transition-colors text-left"
      >
        <CatIcon className={`w-5 h-5 flex-shrink-0 ${cat.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${stat.color}`}>
              <StatIcon className="w-3 h-3" /> {stat.label}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{cat.label}</span>
            <span className="text-[10px] text-gray-600">{formatDate(s.createdAt)}</span>
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {s.title || s.content.slice(0, 80) + (s.content.length > 80 ? '…' : '')}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {s.user.name} · {s.user.email}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-800 px-5 py-4 space-y-4">
          {/* Conteúdo */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Sugestão</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{s.content}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Alterar status</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_META) as SuggestionStatus[]).map((st) => {
                const meta = STATUS_META[st];
                const Icon = meta.icon;
                const active = s.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => updateStatus(st)}
                    disabled={update.isPending || active}
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      active ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resposta */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Resposta ao usuário (opcional)</p>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              maxLength={2000}
              placeholder="Ex: Boa ideia! Vamos adicionar isso na próxima sprint."
              className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={saveNote}
                disabled={update.isPending || adminNote === (s.adminNote ?? '')}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3 h-3" /> Salvar resposta
              </button>
            </div>
          </div>

          {/* Danger */}
          <div className="flex justify-end pt-2 border-t border-gray-800">
            <button
              onClick={handleDelete}
              disabled={remove.isPending}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-900/30 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Excluir sugestão
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminSuggestionsPage = () => {
  const [status, setStatus] = useState<'' | SuggestionStatus>('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminSuggestions({ status: status || undefined, page });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sugestões</h1>
        <p className="text-sm text-gray-500">{data?.pagination.total ?? 0} sugestão(ões) no total</p>
      </div>

      {/* Counters */}
      {data?.counts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(STATUS_META) as SuggestionStatus[]).map((st) => {
            const meta = STATUS_META[st];
            const Icon = meta.icon;
            return (
              <button
                key={st}
                type="button"
                onClick={() => { setStatus(status === st ? '' : st); setPage(1); }}
                className={`bg-gray-900 border rounded-xl p-4 text-left transition-all ${
                  status === st ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${meta.color.split(' ')[1]}`} />
                  <span className="text-2xl font-extrabold text-white">{data.counts[st]}</span>
                </div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">{meta.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              status === f.value ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center text-gray-500">Carregando...</div>
        ) : !data?.data.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <Lightbulb className="w-10 h-10 mx-auto text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">Nenhuma sugestão {status ? STATUS_META[status as SuggestionStatus].label.toLowerCase() : 'ainda'}.</p>
          </div>
        ) : (
          data.data.map((s) => <SuggestionRow key={s.id} s={s} />)
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-500">
            Página {page} de {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.totalPages}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};
