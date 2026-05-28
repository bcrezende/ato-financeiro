import { useState, useEffect } from 'react';
import { AlertTriangle, Repeat } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export type RecurringScope = 'this' | 'future' | 'all';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (scope: RecurringScope) => void;
  loading?: boolean;
  description: string;        // ex: "Aluguel"
  installmentNumber?: number; // 3
  installments?: number;      // 12
}

export const RecurringDeleteDialog = ({
  open, onClose, onConfirm, loading,
  description, installmentNumber, installments,
}: Props) => {
  const [scope, setScope] = useState<RecurringScope>('this');

  useEffect(() => { if (open) setScope('this'); }, [open]);

  const futureCount = (installments ?? 0) - (installmentNumber ?? 1) + 1;
  const allCount = installments ?? 0;

  const options: { value: RecurringScope; label: string; sub: string }[] = [
    { value: 'this', label: 'Apenas esta parcela', sub: 'Remove só esta. As demais permanecem.' },
    { value: 'future', label: 'Esta e as próximas', sub: futureCount > 1 ? `${futureCount} parcelas serão removidas.` : 'Esta parcela será removida.' },
    { value: 'all', label: 'Todas as parcelas da série', sub: allCount > 0 ? `${allCount} parcelas serão removidas.` : 'Toda a série será removida.' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-purple-500" /> Excluir transação recorrente
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              "{description}" faz parte de uma série. O que você quer remover?
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                scope === opt.value
                  ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value)}
                className="mt-1 accent-rose-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opt.sub}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="danger" className="flex-1" loading={loading} onClick={() => onConfirm(scope)}>
            Remover
          </Button>
        </div>
      </div>
    </Modal>
  );
};
