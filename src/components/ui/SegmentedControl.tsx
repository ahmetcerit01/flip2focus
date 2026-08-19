import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors, radius } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              { borderRadius: radius.pill },
              active && { backgroundColor: colors.surface, shadowColor: colors.shadow },
            ]}
          >
            <AppText variant="small" weight={active ? 'semibold' : 'regular'} color={active ? colors.text : colors.textMuted}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
