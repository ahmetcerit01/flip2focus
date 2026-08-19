import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import type { AppearancePreference } from '@/theme/tokens';

const OPTIONS: { value: AppearancePreference; label: string; icon: 'circle.lefthalf.filled' | 'sun.max.fill' | 'moon.fill' }[] = [
  { value: 'system', label: 'System', icon: 'circle.lefthalf.filled' },
  { value: 'light', label: 'Light', icon: 'sun.max.fill' },
  { value: 'dark', label: 'Dark', icon: 'moon.fill' },
];

export default function AppearanceScreen() {
  const { colors } = useAppTheme();
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);

  return (
    <Screen>
      <AppText variant="headline" weight="bold" style={styles.title}>
        Appearance
      </AppText>
      <Card style={styles.card}>
        {OPTIONS.map((opt, i) => {
          const active = opt.value === appearance;
          return (
            <View key={opt.value}>
              <Pressable onPress={() => setAppearance(opt.value)} style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
                  <Icon name={opt.icon} size={18} color={colors.accentBlue} />
                </View>
                <AppText weight="medium" style={styles.label}>
                  {opt.label}
                </AppText>
                {active ? <Icon name="checkmark" size={18} color={colors.accentBlue} /> : null}
              </Pressable>
              {i < OPTIONS.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 16,
  },
  card: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
