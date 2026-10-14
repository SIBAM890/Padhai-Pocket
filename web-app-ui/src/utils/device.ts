/**
 * Device utilities — UUID v4 and stable device ID management
 *
 * - uuidv4(): Generates RFC 4122 v4 UUIDs. This is the ONE allowed use of
 *   Math.random() outside the engine — it produces an identifier, not a decision.
 * - getDeviceId(): Returns a stable device ID persisted in SQLite. Generated once per install.
 */

import * as SQLite from 'expo-sqlite';

/**
 * Generates a UUID v4 (RFC 4122).
 * Uses Math.random() — allowed because this produces an identifier, not a decision.
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DEVICE_ID_KEY = 'device_id';

/**
 * Gets or creates a stable device ID.
 * Persisted in SQLite so it survives app restarts.
 */
export async function getDeviceId(): Promise<string> {
  const db = await SQLite.openDatabaseAsync('padhai-pocket.db');

  // Ensure device_meta table exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS device_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Try to get existing device_id
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM device_meta WHERE key = ?',
    DEVICE_ID_KEY
  );

  if (row) {
    return row.value;
  }

  // Generate new device ID (prefix + UUID v4)
  const deviceId = `dev-${uuidv4()}`;

  // Store it
  await db.runAsync(
    'INSERT INTO device_meta (key, value) VALUES (?, ?)',
    DEVICE_ID_KEY,
    deviceId
  );

  return deviceId;
}

/**
 * Clears the device ID (for testing only).
 */
export async function clearDeviceId(): Promise<void> {
  const db = await SQLite.openDatabaseAsync('padhai-pocket.db');
  await db.runAsync('DELETE FROM device_meta WHERE key = ?', DEVICE_ID_KEY);
}