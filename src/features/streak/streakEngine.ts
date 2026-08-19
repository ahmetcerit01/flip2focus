import { addDaysToDateKey, localDateKeyFromMillis } from '@/lib/date';
import type { FocusSession } from '@/types/session';

export const STREAK_QUALIFYING_SECONDS = 10 * 60;

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Deterministic streak computation from raw completed sessions. Always
 * re-derived from source-of-truth session rows — never stored/incremented
 * as independent mutable state — so it cannot drift.
 */
export function computeStreak(
  qualifyingSessions: FocusSession[],
  todayKey: string = localDateKeyFromMillis(Date.now()),
): StreakResult {
  const qualifyingDays = new Set<string>();
  for (const session of qualifyingSessions) {
    if (session.status === 'COMPLETED' && session.focusedSeconds >= STREAK_QUALIFYING_SECONDS) {
      qualifyingDays.add(localDateKeyFromMillis(session.startedAt));
    }
  }

  if (qualifyingDays.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDays = Array.from(qualifyingDays).sort();

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1];
    const curr = sortedDays[i];
    if (addDaysToDateKey(prev, 1) === curr) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
  }

  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const anchor = qualifyingDays.has(todayKey) ? todayKey : qualifyingDays.has(yesterdayKey) ? yesterdayKey : null;

  let currentStreak = 0;
  if (anchor) {
    currentStreak = 1;
    let cursor = anchor;
    for (;;) {
      const prevDay = addDaysToDateKey(cursor, -1);
      if (qualifyingDays.has(prevDay)) {
        currentStreak += 1;
        cursor = prevDay;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}
