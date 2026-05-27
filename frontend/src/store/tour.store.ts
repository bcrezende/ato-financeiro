import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourState {
  completed: boolean;
  run: boolean;
  start: () => void;
  finish: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      completed: false,
      run: false,
      start: () => set({ run: true }),
      finish: () => set({ run: false, completed: true }),
    }),
    {
      name: 'ato-tour',
      // Only the "completed" flag needs to survive reloads; "run" is session UI state.
      partialize: (s) => ({ completed: s.completed }),
    },
  ),
);
