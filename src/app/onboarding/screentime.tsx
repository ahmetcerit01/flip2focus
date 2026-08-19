import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { requestScreenTimeAuthorization } from '@/services/screenTime/screenTimeService';
import { useDarkTheme } from '@/theme/ThemeProvider';

export default function ScreenTimeExplainScreen() {
  const { colors, radius } = useDarkTheme();
  const [requesting, setRequesting] = useState(false);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      const status = await requestScreenTimeAuthorization();
      if (status === 'approved') {
        router.push('/onboarding/apps');
      } else {
        router.push('/onboarding/screentime-denied');
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Screen forceDark scroll contentContainerStyle={styles.container}>
      <View>
        <AppText variant="headline" weight="bold" color={colors.text}>
          Focus starts with fewer distractions
        </AppText>
        <AppText secondary style={styles.subtitle}>
          Allow permissions and choose apps to block during focus sessions.
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderRadius: radius.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="shield.fill" size={20} color={colors.accentBlue} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="medium" color={colors.text}>
            Allow Focus Mode Access
          </AppText>
          <AppText variant="small" muted style={{ marginTop: 2 }}>
            Required to block apps and track sessions
          </AppText>
        </View>
      </View>

      <AppText variant="small" muted style={styles.footnote}>
        Flip2Focus uses Apple&apos;s Screen Time framework. Nothing about which apps you block ever leaves your
        device.
      </AppText>

      <GradientButton label="Allow Focus Mode Access" onPress={handleAllow} loading={requesting} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 24,
  },
  subtitle: {
    marginTop: 10,
    lineHeight: 21,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footnote: {
    lineHeight: 18,
  },
  cta: {
    marginTop: 8,
  },
});
