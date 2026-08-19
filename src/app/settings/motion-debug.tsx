import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { FLIP_THRESHOLDS, motionEngine, type MotionSample } from '@/services/motion/motionEngine';
import { useAppTheme } from '@/theme/ThemeProvider';

/**
 * Dev-only motion calibration view. Not reachable in production builds —
 * use this on a real iPhone to verify the gravity-sign assumptions in
 * motionEngine.ts (FLIP_THRESHOLDS) before shipping.
 */
export default function MotionDebugScreen() {
  const { colors } = useAppTheme();
  const [sample, setSample] = useState<MotionSample | null>(null);

  useEffect(() => motionEngine.subscribe(setSample), []);

  return (
    <Screen scroll>
      <AppText variant="headline" weight="bold" style={styles.title}>
        Motion Diagnostics
      </AppText>
      <AppText secondary style={styles.note}>
        Dev-only. Lay the phone flat, screen down, and confirm gravity.z rises above{' '}
        {FLIP_THRESHOLDS.faceDownZ}. Flip it screen-up and confirm it drops below {FLIP_THRESHOLDS.faceUpZ}.
      </AppText>

      <Card>
        <Row label="orientation" value={sample?.orientation ?? '—'} highlight={sample?.orientation === 'faceDown'} colors={colors} />
        <Row label="isStable" value={String(sample?.isStable ?? '—')} colors={colors} />
        <Row label="gravity.x" value={sample?.gravity.x.toFixed(3) ?? '—'} colors={colors} />
        <Row label="gravity.y" value={sample?.gravity.y.toFixed(3) ?? '—'} colors={colors} />
        <Row label="gravity.z" value={sample?.gravity.z.toFixed(3) ?? '—'} colors={colors} />
        <Row label="rotationRateMagnitude" value={sample?.rotationRateMagnitude.toFixed(3) ?? '—'} colors={colors} />
      </Card>
    </Screen>
  );
}

function Row({
  label,
  value,
  highlight,
  colors,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  colors: { text: string; accentMint: string; border: string };
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <AppText variant="small" muted>
        {label}
      </AppText>
      <AppText weight="medium" color={highlight ? colors.accentMint : colors.text}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 8,
  },
  note: {
    marginBottom: 16,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
