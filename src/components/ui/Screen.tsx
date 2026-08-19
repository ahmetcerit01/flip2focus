import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useAppTheme, useDarkTheme } from '@/theme/ThemeProvider';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  padded?: boolean;
  forceDark?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

export function Screen({
  children,
  scroll,
  padded = true,
  forceDark,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom'],
}: ScreenProps) {
  const adaptive = useAppTheme();
  const dark = useDarkTheme();
  const { colors } = forceDark ? dark : adaptive;

  const content = padded ? [styles.padded, contentContainerStyle] : contentContainerStyle;

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }, style]}>
        <ScrollView
          contentContainerStyle={content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }, style]}>
      <View style={[styles.flex, content]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
});
