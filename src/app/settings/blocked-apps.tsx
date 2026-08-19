import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import {
  presentBlockedAppsPicker,
  requestScreenTimeAuthorization,
} from '@/services/screenTime/screenTimeService';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function BlockedAppsScreen() {
  const { colors, radius } = useAppTheme();
  const screenTime = useScreenTimeStore();
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      screenTime.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const status = screenTime.authorizationStatus;

  const handleAllow = async () => {
    setBusy(true);
    try {
      await requestScreenTimeAuthorization();
      await screenTime.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleChooseApps = async () => {
    setBusy(true);
    try {
      await presentBlockedAppsPicker();
      await screenTime.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <AppText variant="headline" weight="bold" style={styles.title}>
        Blocked Apps
      </AppText>

      {status === 'denied' ? (
        <Card style={[styles.statusCard, { borderColor: colors.warning + '55' }]}>
          <Icon name="exclamationmark.shield.fill" size={22} color={colors.warning} />
          <AppText weight="medium" style={{ marginTop: 10 }}>
            Focus Mode Access is off
          </AppText>
          <AppText secondary center style={styles.statusSubtitle}>
            Flip2Focus can&apos;t block apps until Screen Time access is granted again.
          </AppText>
          <View style={styles.statusActions}>
            <GradientButton label="Try Again" onPress={handleAllow} loading={busy} />
            <Button label="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
          </View>
        </Card>
      ) : status === 'notDetermined' ? (
        <Card style={styles.statusCard}>
          <Icon name="shield.fill" size={22} color={colors.accentBlue} />
          <AppText weight="medium" style={{ marginTop: 10 }}>
            Focus Mode Access needed
          </AppText>
          <AppText secondary center style={styles.statusSubtitle}>
            Grant Screen Time access to choose which apps get blocked during focus sessions.
          </AppText>
          <GradientButton label="Allow Focus Mode Access" onPress={handleAllow} loading={busy} style={styles.singleAction} />
        </Card>
      ) : (
        <Card style={[styles.pickerCard, { borderRadius: radius.card }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
            <Icon name="apps.iphone" size={20} color={colors.accentMint} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="medium">
              {screenTime.blockedAppCount} app{screenTime.blockedAppCount === 1 ? '' : 's'} selected
            </AppText>
            <AppText variant="small" muted style={{ marginTop: 2 }}>
              Choose which apps get shielded during focus
            </AppText>
          </View>
        </Card>
      )}

      {status === 'approved' ? (
        <GradientButton label="Choose Apps" onPress={handleChooseApps} loading={busy} style={styles.chooseCta} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 16,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusSubtitle: {
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  statusActions: {
    marginTop: 20,
    gap: 10,
    alignSelf: 'stretch',
  },
  singleAction: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseCta: {
    marginTop: 16,
  },
});
