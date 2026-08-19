import { create } from 'zustand';

import { getTodayStats, listCompletedSessionsForStreak } from '@/features/focus/sessionRepository';
import { computeStreak, STREAK_QUALIFYING_SECONDS } from '@/features/streak/streakEngine';
import { endOfLocalDayMillis, localDateKey, startOfLocalDayMillis } from '@/lib/date';

interface StatsState {
  todayFocusedSeconds: number;
  todaySessionCount: number;
  currentStreak: number;
  longestStreak: number;
  loaded: boolean;
  refresh: () => Promise<void>;
}

export const useStatsStore = create<StatsState>()((set) => ({
  todayFocusedSeconds: 0,
  todaySessionCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  loaded: false,
  refresh: async () => {
    const todayKey = localDateKey();
    const [today, qualifying] = await Promise.all([
      getTodayStats(startOfLocalDayMillis(todayKey), endOfLocalDayMillis(todayKey)),
      listCompletedSessionsForStreak(STREAK_QUALIFYING_SECONDS),
    ]);
    const { currentStreak, longestStreak } = computeStreak(qualifying, todayKey);
    set({
      todayFocusedSeconds: today.totalFocusedSeconds,
      todaySessionCount: today.sessionCount,
      currentStreak,
      longestStreak,
      loaded: true,
    });
  },
}));
