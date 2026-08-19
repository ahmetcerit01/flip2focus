import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'secondary', disabled, loading, style }: ButtonProps) {
  const { colors, radius } = useAppTheme();

  const backgrounds = {
    secondary: colors.surfaceRaised,
    ghost: 'transparent',
    danger: 'transparent',
  } as const;

  const textColors = {
    secondary: colors.text,
    ghost: colors.textSecondary,
    danger: colors.danger,
  } as const;

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {({ pressed }) => (
        <AppText
          weight="medium"
          color={textColors[variant]}
          center
          style={[
            styles.base,
            {
              backgroundColor: backgrounds[variant],
              borderRadius: radius.pill,
              borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
              borderColor: colors.border,
              opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
            },
          ]}
        >
          {loading ? <ActivityIndicator color={textColors[variant]} /> : label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    lineHeight: 50,
    fontSize: 16,
  },
});
