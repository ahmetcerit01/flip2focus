import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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
  const heroWidth = screenWidth * 0.76;
  const breathe = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    glow.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);

    const timer = setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.025 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.05 + glow.value * 0.035,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: 0.22 - glow.value * 0.1,
    transform: [{ scaleX: 1 + glow.value * 0.06 }, { scaleY: 1 + glow.value * 0.06 }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: 0.16 - glow.value * 0.08,
    transform: [{ scaleX: 1 + (1 - glow.value) * 0.05 }, { scaleY: 1 + (1 - glow.value) * 0.05 }],
  }));

  return (
    <Screen forceDark padded={false}>
      <Pressable style={styles.flex} onPress={goNext}>
        {/* Extremely subtle background contour lines, lower-middle of screen */}
        <View pointerEvents="none" style={styles.contourWrap}>
          <View style={[styles.contourLine, styles.contourLineBlue]} />
          <View style={[styles.contourLine, styles.contourLineGreen]} />
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
            <Animated.View pointerEvents="none" style={[styles.glowBlob, styles.glowOuter, glowStyle]} />
            <Animated.View pointerEvents="none" style={[styles.ring, styles.ringOuter, ring1Style]} />
            <Animated.View pointerEvents="none" style={[styles.ring, styles.ringInner, ring2Style]} />
            <Animated.View style={heroAnimatedStyle}>
              <Image source={heroArt} style={[styles.heroImage, { width: heroWidth }]} contentFit="contain" />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(900).duration(700)} style={styles.taglineWrap}>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: '13%',
  },
  logo: {
    width: 56,
    height: 56,
  },
  wordmark: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    aspectRatio: 1536 / 1024,
  },
  glowBlob: {
    position: 'absolute',
    backgroundColor: Palette.mint,
  },
  glowOuter: {
    width: 520,
    height: 520,
    borderRadius: 260,
    transform: [{ scaleY: 0.6 }],
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Palette.mint,
  },
  ringOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderColor: 'rgba(97,217,194,0.28)',
  },
  ringInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderColor: 'rgba(52,120,246,0.24)',
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
    color: 'rgba(247,248,249,0.72)',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  contourWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '18%',
    alignItems: 'center',
  },
  contourLine: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
  },
  contourLineBlue: {
    borderColor: 'rgba(52,120,246,0.07)',
    transform: [{ scaleY: 0.28 }],
  },
  contourLineGreen: {
    borderColor: 'rgba(185,242,70,0.06)',
    transform: [{ scaleY: 0.22 }, { translateY: 20 }],
  },
});
