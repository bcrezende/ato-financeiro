import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CHANGELOG } from '@/data/changelog';
import { useWhatsNewStore } from '@/store/whatsNew.store';
import { useTourStore } from '@/store/tour.store';
import { useAuthStore } from '@/store/auth.store';

/**
 * Mostra automaticamente a entrada mais recente do CHANGELOG quando o usuário
 * ainda não reconheceu essa versão. Para usuários totalmente novos (sem versão
 * gravada e ainda no tour) **não exibe** — a saudação de boas-vindas é o tour.
 */
export const WhatsNewModal = () => {
  const { isAuthenticated } = useAuthStore();
  const { seenVersion, markSeen } = useWhatsNewStore();
  const { run: tourRunning, completed: tourCompleted } = useTourStore();
  const [open, setOpen] = useState(false);

  const latest = CHANGELOG[0];

  useEffect(() => {
    if (!isAuthenticated || !latest) return;
    // Não atropela o tour de onboarding
    if (tourRunning) return;

    if (seenVersion === null) {
      // Primeira visita pós-instalação: se o tour já foi feito, mostramos as
      // novidades. Se ainda não, marcamos silenciosamente — usuário novo não
      // precisa ver changelog do que ainda nem viu.
      if (tourCompleted) {
        setOpen(true);
      } else {
        markSeen(latest.version);
      }
      return;
    }
    if (seenVersion !== latest.version) setOpen(true);
  }, [isAuthenticated, seenVersion, latest, tourRunning, tourCompleted, markSeen]);

  const close = () => {
    setOpen(false);
    if (latest) markSeen(latest.version);
  };

  if (!latest) return null;

  return (
    <Modal open={open} onClose={close} title="" size="md">
      <div className="relative">
        <button
          onClick={close}
          className="absolute -top-2 -right-2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg shadow-primary-200/50 dark:shadow-primary-900/30 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">
            Novidades · v{latest.version}
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{latest.title}</h2>
        </div>

        {/* Highlights */}
        <ul className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto">
          {latest.highlights.map((h) => (
            <li key={h.title} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg">
                {h.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{h.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">{h.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <Button onClick={close} className="w-full" size="lg">
          Entendi, vamos lá
        </Button>
      </div>
    </Modal>
  );
};
