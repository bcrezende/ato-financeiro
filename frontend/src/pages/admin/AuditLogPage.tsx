import { useState } from 'react';
import { useAuditLog } from '@/hooks/useAdmin';

const ACTION_LABEL: Record<string, string> = {
  LOGIN: 'Login',
  USER_SUBSCRIPTION_UPDATE: 'Alterou assinatura',
  USER_BLOCK: 'Bloqueou usuário',
  USER_UNBLOCK: 'Desbloqueou usuário',
  USER_DELETE: 'Excluiu usuário',
  ADMIN_CREATE: 'Criou admin',
};

export const AuditLogPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLog(page);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Auditoria</h1>
        <p className="text-sm text-gray-500">Registro de todas as ações administrativas</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : !data?.data.length ? (
          <div className="p-8 text-center text-gray-500">Nenhuma ação registrada</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {data.data.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{log.admin?.name ?? 'Admin'}</span>{' '}
                    <span className="text-gray-400">— {ACTION_LABEL[log.action] ?? log.action}</span>
                  </p>
                  {log.metadata && <p className="text-[10px] text-gray-600 truncate font-mono">{log.metadata}</p>}
                </div>
                <p className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
              </div>
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
