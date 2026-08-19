import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
}

export function BarChart({ data }: BarChartProps) {
  const { colors, radius } = useAppTheme();
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={styles.container}>
      {data.map((d, i) => {
        const heightPct = Math.max(4, (d.value / max) * 100);
        return (
          <View key={i} style={styles.column}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${heightPct}%`,
                    backgroundColor: d.value > 0 ? colors.accentMint : colors.border,
                    borderRadius: radius.sm,
                  },
                ]}
              />
            </View>
            <AppText variant="caption" muted style={styles.label}>
              {d.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
  },
  label: {
    marginTop: 6,
  },
});
