import * as SQLite from 'expo-sqlite';

const DB_NAME = 'flip2focus.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initError: Error | null = null;

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      startedAt INTEGER NOT NULL,
      endedAt INTEGER,
      plannedSeconds INTEGER,
      targetEndAt INTEGER,
      focusedSeconds INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      mode TEXT NOT NULL,
      blockedAppCount INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_startedAt ON sessions (startedAt);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);
  `);
}

/**
 * Lazily opens (once) and migrates the SQLite database.
 * Throws on failure so callers can render a user-safe persistence-error state
 * instead of silently losing session data.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (initError) return Promise.reject(initError);
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        await migrate(db);
        return db;
      } catch (err) {
        initError = err instanceof Error ? err : new Error(String(err));
        dbPromise = null;
        throw initError;
      }
    })();
  }
  return dbPromise;
}

export function getDbInitError(): Error | null {
  return initError;
}
