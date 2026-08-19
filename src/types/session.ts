export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED';
export type SessionMode = 'TIMED' | 'FREE';

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt: number | null;
  /** null for Free Focus sessions */
  plannedSeconds: number | null;
  /** startedAt + plannedSeconds*1000, precomputed for timed sessions */
  targetEndAt: number | null;
  focusedSeconds: number;
  status: SessionStatus;
  mode: SessionMode;
  blockedAppCount: number;
  createdAt: number;
}

export interface TodayStats {
  totalFocusedSeconds: number;
  sessionCount: number;
}
