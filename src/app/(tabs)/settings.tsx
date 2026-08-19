import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { ThemedSwitch } from '@/components/ui/ThemedSwitch';
import { getNotificationPermissionStatus, requestNotificationPermission } from '@/services/notifications/notificationsService';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAppTheme } from '@/theme/ThemeProvider';

const GRACE_OPTIONS = [3, 5, 8, 10];

function SectionLabel({ label }: { label: string }) {
  return (
    <AppText variant="small" weight="semibold" muted style={styles.sectionLabel}>
      {label.toUpperCase()}
    </AppText>
  );
}

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const settings = useSettingsStore();
  const screenTime = useScreenTimeStore();

  useFocusEffect(
    useCallback(() => {
      screenTime.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const revoked = screenTime.loaded && screenTime.authorizationStatus === 'denied';

  const toggleNotifications = async (value: boolean) => {
    if (!value) {
      settings.setNotificationsEnabled(false);
      return;
    }
    const status = await getNotificationPermissionStatus();
    if (status === 'granted') {
      settings.setNotificationsEnabled(true);
      return;
    }
    if (status === 'denied') {
      Alert.alert(
        'Notifications are off',
        'Enable notifications in Settings so Flip2Focus can tell you when a focus session or break finishes.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    Alert.alert(
      'Stay on track',
      'Flip2Focus only sends a notification when a focus session or break finishes.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const result = await requestNotificationPermission();
            settings.setNotificationsEnabled(result === 'granted');
          },
        },
      ],
    );
  };

  const cycleGracePeriod = () => {
    const idx = GRACE_OPTIONS.indexOf(settings.gracePeriodSeconds);
    const next = GRACE_OPTIONS[(idx + 1) % GRACE_OPTIONS.length];
    settings.setGracePeriodSeconds(next);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? '1';

  return (
    <Screen scroll>
      <AppText variant="headline" weight="bold" style={styles.title}>
        Settings
      </AppText>

      {revoked ? (
        <Banner
          style={styles.banner}
          title="Screen Time access is off"
          message="Re-enable Focus Mode Access to keep blocking your selected apps."
          actionLabel="Open Blocked Apps"
          onPress={() => router.push('/settings/blocked-apps')}
        />
      ) : null}

      <SectionLabel label="Focus" />
      <Card style={styles.card}>
        <SettingsRow
          icon="apps.iphone"
          label="Blocked Apps"
          subtitle={`${screenTime.blockedAppCount} app${screenTime.blockedAppCount === 1 ? '' : 's'} selected`}
          onPress={() => router.push('/settings/blocked-apps')}
          showChevron
        />
        <Divider />
        <SettingsRow
          icon="clock.fill"
          label="Default Focus Duration"
          subtitle={`${settings.defaultDurationMinutes} min`}
          onPress={() => settings.setDefaultDuration(settings.defaultDurationMinutes === 25 ? 50 : 25)}
          showChevron
        />
        <Divider />
        <SettingsRow
          icon="hourglass"
          label="Grace Period"
          subtitle={`${settings.gracePeriodSeconds}s to place phone back down`}
          onPress={cycleGracePeriod}
          showChevron
        />
      </Card>

      <SectionLabel label="Experience" />
      <Card style={styles.card}>
        <SettingsRow
          icon="paintbrush.fill"
          label="Appearance"
          subtitle={settings.appearance === 'system' ? 'System' : settings.appearance === 'light' ? 'Light' : 'Dark'}
          onPress={() => router.push('/settings/appearance')}
          showChevron
        />
        <Divider />
        <SettingsRow
          icon="hand.tap.fill"
          label="Haptics"
          right={<ThemedSwitch value={settings.hapticsEnabled} onValueChange={settings.setHapticsEnabled} />}
        />
        <Divider />
        <SettingsRow
          icon="speaker.wave.2.fill"
          label="Sounds"
          right={<ThemedSwitch value={settings.soundsEnabled} onValueChange={settings.setSoundsEnabled} />}
        />
        <Divider />
        <SettingsRow
          icon="bell.fill"
          label="Notifications"
          right={<ThemedSwitch value={settings.notificationsEnabled} onValueChange={toggleNotifications} />}
        />
      </Card>

      <SectionLabel label="Flip2Focus Pro" />
      <Card style={styles.card}>
        <SettingsRow icon="crown.fill" label="Upgrade to Pro" onPress={() => router.push('/paywall')} showChevron />
        <Divider />
        <SettingsRow
          icon="arrow.clockwise"
          label="Restore Purchases"
          onPress={() => router.push({ pathname: '/paywall', params: { restore: '1' } })}
          showChevron
        />
      </Card>

      <SectionLabel label="General" />
      <Card style={styles.card}>
        <SettingsRow icon="questionmark.circle.fill" label="How Flip2Focus Works" onPress={() => router.push('/settings/help')} showChevron />
        <Divider />
        <SettingsRow icon="hand.raised.fill" label="Privacy Policy" onPress={() => router.push('/settings/about')} showChevron />
        <Divider />
        <SettingsRow icon="doc.text.fill" label="Terms of Use" onPress={() => router.push('/settings/about')} showChevron />
        <Divider />
        <SettingsRow icon="lifepreserver.fill" label="Help & Support" onPress={() => router.push('/settings/help')} showChevron />
        <Divider />
        <SettingsRow icon="info.circle.fill" label="About Flip2Focus" onPress={() => router.push('/settings/about')} showChevron />
      </Card>

      <AppText variant="small" muted center style={styles.version}>
        Flip2Focus v{version} ({buildNumber})
      </AppText>
    </Screen>
  );

  function Divider() {
    return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
  }
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 16,
  },
  banner: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  version: {
    marginTop: 28,
    marginBottom: 12,
  },
});
