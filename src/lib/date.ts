/** Local calendar date key, e.g. "2026-08-19". Never use UTC — streaks/limits are user-local. */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function localDateKeyFromMillis(ms: number): string {
  return localDateKey(new Date(ms));
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return localDateKey(dt);
}

export function isSameOrAfter(a: string, b: string): boolean {
  return a >= b;
}

export function startOfLocalDayMillis(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

export function endOfLocalDayMillis(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}
