import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { requestScreenTimeAuthorization } from '@/services/screenTime/screenTimeService';
import { useDarkTheme } from '@/theme/ThemeProvider';

export default function ScreenTimeDeniedScreen() {
  const { colors } = useDarkTheme();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const status = await requestScreenTimeAuthorization();
      if (status === 'approved') router.replace('/onboarding/apps');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Screen forceDark contentContainerStyle={styles.container}>
      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="exclamationmark.shield.fill" size={30} color={colors.warning} />
        </View>
        <AppText variant="title" weight="bold" center style={{ marginTop: 20 }}>
          Focus Mode Access needed
        </AppText>
        <AppText secondary center style={styles.subtitle}>
          Flip2Focus can&apos;t block distracting apps without Screen Time permission. You can grant it now or open
          Settings to enable it manually.
        </AppText>
      </View>

      <View style={styles.footer}>
        <GradientButton label="Try Again" onPress={handleRetry} loading={retrying} />
        <Button label="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
        <Button label="Continue Without Blocking" variant="ghost" onPress={() => router.push('/onboarding/tutorial')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  center: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 12,
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  footer: {
    gap: 12,
    marginTop: 24,
  },
});
