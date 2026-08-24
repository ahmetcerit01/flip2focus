import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const WIDTH = 440;
const HEIGHT = 260;

/** Three rolling dune-like contours, each a soft closed hill shape. */
const LAYER_PATHS = [
  'M0,140 C70,100 130,175 220,150 C300,128 360,190 440,150 L440,260 L0,260 Z',
  'M0,175 C90,150 150,205 240,180 C320,158 380,210 440,185 L440,260 L0,260 Z',
  'M0,205 C100,190 170,225 250,205 C330,188 390,225 440,210 L440,260 L0,260 Z',
];

/**
 * Layered wave/dune contours anchored to the bottom of Active Focus,
 * evoking the reference's cinematic depth. Two back layers drift slowly and
 * oppositely for a gentle parallax; the front layer stays still to keep the
 * composition calm rather than busy.
 */
export function WaveBackground() {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift]);

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -10 + drift.value * 20 }],
  }));
  const midStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 8 - drift.value * 16 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.layer, backStyle]}>
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Path d={LAYER_PATHS[0]} fill="rgba(52,120,246,0.10)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.layer, midStyle]}>
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Path d={LAYER_PATHS[1]} fill="rgba(97,217,194,0.10)" />
        </Svg>
      </Animated.View>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={styles.layer}>
        <Path d={LAYER_PATHS[2]} fill="rgba(185,242,70,0.07)" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HEIGHT,
    alignItems: 'center',
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    bottom: 0,
    width: WIDTH,
  },
});
