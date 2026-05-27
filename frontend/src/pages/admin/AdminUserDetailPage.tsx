import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ban, ShieldCheck, Trash2, Crown, Clock } from 'lucide-react';
import { useAdminUser, useUpdateUserSubscription, useToggleUserBlock, useDeleteUser } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

const STATUSES = ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED', 'PAST_DUE'];

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useAdminUser(id);
  const updateSub = useUpdateUserSubscription();
  const toggleBlock = useToggleUserBlock();
  const deleteUser = useDeleteUser();
  const [confirmDelete, setConfirmDelete] = useState('');

  if (isLoading || !user) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>;
  }

  const setStatus = (status: string) => {
    updateSub.mutate({ id: user.id, data: { subscriptionStatus: status } }, {
      onSuccess: () => toast.success(`Status alterado para ${status}`),
      onError: () => toast.error('Erro ao alterar'),
    });
  };

  const extendTrial = (days: number) => {
    const ends = new Date(Date.now() + days * 86400000).toISOString();
    updateSub.mutate({ id: user.id, data: { subscriptionStatus: 'TRIAL', trialEndsAt: ends } }, {
      onSuccess: () => toast.success(`Trial estendido por ${days} dias`),
      onError: () => toast.error('Erro ao estender'),
    });
  };

  const handleBlock = () => {
    toggleBlock.mutate({ id: user.id, blocked: !user.isBlocked }, {
      onSuccess: () => toast.success(user.isBlocked ? 'Usuário desbloqueado' : 'Usuário bloqueado'),
      onError: () => toast.error('Erro'),
    });
  };

  const handleDelete = () => {
    if (confirmDelete !== user.email) { toast.error('Digite o email exato para confirmar'); return; }
    deleteUser.mutate(user.id, {
      onSuccess: () => { toast.success('Usuário excluído'); navigate('/admin/users'); },
      onError: () => toast.error('Erro ao excluir'),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">{user.name}</h1>
            {user.isBlocked && <span className="text-[10px] font-bold text-rose-400 bg-rose-900/30 px-2 py-0.5 rounded">BLOQUEADO</span>}
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-600 mt-0.5">Membro desde {formatDate(user.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase">Status</p>
          <p className="text-sm font-bold text-white">{user.subscriptionStatus}</p>
          {user.trialEndsAt && <p className="text-[10px] text-gray-500">trial até {formatDate(user.trialEndsAt)}</p>}
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Transações', value: user._count.transactions },
          { label: 'Orçamentos', value: user._count.budgets },
          { label: 'Categorias', value: user._count.categories },
          { label: 'Sonhos', value: user._count.dreamItems },
        ].map((c) => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xl font-extrabold text-white">{c.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Subscription control */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Assinatura</h2>
        </div>
        <p className="text-xs text-gray-500 mb-2">Definir status manualmente:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              disabled={updateSub.isPending}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                user.subscriptionStatus === s ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-2">Estender trial:</p>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => extendTrial(d)} disabled={updateSub.isPending} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">
              <Clock className="w-3 h-3" /> +{d} dias
            </button>
          ))}
        </div>
      </div>

      {/* Block */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            {user.isBlocked ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Ban className="w-4 h-4 text-amber-400" />}
            {user.isBlocked ? 'Desbloquear acesso' : 'Bloquear acesso'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {user.isBlocked ? 'O usuário voltará a conseguir entrar.' : 'Impede o login e o uso da API imediatamente.'}
          </p>
        </div>
        <button
          onClick={handleBlock}
          disabled={toggleBlock.isPending}
          className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
            user.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-gray-900 border-2 border-rose-900/50 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4" /> Excluir usuário
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Apaga a conta e <strong>todos os dados</strong> (transações, orçamentos, categorias, sonhos). Irreversível.
          Digite <strong className="text-gray-300">{user.email}</strong> para confirmar.
        </p>
        <div className="flex gap-2">
          <input
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder={user.email}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500"
          />
          <button
            onClick={handleDelete}
            disabled={deleteUser.isPending || confirmDelete !== user.email}
            className="text-sm font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
