import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SettingsRow } from '@/components/ui/SettingsRow';

const logo = require('@/assets/branding/logo-mark-transparent.png');

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? '1';

  return (
    <Screen scroll>
      <View style={styles.center}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
        <AppText variant="title" weight="bold" style={{ marginTop: 12 }}>
          Flip2Focus
        </AppText>
        <AppText variant="small" muted style={{ marginTop: 4 }}>
          Version {version} ({buildNumber})
        </AppText>
      </View>

      <Card style={styles.card}>
        <AppText secondary style={styles.body}>
          Flip2Focus helps you disconnect from distracting apps by turning a simple physical gesture — flipping
          your phone face down — into a real, enforced focus session using Apple&apos;s Screen Time framework.
        </AppText>
      </Card>

      <AppText variant="title" weight="semibold" style={styles.sectionTitle}>
        Privacy Policy
      </AppText>
      <Card style={styles.card}>
        <AppText secondary style={styles.body}>
          Flip2Focus has no account and no backend. Your focus history and app selection stay on this device. A
          full privacy policy URL will be published here before this app is submitted for review.
        </AppText>
      </Card>

      <AppText variant="title" weight="semibold" style={styles.sectionTitle}>
        Terms of Use
      </AppText>
      <Card style={styles.card}>
        <AppText secondary style={styles.body}>
          Terms of use will be published here before this app is submitted for review.
        </AppText>
      </Card>

      {__DEV__ ? (
        <Card style={styles.card}>
          <SettingsRow
            icon="waveform.path.ecg"
            label="Motion Diagnostics"
            subtitle="Dev only — calibrate flip detection"
            onPress={() => router.push('/settings/motion-debug')}
            showChevron
          />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  logo: {
    width: 64,
    height: 64,
  },
  card: {
    marginTop: 12,
  },
  body: {
    lineHeight: 21,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 4,
  },
});
