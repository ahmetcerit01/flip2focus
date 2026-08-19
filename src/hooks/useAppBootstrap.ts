import { useEffect, useState } from 'react';

import { getDb } from '@/services/persistence/db';
import { useFocusStore } from '@/stores/focusStore';
import { usePurchasesStore } from '@/stores/purchasesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';

interface BootstrapState {
  ready: boolean;
  dbError: Error | null;
}

export function useAppBootstrap(): BootstrapState {
  const [ready, setReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await getDb();
      } catch (err) {
        if (!cancelled) {
          setDbError(err instanceof Error ? err : new Error(String(err)));
          setReady(true);
        }
        return;
      }

      const settingsHydrated = useSettingsStore.persist.hasHydrated()
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const unsub = useSettingsStore.persist.onFinishHydration(() => {
              unsub();
              resolve();
            });
          });

      await settingsHydrated;
      await useFocusStore.getState().reconcileOnLaunch();
      await useStatsStore.getState().refresh();

      if (!cancelled) setReady(true);
      // Fire-and-forget: purchase entitlement refresh must never block app start.
      usePurchasesStore.getState().init();
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, dbError };
}
