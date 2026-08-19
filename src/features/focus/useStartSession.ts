import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { FREE_DAILY_SESSION_LIMIT } from '@/config/purchases';
import { countStartedSessionsToday } from '@/features/focus/sessionRepository';
import { endOfLocalDayMillis, localDateKey, startOfLocalDayMillis } from '@/lib/date';
import { durationSelectionToPlannedSeconds, useDurationSelectionStore } from '@/stores/durationSelectionStore';
import { useFocusStore } from '@/stores/focusStore';
import { usePurchasesStore } from '@/stores/purchasesStore';
import { useScreenTimeStore } from '@/stores/screenTimeStore';

export function useStartSession() {
  const [starting, setStarting] = useState(false);
  const inFlightRef = useRef(false);

  const attemptStart = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setStarting(true);
    try {
      const { kind, customMinutes } = useDurationSelectionStore.getState();
      const { plannedSeconds, mode } = durationSelectionToPlannedSeconds(kind, customMinutes);
      const isPro = usePurchasesStore.getState().isPro;

      if ((kind === 'free' || kind === 'custom') && !isPro) {
        router.push('/paywall');
        return;
      }

      if (!isPro) {
        const todayKey = localDateKey();
        const startedToday = await countStartedSessionsToday(
          startOfLocalDayMillis(todayKey),
          endOfLocalDayMillis(todayKey),
        );
        if (startedToday >= FREE_DAILY_SESSION_LIMIT) {
          router.push('/paywall');
          return;
        }
      }

      const blockedAppCount = useScreenTimeStore.getState().blockedAppCount;
      await useFocusStore.getState().startFocusSession({ plannedSeconds, mode, blockedAppCount });
      router.push('/focus/active');
    } finally {
      inFlightRef.current = false;
      setStarting(false);
    }
  }, []);

  return { attemptStart, starting };
}
