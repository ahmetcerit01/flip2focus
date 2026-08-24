import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LINE_COLORS = ['#2477FF', '#52DDF3', '#61D9C2', '#B8F338'];
const LINE_COUNT = 24;

function buildContourPath(width: number, baseY: number, amplitude: number, seed: number) {
  const segments = 7;
  const segmentWidth = (width + 80) / segments;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = -40 + i * segmentWidth;
    const y =
      baseY +
      Math.sin(i * 1.15 + seed) * amplitude +
      Math.sin(i * 0.5 + seed * 1.7) * amplitude * 0.45;
    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

export function TopographicWaves() {
  const { width, height } = useWindowDimensions();

  const lines = useMemo(() => {
    return Array.from({ length: LINE_COUNT }).map((_, i) => {
      const t = i / (LINE_COUNT - 1);
      const baseY = height * (0.34 + t * 0.62);
      const amplitude = 12 + (i % 5) * 5;
      const seed = i * 0.93;
      const color = LINE_COLORS[i % LINE_COLORS.length];
      const opacity = 0.06 + (i % 4) * 0.02;
      const strokeWidth = i % 3 === 0 ? 0.8 : 0.5;
      return {
        key: `contour-${i}`,
        d: buildContourPath(width, baseY, amplitude, seed),
        color,
        opacity,
        strokeWidth,
      };
    });
  }, [width, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {lines.map((line) => (
          <Path key={line.key} d={line.d} stroke={line.color} strokeWidth={line.strokeWidth} fill="none" opacity={line.opacity} />
        ))}
      </Svg>
    </View>
  );
}
