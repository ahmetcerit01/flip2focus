import { Pressable, StyleSheet, View } from 'react-native';
import type { SymbolViewProps } from 'expo-symbols';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface SettingsRowProps {
  icon?: SymbolViewProps['name'];
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
}

export function SettingsRow({ icon, label, subtitle, onPress, right, showChevron, destructive }: SettingsRowProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      {({ pressed }) => (
        <View style={[styles.rowInner, { opacity: pressed ? 0.6 : 1 }]}>
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
              <Icon name={icon} size={18} color={destructive ? colors.danger : colors.accentBlue} />
            </View>
          ) : null}
          <View style={styles.textWrap}>
            <AppText weight="medium" color={destructive ? colors.danger : colors.text}>
              {label}
            </AppText>
            {subtitle ? (
              <AppText variant="small" muted style={styles.subtitle}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {right}
          {showChevron ? <Icon name="chevron.right" size={14} color={colors.textMuted} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
});
