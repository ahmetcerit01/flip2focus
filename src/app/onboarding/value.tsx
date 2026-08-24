import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useDarkTheme } from '@/theme/ThemeProvider';
import { Palette } from '@/theme/tokens';

const faceUp = require('@/assets/branding/phone-face-up.png');
const faceDown = require('@/assets/branding/phone-face-down.png');

function goNext() {
  router.push('/onboarding/screentime');
}

export default function ValueScreen() {
  const { colors } = useDarkTheme();
  const arrowPulse = useSharedValue(0);

  arrowPulse.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowPulse.value * 4 }],
  }));

  return (
    <Screen forceDark padded={false} contentContainerStyle={styles.safeArea}>
      <View style={styles.topBar}>
        <View />
        <Pressable onPress={goNext} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>
          <Text style={{ color: '#FFFFFF' }}>Flip your phone.</Text>
          {'\n'}
          <Text style={{ color: colors.accentBlue }}>Focus instantly.</Text>
        </Text>
        <Text style={styles.body}>Face down to start focusing.{'\n'}Pick it up to end your session.</Text>
      </View>

      <View style={styles.demoRow}>
        <Animated.View entering={FadeInLeft.delay(150).duration(600)} style={styles.phoneCol}>
          <Image source={faceUp} style={styles.faceUpImage} contentFit="contain" />
          <Text style={styles.labelMuted}>Pick up{'\n'}to end</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(450).duration(500)} style={[styles.arrowWrap, arrowStyle]}>
          <Icon name="arrow.right" size={22} color={colors.accentLime} weight="bold" />
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(150).duration(600)} style={styles.phoneCol}>
          <Image source={faceDown} style={styles.faceDownImage} contentFit="contain" />
          <Text style={styles.label}>
            <Text style={{ color: colors.accentLime, fontWeight: '700' }}>Flip down</Text>
            {'\n'}
            <Text style={{ color: '#FFFFFF' }}>to focus</Text>
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.footer}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <GradientButton
          label="Let's Go"
          onPress={goNext}
          height={58}
          radius={19}
          icon={<Icon name="arrow.right" size={16} color="#06090B" weight="semibold" />}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
  },
  skip: {
    color: 'rgba(247,248,249,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  headlineBlock: {
    marginTop: '11%',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  body: {
    marginTop: 14,
    color: 'rgba(247,248,249,0.68)',
    fontSize: 15,
    lineHeight: 21,
    width: '82%',
  },
  demoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  phoneCol: {
    alignItems: 'center',
    gap: 12,
  },
  faceUpImage: {
    width: 104,
    height: 104,
  },
  faceDownImage: {
    width: 138,
    height: 138,
  },
  arrowWrap: {
    marginBottom: 30,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  labelMuted: {
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
    color: 'rgba(247,248,249,0.6)',
  },
  footer: {
    gap: 16,
    paddingBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  dotActive: {
    backgroundColor: Palette.blue,
    width: 16,
  },
});
