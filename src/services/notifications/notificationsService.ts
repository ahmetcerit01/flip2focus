import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermissionStatus(): Promise<NotificationPermission> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

const FOCUS_COMPLETE_ID = 'focus-complete';
const BREAK_COMPLETE_ID = 'break-complete';

async function scheduleAt(id: string, title: string, body: string, fireAtMs: number): Promise<string | null> {
  const permission = await getNotificationPermissionStatus();
  if (permission !== 'granted') return null;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  const seconds = Math.max(1, Math.round((fireAtMs - Date.now()) / 1000));
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: Platform.OS === 'ios' ? 'default' : undefined },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
  });
  return id;
}

export function scheduleFocusCompleteNotification(targetEndAt: number): Promise<string | null> {
  return scheduleAt(
    FOCUS_COMPLETE_ID,
    'Focus session complete',
    'Nice work — you stayed focused. Tap to see your summary.',
    targetEndAt,
  );
}

export function cancelFocusCompleteNotification(): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(FOCUS_COMPLETE_ID).catch(() => {});
}

export function scheduleBreakCompleteNotification(targetEndAt: number): Promise<string | null> {
  return scheduleAt(BREAK_COMPLETE_ID, 'Break complete', 'Time to get back to it.', targetEndAt);
}

export function cancelBreakCompleteNotification(): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(BREAK_COMPLETE_ID).catch(() => {});
}
