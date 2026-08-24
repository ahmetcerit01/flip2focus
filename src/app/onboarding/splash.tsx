import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { HeroGlow } from '@/components/onboarding/HeroGlow';
import { TopographicWaves } from '@/components/onboarding/TopographicWaves';
import { Screen } from '@/components/ui/Screen';
import { Palette } from '@/theme/tokens';

const logoMark = require('@/assets/branding/logo-mark-transparent.png');
const heroArt = require('@/assets/branding/flip-phone-hero.png');

const AUTO_ADVANCE_MS = 3400;

function goNext() {
  router.replace('/onboarding/value');
}

export default function SplashScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const heroWidth = screenWidth * 0.82;

  useEffect(() => {
    const timer = setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen forceDark padded={false} style={styles.screenBg}>
      <Pressable style={styles.flex} onPress={goNext}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <HeroGlow />
          <TopographicWaves />
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeIn.duration(700)} style={styles.brandBlock}>
            <Image source={logoMark} style={styles.logo} contentFit="contain" />
            <Text style={styles.wordmark}>
              <Text style={{ color: '#FFFFFF' }}>Flip</Text>
              <Text style={{ color: Palette.blue }}>2</Text>
              <Text style={{ color: '#FFFFFF' }}>Focus</Text>
            </Text>
          </Animated.View>

          <View style={styles.heroWrap}>
            <Animated.View entering={FadeIn.delay(200).duration(800)}>
              <Image source={heroArt} style={[styles.heroImage, { width: heroWidth }]} contentFit="contain" />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(500).duration(700)} style={styles.taglineWrap}>
            <Text style={styles.taglineStrong}>Flip down.</Text>
            <Text style={styles.taglineSoft}>Tune out. Get it done.</Text>
          </Animated.View>
        </View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screenBg: {
    backgroundColor: '#05090C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: '14%',
  },
  logo: {
    width: 64,
    height: 64,
  },
  wordmark: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    aspectRatio: 1536 / 1024,
  },
  taglineWrap: {
    alignItems: 'center',
    paddingBottom: 36,
  },
  taglineStrong: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  taglineSoft: {
    color: 'rgba(247,248,249,0.75)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
