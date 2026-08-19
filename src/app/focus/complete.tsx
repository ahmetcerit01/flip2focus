import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GradientButton } from '@/components/ui/GradientButton';
import { Screen } from '@/components/ui/Screen';
import { formatHoursMinutes } from '@/lib/format';
import { getNotificationPermissionStatus, requestNotificationPermission } from '@/services/notifications/notificationsService';
import { useFocusStore } from '@/stores/focusStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';
import { useAppTheme } from '@/theme/ThemeProvider';

const badge = require('@/assets/branding/session-complete-badge.png');

async function maybePromptForNotifications() {
  const { hasSeenNotificationPrompt, notificationsEnabled, markNotificationPromptSeen, setNotificationsEnabled } =
    useSettingsStore.getState();
  if (hasSeenNotificationPrompt || notificationsEnabled) return;
  const status = await getNotificationPermissionStatus();
  if (status !== 'undetermined') return;
  markNotificationPromptSeen();
  Alert.alert(
    'Never miss the finish line',
    'Turn on notifications so Flip2Focus can tell you the moment a session or break ends.',
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Enable',
        onPress: async () => {
          const result = await requestNotificationPermission();
          setNotificationsEnabled(result === 'granted');
        },
      },
    ],
  );
}

export default function SessionCompleteScreen() {
  const { colors } = useAppTheme();
  const lastFinishedSession = useFocusStore((s) => s.lastFinishedSession);
  const clearLastFinishedSession = useFocusStore((s) => s.clearLastFinishedSession);
  const stats = useStatsStore();

  useEffect(() => {
    stats.refresh();
    maybePromptForNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusedSeconds = lastFinishedSession?.focusedSeconds ?? 0;
  const wasTimed = lastFinishedSession?.mode === 'TIMED';

  const finish = () => {
    clearLastFinishedSession();
    router.replace('/(tabs)/home');
  };

  const startBreak = () => {
    clearLastFinishedSession();
    router.replace('/focus/break');
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.center}>
        <Image source={badge} style={styles.badge} contentFit="contain" />
        <AppText variant="title" weight="bold" style={{ marginTop: 8 }}>
          Session Complete
        </AppText>
        <AppText variant="display" weight="bold" color={colors.accentBlue} style={styles.minutes}>
          {formatHoursMinutes(focusedSeconds)}
        </AppText>
        <AppText secondary center>
          focused
        </AppText>
        <AppText secondary center style={styles.praise}>
          Great work! You stayed in control.
        </AppText>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statCol}>
          <AppText weight="semibold" variant="title">
            {stats.currentStreak}
          </AppText>
          <AppText variant="caption" muted>
            Day Streak
          </AppText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statCol}>
          <AppText weight="semibold" variant="title">
            {formatHoursMinutes(stats.todayFocusedSeconds)}
          </AppText>
          <AppText variant="caption" muted>
            Today
          </AppText>
        </View>
      </Card>

      <View style={styles.footer}>
        <GradientButton label="Done" onPress={finish} />
        {wasTimed ? <Button label="Start 5 min break" variant="secondary" onPress={startBreak} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  center: {
    alignItems: 'center',
  },
  badge: {
    width: 140,
    height: 140,
  },
  minutes: {
    marginTop: 20,
  },
  praise: {
    marginTop: 12,
  },
  statsCard: {
    flexDirection: 'row',
    marginTop: 24,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
  },
  footer: {
    gap: 12,
    marginTop: 24,
  },
});
