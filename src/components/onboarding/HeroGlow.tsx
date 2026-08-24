import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export function HeroGlow() {
  const { width, height } = useWindowDimensions();

  const blueBand = { y: height * 0.2, h: height * 0.32 };
  const greenBand = { y: height * 0.42, h: height * 0.28 };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#2477FF" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#2477FF" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#61D9C2" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#61D9C2" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={blueBand.y} width={width} height={blueBand.h} fill="url(#blueGlow)" />
        <Rect x={0} y={greenBand.y} width={width} height={greenBand.h} fill="url(#greenGlow)" />
      </Svg>
    </View>
  );
}
