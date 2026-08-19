import { create } from 'zustand';

export type DurationKind = '25' | '50' | 'free' | 'custom';

interface DurationSelectionState {
  kind: DurationKind;
  customMinutes: number;
  select: (kind: DurationKind) => void;
  setCustomMinutes: (minutes: number) => void;
}

export const useDurationSelectionStore = create<DurationSelectionState>()((set) => ({
  kind: '25',
  customMinutes: 90,
  select: (kind) => set({ kind }),
  setCustomMinutes: (customMinutes) => set({ customMinutes }),
}));

export function durationSelectionToPlannedSeconds(
  kind: DurationKind,
  customMinutes: number,
): { plannedSeconds: number | null; mode: 'TIMED' | 'FREE' } {
  if (kind === '25') return { plannedSeconds: 25 * 60, mode: 'TIMED' };
  if (kind === '50') return { plannedSeconds: 50 * 60, mode: 'TIMED' };
  if (kind === 'custom') return { plannedSeconds: customMinutes * 60, mode: 'TIMED' };
  return { plannedSeconds: null, mode: 'FREE' };
}
