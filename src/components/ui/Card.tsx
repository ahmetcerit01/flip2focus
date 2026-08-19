import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  raised?: boolean;
}

export function Card({ children, style, raised }: CardProps) {
  const { colors, radius } = useAppTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: raised ? colors.surfaceRaised : colors.surface,
          borderRadius: radius.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
