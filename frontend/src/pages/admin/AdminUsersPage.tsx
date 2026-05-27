import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Ban } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/format';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-900/40 text-emerald-400',
  TRIAL: 'bg-primary-900/40 text-primary-300',
  EXPIRED: 'bg-amber-900/40 text-amber-400',
  CANCELED: 'bg-rose-900/40 text-rose-400',
  PAST_DUE: 'bg-rose-900/40 text-rose-400',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Pro', TRIAL: 'Trial', EXPIRED: 'Expirado', CANCELED: 'Cancelado', PAST_DUE: 'Inadimplente',
};

export const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers({ search: search || undefined, status: status || undefined, page });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Usuários</h1>
        <p className="text-sm text-gray-500">{data?.pagination.total ?? 0} usuário(s)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome ou email..."
            className="w-full rounded-xl border border-gray-700 bg-gray-900 text-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-700 bg-gray-900 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20"
        >
          <option value="">Todos os status</option>
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Pro Ativo</option>
          <option value="EXPIRED">Expirado</option>
          <option value="CANCELED">Cancelado</option>
          <option value="PAST_DUE">Inadimplente</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Carregando...</div>
        ) : !data?.data.length ? (
          <div className="p-10 text-center text-gray-500">Nenhum usuário encontrado</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {data.data.map((u) => (
              <Link key={u.id} to={`/admin/users/${u.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-800/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{u.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                    {u.isBlocked && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400"><Ban className="w-3 h-3" /> Bloqueado</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[11px] text-gray-500">{u._count.transactions} transações</p>
                  <p className="text-[10px] text-gray-600">desde {formatDate(u.createdAt)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${STATUS_BADGE[u.subscriptionStatus] ?? 'bg-gray-700 text-gray-300'}`}>
                  {STATUS_LABEL[u.subscriptionStatus] ?? u.subscriptionStatus}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Link>
            ))}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">Página {data.pagination.page} de {data.pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.totalPages} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
