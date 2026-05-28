import { Repeat, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { nextOccurrence, FREQUENCY_LABEL } from '@/utils/recurrence';

interface Props {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

/**
 * Aparece logo após marcar uma transação recorrente como paga.
 * Oferece gerar a próxima ocorrência (com data já calculada para o usuário ver).
 */
export const GenerateNextDialog = ({ open, transaction, onClose, onConfirm, loading }: Props) => {
  if (!transaction || !transaction.frequency) return null;

  const nextDate = nextOccurrence(transaction.date, transaction.frequency);
  const freqLabel = FREQUENCY_LABEL[transaction.frequency] ?? transaction.frequency.toLowerCase();

  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Marcou como paga 🎉</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Como essa é uma recorrência <strong className="text-gray-700 dark:text-gray-300">{freqLabel}</strong>,
              quer já gerar a próxima ocorrência?
            </p>
          </div>
        </div>

        {/* Preview da próxima */}
        <div className="rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700/50 bg-purple-50/50 dark:bg-purple-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700 dark:text-purple-300">Próxima parcela</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{transaction.description}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(nextDate)}
            </span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            Será criada como <strong>pendente</strong>. Quando marcar essa também, o sistema oferece a próxima.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Agora não
          </Button>
          <Button className="flex-1" onClick={onConfirm} loading={loading}>
            Sim, gerar próxima
          </Button>
        </div>
      </div>
    </Modal>
  );
};
