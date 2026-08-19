import { create } from 'zustand';

import { getBlockedAppsCount, getScreenTimeAuthorizationStatus } from '@/services/screenTime/screenTimeService';
import type { ScreenTimeAuthorizationStatus } from 'flip2focus-screen-time';

interface ScreenTimeState {
  authorizationStatus: ScreenTimeAuthorizationStatus;
  blockedAppCount: number;
  loaded: boolean;
  refresh: () => Promise<void>;
}

export const useScreenTimeStore = create<ScreenTimeState>()((set) => ({
  authorizationStatus: 'notDetermined',
  blockedAppCount: 0,
  loaded: false,
  refresh: async () => {
    const [authorizationStatus, blockedAppCount] = await Promise.all([
      getScreenTimeAuthorizationStatus(),
      getBlockedAppsCount(),
    ]);
    set({ authorizationStatus, blockedAppCount, loaded: true });
  },
}));
