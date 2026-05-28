import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WhatsNewState {
  /** Versão mais recente que o usuário já reconheceu. */
  seenVersion: string | null;
  /** Marca uma versão como já vista. */
  markSeen: (version: string) => void;
  /** Reseta — só útil pra debug/testar. */
  reset: () => void;
}

export const useWhatsNewStore = create<WhatsNewState>()(
  persist(
    (set) => ({
      seenVersion: null,
      markSeen: (version) => set({ seenVersion: version }),
      reset: () => set({ seenVersion: null }),
    }),
    {
      name: 'ato-whats-new',
      partialize: (s) => ({ seenVersion: s.seenVersion }),
    },
  ),
);
