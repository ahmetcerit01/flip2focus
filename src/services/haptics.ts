import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '@/stores/settingsStore';

function enabled(): boolean {
  return useSettingsStore.getState().hapticsEnabled;
}

export const haptics = {
  sessionStart: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  tap: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  warning: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  success: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  selection: () => enabled() && Haptics.selectionAsync(),
};
