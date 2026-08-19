import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useStartSession } from '@/features/focus/useStartSession';
import { formatHoursMinutes } from '@/lib/format';
import { useFlipToStartDetector } from '@/services/motion/useFlipToStartDetector';
import { useDurationSelectionStore, type DurationKind } from '@/stores/durationSelectionStore';
import { useFocusStore } from '@/stores/focusStore';
import { usePurchasesStore } from '@/stores/purchasesStore';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';
import { useAppTheme } from '@/theme/ThemeProvider';

const readyPhoneImage = require('@/assets/branding/phone-face-down.png');

const DURATION_OPTIONS: { kind: DurationKind; label: string; pro: boolean }[] = [
  { kind: '25', label: '25 min', pro: false },
  { kind: '50', label: '50 min', pro: false },
  { kind: 'free', label: 'Free Focus', pro: true },
  { kind: 'custom', label: 'Custom', pro: true },
];

export default function HomeScreen() {
  const { colors, radius } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const stats = useStatsStore();
  const screenTime = useScreenTimeStore();
  const isPro = usePurchasesStore((s) => s.isPro);
  const activeSession = useFocusStore((s) => s.activeSession);
  const defaultDuration = useSettingsStore((s) => s.defaultDurationMinutes);
  const { kind: selectedKind, select } = useDurationSelectionStore();
  const { attemptStart, starting } = useStartSession();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      stats.refresh();
      screenTime.refresh();
      if (useDurationSelectionStore.getState().kind === '25' && defaultDuration === 50) {
        useDurationSelectionStore.getState().select('50');
      }
      return () => setIsFocused(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultDuration]),
  );

  const flipEnabled = isFocused && !activeSession && !starting;
  useFlipToStartDetector(() => attemptStart(), flipEnabled);

  const handleSelectDuration = (kind: DurationKind) => {
    if ((kind === 'free' || kind === 'custom') && !isPro) {
      router.push('/paywall');
      return;
    }
    if (kind === 'custom') {
      router.push('/duration-sheet');
      return;
    }
    select(kind);
  };

  const revoked = screenTime.loaded && screenTime.authorizationStatus === 'denied';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="headline" weight="bold">
          Ready to focus?
        </AppText>
        <View style={[styles.streakBadge, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }]}>
          <Icon name="flame.fill" size={14} color={colors.warning} />
          <AppText weight="semibold" variant="small">
            {stats.currentStreak}
          </AppText>
        </View>
      </View>

      {revoked ? (
        <Banner
          style={styles.banner}
          title="Screen Time access is off"
          message="Apps won't be blocked until you re-enable Focus Mode Access."
          actionLabel="Fix in Settings"
          onPress={() => router.push('/settings/blocked-apps')}
        />
      ) : null}

      <Card style={styles.todayCard} raised>
        <AppText variant="small" muted>
          Today&apos;s Focus
        </AppText>
        <AppText variant="display" weight="bold" style={styles.todayValue}>
          {formatHoursMinutes(stats.todayFocusedSeconds)}
        </AppText>
        <View style={styles.todayStatsRow}>
          <View>
            <AppText weight="semibold">{stats.todaySessionCount}</AppText>
            <AppText variant="caption" muted>
              Sessions
            </AppText>
          </View>
          <View>
            <AppText weight="semibold">{stats.longestStreak}d</AppText>
            <AppText variant="caption" muted>
              Best Streak
            </AppText>
          </View>
          <View>
            <AppText weight="semibold">{screenTime.blockedAppCount}</AppText>
            <AppText variant="caption" muted>
              Blocked Apps
            </AppText>
          </View>
        </View>
      </Card>

      <View style={styles.durationRow}>
        {DURATION_OPTIONS.map((opt) => {
          const active = opt.kind === selectedKind;
          const locked = opt.pro && !isPro;
          return (
            <Pressable
              key={opt.kind}
              onPress={() => handleSelectDuration(opt.kind)}
              style={[
                styles.durationChip,
                {
                  backgroundColor: active ? colors.accentBlue : colors.surfaceRaised,
                  borderRadius: radius.pill,
                },
              ]}
            >
              {locked ? <Icon name="crown.fill" size={12} color={active ? colors.onAccent : colors.textMuted} /> : null}
              <AppText variant="small" weight="medium" color={active ? colors.onAccent : colors.text}>
                {opt.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => attemptStart()} disabled={starting}>
        <Card style={styles.readyCard}>
          <Image source={readyPhoneImage} style={styles.readyImage} contentFit="contain" />
          <View style={styles.readyTextWrap}>
            <AppText variant="title" weight="semibold">
              Ready to Flip
            </AppText>
            <AppText secondary style={styles.readySubtitle}>
              Place your phone face down to start a focus session.
            </AppText>
          </View>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayCard: {
    marginBottom: 18,
  },
  todayValue: {
    marginTop: 4,
    marginBottom: 16,
  },
  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  readyCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  readyImage: {
    width: 110,
    height: 110,
  },
  readyTextWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  readySubtitle: {
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
