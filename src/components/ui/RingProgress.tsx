import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface RingProgressProps extends PropsWithChildren {
  size: number;
  strokeWidth?: number;
  /** 0–1. Values are clamped. */
  progress: number;
  trackColor: string;
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  gradientId?: string;
}

export function RingProgress({
  size,
  strokeWidth = 8,
  progress,
  trackColor,
  gradientFrom,
  gradientVia,
  gradientTo,
  gradientId = 'ringProgressGradient',
  children,
}: RingProgressProps) {
  const viaColor = gradientVia ?? gradientTo;
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientFrom} />
            <Stop offset="50%" stopColor={viaColor} />
            <Stop offset="100%" stopColor={gradientTo} />
          </LinearGradient>
        </Defs>
        <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children ? (
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
