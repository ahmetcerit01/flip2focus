import type { AppearancePreference } from '@/theme/tokens';

export type DurationPreset = 25 | 50;

export interface SettingsState {
  appearance: AppearancePreference;
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  notificationsEnabled: boolean;
  defaultDurationMinutes: DurationPreset;
  gracePeriodSeconds: number;
  onboardingComplete: boolean;
  hasSeenNotificationPrompt: boolean;
}
