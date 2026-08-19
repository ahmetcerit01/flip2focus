import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { formatClock } from '@/lib/format';
import { useFocusStore } from '@/stores/focusStore';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function BreakScreen() {
  const { colors } = useAppTheme();
  const isBreakActive = useFocusStore((s) => s.isBreakActive);
  const breakEndsAt = useFocusStore((s) => s.breakEndsAt);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!isBreakActive) {
      useFocusStore.getState().startBreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const raf = requestAnimationFrame(tick);
    const interval = setInterval(tick, 250);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (now > 0 && breakEndsAt && now >= breakEndsAt) {
      useFocusStore.getState().skipBreak();
      router.replace('/(tabs)/home');
    }
  }, [now, breakEndsAt]);

  const remaining = breakEndsAt && now > 0 ? Math.max(0, Math.ceil((breakEndsAt - now) / 1000)) : 0;

  const skip = () => {
    useFocusStore.getState().skipBreak();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="leaf.fill" size={30} color={colors.accentMint} />
        </View>
        <AppText variant="title" weight="bold" style={{ marginTop: 20 }}>
          Break Time
        </AppText>
        <AppText variant="display" weight="bold" style={styles.timer}>
          {formatClock(remaining)}
        </AppText>
        <AppText secondary center>
          Stretch. Walk. Breathe.
        </AppText>
      </View>

      <Button label="Skip Break" variant="secondary" onPress={skip} />
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
  timer: {
    marginTop: 20,
    marginBottom: 8,
  },
});
