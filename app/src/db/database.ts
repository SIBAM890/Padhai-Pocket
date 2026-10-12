import * as SQLite from 'expo-sqlite';
import type { PadhaiEvent, StoredEvent, SyncStatus } from '../types/events';

let dbPromise: Promise<SQLite.SQLiteDatabase>;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('padhai-pocket.db');
  }
  return dbPromise;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      event_id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      ts TEXT NOT NULL,
      origin TEXT NOT NULL,
      node TEXT NOT NULL,
      action TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'PENDING',
      retry_count INTEGER NOT NULL DEFAULT 0,
      next_retry_at INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_events_profile_seq ON events(profile_id, seq);
    CREATE INDEX IF NOT EXISTS idx_events_sync ON events(sync_status, next_retry_at);
  `);

  const version = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );
  if (!version) {
    await db.runAsync('INSERT INTO schema_version(version) VALUES (?)', 1);
  }
  return db;
}

export async function insertEvent(
  event: PadhaiEvent,
  status: SyncStatus = 'PENDING'
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO events
      (event_id, profile_id, seq, ts, origin, node, action, payload_json, sync_status, retry_count, next_retry_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    event.event_id,
    event.profile_id,
    event.seq,
    event.ts,
    event.origin,
    event.node,
    event.action,
    JSON.stringify(event),
    status
  );
}

export async function listEvents(limit = 200): Promise<StoredEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    event_id: string;
    profile_id: string;
    seq: number;
    ts: string;
    origin: string;
    node: string;
    action: string;
    payload_json: string;
    sync_status: SyncStatus;
    retry_count: number;
    next_retry_at: number;
  }>(`SELECT * FROM events ORDER BY seq DESC, ts DESC LIMIT ?`, limit);

  return rows.map((row: {
    event_id: string;
    profile_id: string;
    seq: number;
    ts: string;
    origin: string;
    node: string;
    action: string;
    payload_json: string;
    sync_status: SyncStatus;
    retry_count: number;
    next_retry_at: number;
  }) => ({
    ...(JSON.parse(row.payload_json) as PadhaiEvent),
    sync_status: row.sync_status,
    retry_count: row.retry_count,
    next_retry_at: row.next_retry_at,
  }));
}

export async function pendingEvents(limit = 200): Promise<PadhaiEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ payload_json: string }>(
    `SELECT payload_json FROM events
     WHERE sync_status IN ('PENDING', 'ERROR') AND next_retry_at <= ?
     ORDER BY seq ASC LIMIT ?`,
    Date.now(),
    limit
  );
  return rows.map((r: { payload_json: string }) => JSON.parse(r.payload_json) as PadhaiEvent);
}

export async function markAcked(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getDatabase();
  for (const id of ids) {
    await db.runAsync(
      'UPDATE events SET sync_status = ?, retry_count = 0 WHERE event_id = ?',
      'ACKED',
      id
    );
  }
}

export async function markError(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getDatabase();
  for (const id of ids) {
    const row = await db.getFirstAsync<{ retry_count: number }>(
      'SELECT retry_count FROM events WHERE event_id = ?',
      id
    );
    const retry = (row?.retry_count ?? 0) + 1;
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s max
    const delay = Math.min(60_000, 1_000 * 2 ** Math.min(retry - 1, 6));
    await db.runAsync(
      'UPDATE events SET sync_status = ?, retry_count = ?, next_retry_at = ? WHERE event_id = ?',
      'ERROR',
      retry,
      Date.now() + delay,
      id
    );
  }
}

export async function purgeProfile(profileId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM events WHERE profile_id = ?', profileId);
}
