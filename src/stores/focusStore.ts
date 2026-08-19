import { create } from 'zustand';

import {
  finalizeSession,
  getActiveSession,
  startSession as repoStartSession,
} from '@/features/focus/sessionRepository';
import { haptics } from '@/services/haptics';
import {
  cancelBreakCompleteNotification,
  cancelFocusCompleteNotification,
  scheduleBreakCompleteNotification,
  scheduleFocusCompleteNotification,
} from '@/services/notifications/notificationsService';
import { startShielding, stopShielding } from '@/services/screenTime/screenTimeService';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';
import type { FocusSession, SessionMode } from '@/types/session';

export type FocusPhase = 'idle' | 'active' | 'grace';

const BREAK_SECONDS = 5 * 60;

interface FocusState {
  activeSession: FocusSession | null;
  phase: FocusPhase;
  graceEndsAt: number | null;
  lastFinishedSession: FocusSession | null;
  isBreakActive: boolean;
  breakEndsAt: number | null;
  hydrated: boolean;
}

interface FocusActions {
  reconcileOnLaunch: () => Promise<void>;
  startFocusSession: (input: {
    plannedSeconds: number | null;
    mode: SessionMode;
    blockedAppCount: number;
  }) => Promise<FocusSession>;
  checkForAutoCompletion: () => Promise<void>;
  endSessionManually: () => Promise<void>;
  enterGrace: () => void;
  resumeFromGrace: () => void;
  expireGrace: () => Promise<void>;
  startBreak: () => Promise<void>;
  skipBreak: () => Promise<void>;
  clearLastFinishedSession: () => void;
}

async function finishSession(
  session: FocusSession,
  status: 'COMPLETED' | 'INTERRUPTED',
  focusedSeconds: number,
): Promise<FocusSession | null> {
  const finalized = await finalizeSession(session.id, status, focusedSeconds);
  await stopShielding(session.id);
  await cancelFocusCompleteNotification();
  return finalized;
}

export const useFocusStore = create<FocusState & FocusActions>()((set, get) => ({
  activeSession: null,
  phase: 'idle',
  graceEndsAt: null,
  lastFinishedSession: null,
  isBreakActive: false,
  breakEndsAt: null,
  hydrated: false,

  reconcileOnLaunch: async () => {
    const active = await getActiveSession();
    if (!active) {
      set({ hydrated: true });
      return;
    }
    if (active.mode === 'TIMED' && active.targetEndAt != null && active.targetEndAt <= Date.now()) {
      const finalized = await finishSession(active, 'COMPLETED', active.plannedSeconds ?? active.focusedSeconds);
      set({ activeSession: null, phase: 'idle', lastFinishedSession: finalized, hydrated: true });
      return;
    }
    set({ activeSession: active, phase: 'active', hydrated: true });
  },

  startFocusSession: async ({ plannedSeconds, mode, blockedAppCount }) => {
    const session = await repoStartSession({ plannedSeconds, mode, blockedAppCount });
    if (blockedAppCount > 0) {
      await startShielding(session.id, session.targetEndAt ?? Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    if (session.targetEndAt) {
      await scheduleFocusCompleteNotification(session.targetEndAt);
    }
    haptics.sessionStart();
    set({ activeSession: session, phase: 'active', graceEndsAt: null });
    return session;
  },

  checkForAutoCompletion: async () => {
    const { activeSession, phase } = get();
    if (!activeSession || phase !== 'active') return;
    if (activeSession.mode !== 'TIMED' || activeSession.targetEndAt == null) return;
    if (Date.now() < activeSession.targetEndAt) return;
    const finalized = await finishSession(activeSession, 'COMPLETED', activeSession.plannedSeconds ?? 0);
    haptics.success();
    set({ activeSession: null, phase: 'idle', graceEndsAt: null, lastFinishedSession: finalized });
    useStatsStore.getState().refresh();
  },

  endSessionManually: async () => {
    const { activeSession } = get();
    if (!activeSession) return;
    const elapsedSeconds = Math.floor((Date.now() - activeSession.startedAt) / 1000);
    const reachedTarget = activeSession.targetEndAt != null && Date.now() >= activeSession.targetEndAt;
    const status = reachedTarget ? 'COMPLETED' : 'INTERRUPTED';
    const focusedSeconds = reachedTarget ? activeSession.plannedSeconds ?? elapsedSeconds : elapsedSeconds;
    const finalized = await finishSession(activeSession, status, focusedSeconds);
    set({ activeSession: null, phase: 'idle', graceEndsAt: null, lastFinishedSession: finalized });
    useStatsStore.getState().refresh();
  },

  enterGrace: () => {
    const { activeSession, phase } = get();
    if (!activeSession || phase !== 'active') return;
    const gracePeriodSeconds = useSettingsStore.getState().gracePeriodSeconds;
    haptics.warning();
    set({ phase: 'grace', graceEndsAt: Date.now() + gracePeriodSeconds * 1000 });
  },

  resumeFromGrace: () => {
    if (get().phase !== 'grace') return;
    haptics.tap();
    set({ phase: 'active', graceEndsAt: null });
  },

  expireGrace: async () => {
    if (get().phase !== 'grace') return;
    await get().endSessionManually();
  },

  startBreak: async () => {
    await stopShielding();
    const breakEndsAt = Date.now() + BREAK_SECONDS * 1000;
    await scheduleBreakCompleteNotification(breakEndsAt);
    set({ isBreakActive: true, breakEndsAt, lastFinishedSession: null });
  },

  skipBreak: async () => {
    await cancelBreakCompleteNotification();
    set({ isBreakActive: false, breakEndsAt: null });
  },

  clearLastFinishedSession: () => set({ lastFinishedSession: null }),
}));

export { BREAK_SECONDS };
