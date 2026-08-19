import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { RingProgress } from '@/components/ui/RingProgress';
import { Palette } from '@/theme/tokens';

interface FocusOrbProps {
  /** 0–1 elapsed fraction for timed sessions; null renders a slow ambient pulse for Free Focus. */
  progress: number | null;
  size?: number;
}

/**
 * The Active Focus centerpiece: a glowing progress ring with a soft core,
 * standing in for the old seedling artwork. Progress is real (elapsed /
 * planned) for timed sessions; Free Focus sessions get an indeterminate
 * breathing pulse instead of a fabricated ring value.
 */
export function FocusOrb({ progress, size = 240 }: FocusOrbProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + pulse.value * 0.16,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.35,
    transform: [{ scale: 0.9 + pulse.value * 0.12 }],
  }));

  const displayProgress = progress ?? pulse.value;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View pointerEvents="none" style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }, glowStyle]} />
      <RingProgress
        size={size}
        strokeWidth={6}
        progress={progress == null ? 0.72 : displayProgress}
        trackColor="rgba(255,255,255,0.08)"
        gradientFrom={Palette.blue}
        gradientVia={Palette.mint}
        gradientTo={Palette.lime}
      >
        <Animated.View style={[styles.core, coreStyle]} />
      </RingProgress>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: Palette.mint,
  },
  core: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.lime,
  },
});
