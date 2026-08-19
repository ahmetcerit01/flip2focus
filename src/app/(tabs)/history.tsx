import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BarChart } from '@/components/stats/BarChart';
import { SessionRow } from '@/components/stats/SessionRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { listRecentSessions, listSessionsInRange } from '@/features/focus/sessionRepository';
import { getHistoryRange, type HistorySegment } from '@/features/history/historyRanges';
import { formatHoursMinutes } from '@/lib/format';
import type { FocusSession } from '@/types/session';

const emptyImage = require('@/assets/branding/empty-history.png');

export default function HistoryScreen() {
  const [segment, setSegment] = useState<HistorySegment>('week');
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [hasAnySessions, setHasAnySessions] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const range = getHistoryRange(segment);
        const [rows, anyRows] = await Promise.all([
          listSessionsInRange(range.startMs, range.endMs),
          listRecentSessions(1),
        ]);
        if (!cancelled) {
          setSessions(rows);
          setHasAnySessions(anyRows.length > 0);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [segment]),
  );

  const range = getHistoryRange(segment);
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const totalFocusedSeconds = completedSessions.reduce((sum, s) => sum + s.focusedSeconds, 0);

  const chartData = range.buckets.map((bucket) => ({
    label: bucket.label,
    value: completedSessions
      .filter((s) => s.startedAt >= bucket.startMs && s.startedAt <= bucket.endMs)
      .reduce((sum, s) => sum + s.focusedSeconds, 0),
  }));

  const recentSessions = [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 20);

  if (hasAnySessions === false) {
    return (
      <Screen>
        <AppText variant="headline" weight="bold" style={styles.title}>
          History
        </AppText>
        <View style={styles.emptyWrap}>
          <Image source={emptyImage} style={styles.emptyImage} contentFit="contain" />
          <AppText variant="title" weight="semibold" style={{ marginTop: 8 }}>
            No focus sessions yet
          </AppText>
          <AppText secondary center style={styles.emptySubtitle}>
            Flip your phone face down on Home to start your first focus session.
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppText variant="headline" weight="bold" style={styles.title}>
        History
      </AppText>

      <SegmentedControl
        options={[
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ]}
        value={segment}
        onChange={setSegment}
      />

      <Card raised style={styles.summaryCard}>
        <AppText variant="small" muted>
          {range.rangeLabel}
        </AppText>
        <AppText variant="headline" weight="bold" style={{ marginTop: 4, marginBottom: 20 }}>
          {formatHoursMinutes(totalFocusedSeconds)}
        </AppText>
        <BarChart data={chartData} />
      </Card>

      <View style={styles.recentHeader}>
        <AppText weight="semibold" variant="title">
          Recent Sessions
        </AppText>
      </View>

      <Card>
        {recentSessions.length === 0 ? (
          <AppText muted center>
            No sessions in this range.
          </AppText>
        ) : (
          recentSessions.map((s) => <SessionRow key={s.id} session={s} />)
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 16,
  },
  summaryCard: {
    marginTop: 16,
  },
  recentHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyImage: {
    width: 220,
    height: 160,
  },
  emptySubtitle: {
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
