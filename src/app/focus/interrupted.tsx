import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { GradientButton } from '@/components/ui/GradientButton';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { formatHoursMinutes } from '@/lib/format';
import { useFocusStore } from '@/stores/focusStore';
import { useStatsStore } from '@/stores/statsStore';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SessionInterruptedScreen() {
  const { colors } = useAppTheme();
  const lastFinishedSession = useFocusStore((s) => s.lastFinishedSession);
  const clearLastFinishedSession = useFocusStore((s) => s.clearLastFinishedSession);
  const stats = useStatsStore();

  useEffect(() => {
    stats.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusedSeconds = lastFinishedSession?.focusedSeconds ?? 0;

  const finish = () => {
    clearLastFinishedSession();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="pause.circle.fill" size={32} color={colors.warning} />
        </View>
        <AppText variant="title" weight="bold" style={{ marginTop: 20 }}>
          Session Interrupted
        </AppText>
        <AppText secondary center style={styles.subtitle}>
          You ended this session early. Every bit of focus still counts.
        </AppText>
      </View>

      <Card style={styles.statCard}>
        <AppText variant="small" muted>
          Focused for
        </AppText>
        <AppText variant="display" weight="bold" style={{ marginTop: 4 }}>
          {formatHoursMinutes(focusedSeconds)}
        </AppText>
      </Card>

      <GradientButton label="Done" onPress={finish} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  center: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 12,
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  statCard: {
    alignItems: 'center',
    marginTop: 24,
  },
  cta: {
    marginTop: 24,
  },
});
