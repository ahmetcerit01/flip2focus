import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { RingProgress } from '@/components/ui/RingProgress';
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
import { Palette } from '@/theme/tokens';

const readyPhoneImage = require('@/assets/branding/phone-face-down.png');

const DURATION_OPTIONS: { kind: DurationKind; label: string; pro: boolean }[] = [
  { kind: '25', label: '25 min', pro: false },
  { kind: '50', label: '50 min', pro: false },
  { kind: 'free', label: 'Free Focus', pro: true },
  { kind: 'custom', label: 'Custom', pro: true },
];

/** Purely visual fullness reference for the ring — not a claimed daily goal. */
const RING_REFERENCE_SECONDS = 120 * 60;

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

  const comparisonMinutes =
    stats.yesterdayFocusedSeconds != null
      ? Math.round((stats.todayFocusedSeconds - stats.yesterdayFocusedSeconds) / 60)
      : null;

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push('/(tabs)/settings')} hitSlop={10}>
          <Icon name="line.3.horizontal" size={20} color={colors.text} />
        </Pressable>
        <View style={[styles.streakBadge, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }]}>
          <Icon name="flame.fill" size={14} color={colors.warning} />
          <AppText weight="semibold" variant="small">
            {stats.currentStreak}
          </AppText>
        </View>
      </View>

      <AppText variant="headline" weight="bold" style={styles.heading}>
        Ready to focus?
      </AppText>

      {revoked ? (
        <Banner
          style={styles.banner}
          title="Screen Time access is off"
          message="Apps won't be blocked until you re-enable Focus Mode Access."
          actionLabel="Fix in Settings"
          onPress={() => router.push('/settings/blocked-apps')}
        />
      ) : null}

      <View style={styles.todayCard}>
        <View style={styles.todayLeft}>
          <AppText variant="small" color="rgba(247,248,249,0.6)">
            Today&apos;s Focus
          </AppText>
          <AppText variant="display" weight="bold" color="#FFFFFF" style={styles.todayValue}>
            {formatHoursMinutes(stats.todayFocusedSeconds)}
          </AppText>
          {comparisonMinutes != null && comparisonMinutes !== 0 ? (
            <View style={styles.comparisonRow}>
              <Icon
                name={comparisonMinutes > 0 ? 'arrow.up' : 'arrow.down'}
                size={11}
                color={comparisonMinutes > 0 ? Palette.lime : 'rgba(247,248,249,0.55)'}
              />
              <AppText variant="caption" color="rgba(247,248,249,0.55)">
                {Math.abs(comparisonMinutes)}m from yesterday
              </AppText>
            </View>
          ) : null}
        </View>
        <RingProgress
          size={64}
          strokeWidth={6}
          progress={stats.todayFocusedSeconds / RING_REFERENCE_SECONDS}
          trackColor="rgba(255,255,255,0.12)"
          gradientFrom={Palette.blue}
          gradientVia={Palette.mint}
          gradientTo={Palette.lime}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: colors.surfaceRaised, borderRadius: radius.md }]}>
          <AppText weight="bold" variant="title">
            {stats.todaySessionCount}
          </AppText>
          <AppText variant="caption" muted>
            Sessions
          </AppText>
        </View>
        <View style={[styles.statChip, { backgroundColor: colors.surfaceRaised, borderRadius: radius.md }]}>
          <AppText weight="bold" variant="title">
            {stats.longestStreak}d
          </AppText>
          <AppText variant="caption" muted>
            Best Streak
          </AppText>
        </View>
        <View style={[styles.statChip, { backgroundColor: colors.surfaceRaised, borderRadius: radius.md }]}>
          <AppText weight="bold" variant="title">
            {stats.currentStreak}d
          </AppText>
          <AppText variant="caption" muted>
            Current Streak
          </AppText>
        </View>
      </View>

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
        <Card style={styles.readyCard} raised={false}>
          <View style={styles.readyTextWrap}>
            <AppText variant="title" weight="bold" color="#173318">
              Ready to Flip
            </AppText>
            <AppText style={styles.readySubtitle} color="#3E5B3D">
              Place your phone face down to start a focus session.
            </AppText>
            {screenTime.blockedAppCount > 0 ? (
              <View style={styles.blockedPill}>
                <Icon name="shield.fill" size={11} color="#173318" />
                <AppText variant="caption" weight="medium" color="#173318">
                  {screenTime.blockedAppCount} app{screenTime.blockedAppCount === 1 ? '' : 's'} will be blocked
                </AppText>
              </View>
            ) : null}
          </View>
          <Image source={readyPhoneImage} style={styles.readyImage} contentFit="contain" />
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heading: {
    marginTop: 14,
    marginBottom: 18,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.darkBg,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  todayLeft: {
    flex: 1,
  },
  todayValue: {
    marginTop: 4,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2D3',
    borderRadius: 22,
    borderWidth: 0,
    paddingVertical: 22,
    paddingLeft: 22,
    paddingRight: 8,
  },
  readyTextWrap: {
    flex: 1,
  },
  readySubtitle: {
    marginTop: 6,
    lineHeight: 19,
    fontSize: 14,
  },
  blockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(23,51,24,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  readyImage: {
    width: 92,
    height: 92,
  },
});
