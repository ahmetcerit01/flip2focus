import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { Palette } from '@/theme/tokens';

import { AppText } from './AppText';

interface GradientButtonProps {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function GradientButton({ label, onPress, disabled, loading, style, icon }: GradientButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {({ pressed }) => (
        <LinearGradient
          colors={[Palette.blue, Palette.mint, Palette.lime]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, (disabled || pressed) && styles.dimmed]}
        >
          {loading ? (
            <ActivityIndicator color="#06090B" />
          ) : (
            <>
              <AppText weight="semibold" color="#06090B" style={styles.label}>
                {label}
              </AppText>
              {icon}
            </>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 54,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 17,
  },
  dimmed: {
    opacity: 0.85,
  },
});
