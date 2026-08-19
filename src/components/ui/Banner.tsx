import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { SymbolViewProps } from 'expo-symbols';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface BannerProps {
  icon?: SymbolViewProps['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onPress?: () => void;
  tone?: 'warning' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function Banner({
  icon = 'exclamationmark.triangle.fill',
  title,
  message,
  actionLabel,
  onPress,
  tone = 'warning',
  style,
}: BannerProps) {
  const { colors, radius } = useAppTheme();
  const tint = tone === 'danger' ? colors.danger : colors.warning;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={style}>
      <View style={[styles.container, { backgroundColor: colors.surfaceRaised, borderRadius: radius.md, borderColor: tint + '55' }]}>
        <Icon name={icon} size={18} color={tint} />
        <View style={styles.textWrap}>
          <AppText weight="semibold" variant="small" color={tint}>
            {title}
          </AppText>
          <AppText variant="small" muted style={styles.message}>
            {message}
          </AppText>
          {actionLabel ? (
            <AppText variant="small" weight="medium" color={colors.accentBlue} style={styles.action}>
              {actionLabel}
            </AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textWrap: { flex: 1 },
  message: { marginTop: 2, lineHeight: 17 },
  action: { marginTop: 6 },
});
