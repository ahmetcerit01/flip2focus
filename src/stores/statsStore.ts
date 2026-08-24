import { create } from 'zustand';

import { getTodayStats, listCompletedSessionsForStreak } from '@/features/focus/sessionRepository';
import { computeStreak, STREAK_QUALIFYING_SECONDS } from '@/features/streak/streakEngine';
import { addDaysToDateKey, endOfLocalDayMillis, localDateKey, startOfLocalDayMillis } from '@/lib/date';

interface StatsState {
  todayFocusedSeconds: number;
  todaySessionCount: number;
  /** null until we know there is real prior-day data to compare against. */
  yesterdayFocusedSeconds: number | null;
  currentStreak: number;
  longestStreak: number;
  loaded: boolean;
  refresh: () => Promise<void>;
}

export const useStatsStore = create<StatsState>()((set) => ({
  todayFocusedSeconds: 0,
  todaySessionCount: 0,
  yesterdayFocusedSeconds: null,
  currentStreak: 0,
  longestStreak: 0,
  loaded: false,
  refresh: async () => {
    const todayKey = localDateKey();
    const yesterdayKey = addDaysToDateKey(todayKey, -1);
    const [today, yesterday, qualifying] = await Promise.all([
      getTodayStats(startOfLocalDayMillis(todayKey), endOfLocalDayMillis(todayKey)),
      getTodayStats(startOfLocalDayMillis(yesterdayKey), endOfLocalDayMillis(yesterdayKey)),
      listCompletedSessionsForStreak(STREAK_QUALIFYING_SECONDS),
    ]);
    const { currentStreak, longestStreak } = computeStreak(qualifying, todayKey);
    set({
      todayFocusedSeconds: today.totalFocusedSeconds,
      todaySessionCount: today.sessionCount,
      yesterdayFocusedSeconds: yesterday.sessionCount > 0 ? yesterday.totalFocusedSeconds : null,
      currentStreak,
      longestStreak,
      loaded: true,
    });
  },
}));
