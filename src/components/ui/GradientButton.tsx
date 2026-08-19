import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { Palette } from '@/theme/tokens';

import { AppText } from './AppText';

interface GradientButtonProps {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Rendered pinned to the trailing edge while the label stays centered. */
  icon?: React.ReactNode;
  radius?: number;
  height?: number;
}

export function GradientButton({ label, onPress, disabled, loading, style, icon, radius = 999, height = 54 }: GradientButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {({ pressed }) => (
        <LinearGradient
          colors={[Palette.blue, Palette.mint, Palette.lime]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: radius, height }, (disabled || pressed) && styles.dimmed]}
        >
          {loading ? (
            <ActivityIndicator color="#06090B" />
          ) : icon ? (
            <View style={styles.balancedRow}>
              <View style={styles.balanceSpacer} />
              <AppText weight="semibold" color="#06090B" style={styles.labelCentered}>
                {label}
              </AppText>
              <View style={styles.iconSlot}>{icon}</View>
            </View>
          ) : (
            <AppText weight="semibold" color="#06090B" style={styles.label}>
              {label}
            </AppText>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  balancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 14,
  },
  balanceSpacer: {
    width: 22,
  },
  iconSlot: {
    width: 22,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 17,
  },
  labelCentered: {
    flex: 1,
    fontSize: 17,
    textAlign: 'center',
  },
  dimmed: {
    opacity: 0.85,
  },
});
