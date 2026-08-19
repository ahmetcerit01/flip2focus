import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDarkTheme } from '@/theme/ThemeProvider';

const faceUp = require('@/assets/branding/phone-face-up.png');
const faceDown = require('@/assets/branding/phone-face-down.png');

export default function TutorialScreen() {
  const { colors } = useDarkTheme();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen forceDark contentContainerStyle={styles.container}>
      <View>
        <AppText variant="headline" weight="bold" color={colors.text}>
          Try your first flip
        </AppText>
        <AppText secondary style={styles.subtitle}>
          Place your phone face down on a flat surface to start focusing. Pick it up any time to end.
        </AppText>
      </View>

      <View style={styles.diagram}>
        <View style={styles.phoneCol}>
          <Image source={faceUp} style={styles.phoneImage} contentFit="contain" />
          <AppText variant="small" muted style={styles.caption}>
            Pick up{'\n'}to end
          </AppText>
        </View>
        <Icon name="arrow.right" size={22} color={colors.accentMint} />
        <View style={styles.phoneCol}>
          <Image source={faceDown} style={styles.phoneImage} contentFit="contain" />
          <AppText variant="small" muted style={styles.caption}>
            Flip down{'\n'}to focus
          </AppText>
        </View>
      </View>

      <GradientButton label="Got it" onPress={finish} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 32,
  },
  subtitle: {
    marginTop: 10,
    lineHeight: 21,
  },
  diagram: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  phoneCol: {
    alignItems: 'center',
    gap: 10,
  },
  phoneImage: {
    width: 130,
    height: 130,
  },
  caption: {
    textAlign: 'center',
    lineHeight: 16,
  },
  cta: {
    marginTop: 4,
  },
});
