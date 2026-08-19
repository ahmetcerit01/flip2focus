import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/persistence/kvStorage';
import type { AppearancePreference } from '@/theme/tokens';
import type { DurationPreset, SettingsState } from '@/types/settings';

interface SettingsActions {
  setAppearance: (value: AppearancePreference) => void;
  setHapticsEnabled: (value: boolean) => void;
  setSoundsEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setDefaultDuration: (value: DurationPreset) => void;
  setGracePeriodSeconds: (value: number) => void;
  completeOnboarding: () => void;
  markNotificationPromptSeen: () => void;
}

const initialState: SettingsState = {
  appearance: 'system',
  hapticsEnabled: true,
  soundsEnabled: true,
  notificationsEnabled: false,
  defaultDurationMinutes: 25,
  gracePeriodSeconds: 5,
  onboardingComplete: false,
  hasSeenNotificationPrompt: false,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,
      setAppearance: (value) => set({ appearance: value }),
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
      setSoundsEnabled: (value) => set({ soundsEnabled: value }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      setDefaultDuration: (value) => set({ defaultDurationMinutes: value }),
      setGracePeriodSeconds: (value) => set({ gracePeriodSeconds: value }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      markNotificationPromptSeen: () => set({ hasSeenNotificationPrompt: true }),
    }),
    {
      name: 'flip2focus.settings',
      storage: {
        getItem: async (name) => {
          const value = await zustandAsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => zustandAsyncStorage.setItem(name, JSON.stringify(value)),
        removeItem: zustandAsyncStorage.removeItem,
      },
    },
  ),
);
