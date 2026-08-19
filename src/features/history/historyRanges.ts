import { addDaysToDateKey, endOfLocalDayMillis, localDateKey, startOfLocalDayMillis } from '@/lib/date';

export type HistorySegment = 'day' | 'week' | 'month';

export interface HistoryBucket {
  label: string;
  startMs: number;
  endMs: number;
}

export interface HistoryRange {
  startMs: number;
  endMs: number;
  buckets: HistoryBucket[];
  rangeLabel: string;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getHistoryRange(segment: HistorySegment, today: string = localDateKey()): HistoryRange {
  if (segment === 'day') {
    return {
      startMs: startOfLocalDayMillis(today),
      endMs: endOfLocalDayMillis(today),
      buckets: [{ label: 'Today', startMs: startOfLocalDayMillis(today), endMs: endOfLocalDayMillis(today) }],
      rangeLabel: 'Today',
    };
  }

  if (segment === 'week') {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) days.push(addDaysToDateKey(today, -i));
    const buckets = days.map((d) => {
      const weekday = new Date(startOfLocalDayMillis(d)).getDay();
      return { label: WEEKDAY_LABELS[weekday], startMs: startOfLocalDayMillis(d), endMs: endOfLocalDayMillis(d) };
    });
    return {
      startMs: buckets[0].startMs,
      endMs: buckets[buckets.length - 1].endMs,
      buckets,
      rangeLabel: `${formatShort(buckets[0].startMs)} – ${formatShort(buckets[buckets.length - 1].endMs)}`,
    };
  }

  // month: 6 rolling 5-day buckets (30 days)
  const buckets: HistoryBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const bucketEndKey = addDaysToDateKey(today, -i * 5);
    const bucketStartKey = addDaysToDateKey(bucketEndKey, -4);
    buckets.push({
      label: `${new Date(startOfLocalDayMillis(bucketStartKey)).getDate()}`,
      startMs: startOfLocalDayMillis(bucketStartKey),
      endMs: endOfLocalDayMillis(bucketEndKey),
    });
  }
  return {
    startMs: buckets[0].startMs,
    endMs: buckets[buckets.length - 1].endMs,
    buckets,
    rangeLabel: `${formatShort(buckets[0].startMs)} – ${formatShort(buckets[buckets.length - 1].endMs)}`,
  };
}

function formatShort(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
