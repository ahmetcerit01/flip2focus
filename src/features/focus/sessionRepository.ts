import { generateId } from '@/lib/id';
import { getDb } from '@/services/persistence/db';
import type { FocusSession, SessionMode, SessionStatus, TodayStats } from '@/types/session';

interface SessionRow {
  id: string;
  startedAt: number;
  endedAt: number | null;
  plannedSeconds: number | null;
  targetEndAt: number | null;
  focusedSeconds: number;
  status: SessionStatus;
  mode: SessionMode;
  blockedAppCount: number;
  createdAt: number;
}

function rowToSession(row: SessionRow): FocusSession {
  return { ...row };
}

export interface StartSessionInput {
  plannedSeconds: number | null;
  mode: SessionMode;
  blockedAppCount: number;
  startedAt?: number;
}

export async function startSession(input: StartSessionInput): Promise<FocusSession> {
  const db = await getDb();
  const startedAt = input.startedAt ?? Date.now();
  const targetEndAt = input.plannedSeconds != null ? startedAt + input.plannedSeconds * 1000 : null;
  const session: FocusSession = {
    id: generateId(),
    startedAt,
    endedAt: null,
    plannedSeconds: input.plannedSeconds,
    targetEndAt,
    focusedSeconds: 0,
    status: 'ACTIVE',
    mode: input.mode,
    blockedAppCount: input.blockedAppCount,
    createdAt: Date.now(),
  };
  await db.runAsync(
    `INSERT INTO sessions (id, startedAt, endedAt, plannedSeconds, targetEndAt, focusedSeconds, status, mode, blockedAppCount, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.startedAt,
      session.endedAt,
      session.plannedSeconds,
      session.targetEndAt,
      session.focusedSeconds,
      session.status,
      session.mode,
      session.blockedAppCount,
      session.createdAt,
    ],
  );
  return session;
}

export async function getActiveSession(): Promise<FocusSession | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SessionRow>(
    `SELECT * FROM sessions WHERE status = 'ACTIVE' ORDER BY startedAt DESC LIMIT 1`,
  );
  return row ? rowToSession(row) : null;
}

export async function getSessionById(id: string): Promise<FocusSession | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SessionRow>(`SELECT * FROM sessions WHERE id = ?`, [id]);
  return row ? rowToSession(row) : null;
}

/**
 * Finalizes a session exactly once. Callers must pass the definitive end
 * state; this never re-derives status from timestamps to avoid double
 * completion races.
 */
export async function finalizeSession(
  id: string,
  status: Extract<SessionStatus, 'COMPLETED' | 'INTERRUPTED'>,
  focusedSeconds: number,
  endedAt: number = Date.now(),
): Promise<FocusSession | null> {
  const db = await getDb();
  const result = await db.runAsync(
    `UPDATE sessions SET status = ?, focusedSeconds = ?, endedAt = ?
     WHERE id = ? AND status = 'ACTIVE'`,
    [status, Math.max(0, Math.round(focusedSeconds)), endedAt, id],
  );
  if (result.changes === 0) return null;
  return getSessionById(id);
}

export async function getTodayStats(dayStartMs: number, dayEndMs: number): Promise<TodayStats> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number | null; count: number }>(
    `SELECT SUM(focusedSeconds) as total, COUNT(*) as count FROM sessions
     WHERE status = 'COMPLETED' AND startedAt >= ? AND startedAt <= ?`,
    [dayStartMs, dayEndMs],
  );
  return { totalFocusedSeconds: row?.total ?? 0, sessionCount: row?.count ?? 0 };
}

export async function countStartedSessionsToday(dayStartMs: number, dayEndMs: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sessions WHERE startedAt >= ? AND startedAt <= ?`,
    [dayStartMs, dayEndMs],
  );
  return row?.count ?? 0;
}

export async function listSessionsInRange(startMs: number, endMs: number): Promise<FocusSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SessionRow>(
    `SELECT * FROM sessions WHERE startedAt >= ? AND startedAt <= ? ORDER BY startedAt DESC`,
    [startMs, endMs],
  );
  return rows.map(rowToSession);
}

export async function listRecentSessions(limit: number): Promise<FocusSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SessionRow>(`SELECT * FROM sessions ORDER BY startedAt DESC LIMIT ?`, [limit]);
  return rows.map(rowToSession);
}

/** Distinct local-day keys (derived by caller from startedAt) for every day with >=1 qualifying completed session. */
export async function listCompletedSessionsForStreak(minFocusedSeconds: number): Promise<FocusSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SessionRow>(
    `SELECT * FROM sessions WHERE status = 'COMPLETED' AND focusedSeconds >= ? ORDER BY startedAt ASC`,
    [minFocusedSeconds],
  );
  return rows.map(rowToSession);
}
