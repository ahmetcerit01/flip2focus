import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { FocusOrb } from '@/components/focus/FocusOrb';
import { WaveBackground } from '@/components/focus/WaveBackground';
import { formatClock } from '@/lib/format';
import { usePickupDetector } from '@/services/motion/usePickupDetector';
import { useFocusStore } from '@/stores/focusStore';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useDarkTheme } from '@/theme/ThemeProvider';

export default function ActiveFocusScreen() {
  const { colors } = useDarkTheme();
  const [now, setNow] = useState(0);
  const [screenFocused, setScreenFocused] = useState(false);

  const activeSession = useFocusStore((s) => s.activeSession);
  const phase = useFocusStore((s) => s.phase);
  const graceEndsAt = useFocusStore((s) => s.graceEndsAt);
  const lastFinishedSession = useFocusStore((s) => s.lastFinishedSession);
  const blockedAppCount = useScreenTimeStore((s) => s.blockedAppCount);

  const navigatedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      navigatedRef.current = false;
      return () => setScreenFocused(false);
    }, []),
  );

  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
      useFocusStore.getState().checkForAutoCompletion();
    };
    const raf = requestAnimationFrame(tick);
    const interval = setInterval(tick, 500);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (navigatedRef.current) return;
    if (!activeSession && lastFinishedSession) {
      navigatedRef.current = true;
      const dest = lastFinishedSession.status === 'COMPLETED' ? '/focus/complete' : '/focus/interrupted';
      router.replace(dest);
    }
  }, [activeSession, lastFinishedSession]);

  usePickupDetector(
    () => useFocusStore.getState().enterGrace(),
    () => useFocusStore.getState().resumeFromGrace(),
    screenFocused && phase === 'active' && !!activeSession,
  );

  const [graceRemaining, setGraceRemaining] = useState(0);
  useEffect(() => {
    if (phase !== 'grace' || !graceEndsAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((graceEndsAt - Date.now()) / 1000));
      setGraceRemaining(remaining);
      if (remaining <= 0) useFocusStore.getState().expireGrace();
    };
    const raf = requestAnimationFrame(tick);
    const interval = setInterval(tick, 250);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [phase, graceEndsAt]);

  if (!activeSession || now === 0) {
    return <Screen forceDark />;
  }

  const isFree = activeSession.mode === 'FREE';
  const displaySeconds = isFree
    ? Math.floor((now - activeSession.startedAt) / 1000)
    : Math.max(0, Math.ceil(((activeSession.targetEndAt ?? now) - now) / 1000));

  const orbProgress =
    !isFree && activeSession.plannedSeconds
      ? Math.min(1, Math.max(0, (now - activeSession.startedAt) / (activeSession.plannedSeconds * 1000)))
      : null;

  const handleEndSession = () => {
    useFocusStore.getState().endSessionManually();
  };

  return (
    <Screen forceDark padded={false} contentContainerStyle={styles.container}>
      <WaveBackground />

      <View style={styles.pillWrap}>
        <View style={[styles.pill, { backgroundColor: colors.surface }]}>
          <View style={[styles.dot, { backgroundColor: colors.accentLime }]} />
          <AppText variant="small" weight="medium">
            Focus Mode
          </AppText>
        </View>
      </View>

      <View style={styles.center}>
        <AppText variant="timer" weight="bold" style={styles.timer}>
          {formatClock(displaySeconds)}
        </AppText>
        <AppText secondary center style={styles.supportText}>
          {isFree ? 'Stay as long as you need.' : 'Stay focused. Great things take time.'}
        </AppText>

        <View style={styles.orbWrap}>
          <FocusOrb progress={orbProgress} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.blockedCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.blockedIconWrap, { backgroundColor: colors.surfaceRaised }]}>
            <Icon name="shield.fill" size={15} color={colors.accentMint} />
          </View>
          <View style={styles.blockedTextWrap}>
            <AppText variant="small" weight="medium">
              Blocked Apps
            </AppText>
            <AppText variant="caption" muted>
              {blockedAppCount > 0
                ? `${blockedAppCount} app${blockedAppCount === 1 ? '' : 's'} shielded this session`
                : 'No apps selected'}
            </AppText>
          </View>
        </View>

        <Pressable onPress={handleEndSession} style={styles.endButton}>
          <AppText weight="medium" secondary>
            End Session
          </AppText>
          <Icon name="chevron.right" size={13} color={colors.textMuted} />
        </Pressable>
      </View>

      {phase === 'grace' ? (
        <View style={[styles.graceOverlay, { backgroundColor: 'rgba(8,13,16,0.94)' }]}>
          <Icon name="hand.raised.fill" size={32} color={colors.warning} />
          <AppText variant="title" weight="semibold" style={{ marginTop: 16 }}>
            Picked up
          </AppText>
          <AppText secondary center style={styles.graceSubtitle}>
            Place your phone face down again within {graceRemaining}s to keep focusing.
          </AppText>
          <Pressable onPress={handleEndSession} style={styles.graceEndButton}>
            <AppText secondary>End session instead</AppText>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  pillWrap: {
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  timer: {
    letterSpacing: 1,
  },
  supportText: {
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  orbWrap: {
    marginTop: 40,
  },
  footer: {
    gap: 14,
  },
  blockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
  },
  blockedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedTextWrap: {
    flex: 1,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
  },
  graceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  graceSubtitle: {
    marginTop: 10,
    lineHeight: 20,
  },
  graceEndButton: {
    marginTop: 28,
  },
});
