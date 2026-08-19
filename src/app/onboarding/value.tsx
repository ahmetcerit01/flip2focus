import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Screen } from '@/components/ui/Screen';
import { useDarkTheme } from '@/theme/ThemeProvider';

const heroImage = require('@/assets/branding/flip-phone-hero.png');

export default function ValueScreen() {
  const { colors } = useDarkTheme();

  return (
    <Screen forceDark contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View />
        <Pressable onPress={() => router.push('/onboarding/screentime')} hitSlop={10}>
          <AppText muted>Skip</AppText>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Image source={heroImage} style={styles.heroImage} contentFit="contain" />
      </View>

      <View>
        <AppText variant="headline" weight="bold" color={colors.text}>
          Flip your phone.{'\n'}
          <AppText variant="headline" weight="bold" color={colors.accentBlue}>
            Focus
          </AppText>{' '}
          instantly.
        </AppText>
        <AppText secondary style={styles.subtitle}>
          Face down to start focusing. Pick it up to end your session.
        </AppText>
      </View>

      <GradientButton
        label="Let's Go"
        onPress={() => router.push('/onboarding/screentime')}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    marginTop: 12,
    lineHeight: 21,
  },
  cta: {
    marginTop: 24,
  },
});
