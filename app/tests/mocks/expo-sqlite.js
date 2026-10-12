/**
 * In-memory SQLite mock for unit tests imitating expo-sqlite asynchronous APIs in plain JavaScript.
 */

const table = [];
let schemaVersion = 1;

const mockDb = {
  execAsync: jest.fn().mockImplementation(async (sql) => {
    return undefined;
  }),
  getFirstAsync: jest.fn().mockImplementation(async (sql, ...params) => {
    if (sql.includes('SELECT version FROM schema_version')) {
      return { version: schemaVersion };
    }
    if (sql.includes('SELECT retry_count FROM events WHERE event_id = ?')) {
      const id = params[0];
      const found = table.find((r) => r.event_id === id);
      return found ? { retry_count: found.retry_count } : null;
    }
    return null;
  }),
  getAllAsync: jest.fn().mockImplementation(async (sql, ...params) => {
    if (sql.includes('SELECT * FROM events')) {
      const limit = params[0] ?? 200;
      const sorted = [...table].sort((a, b) => b.seq - a.seq);
      return sorted.slice(0, limit);
    }
    if (sql.includes("WHERE sync_status IN ('PENDING', 'ERROR')")) {
      const maxRetryTime = params[0];
      const limit = params[1] ?? 200;
      const pending = table
        .filter((r) => (r.sync_status === 'PENDING' || r.sync_status === 'ERROR') && r.next_retry_at <= maxRetryTime)
        .sort((a, b) => a.seq - b.seq)
        .slice(0, limit)
        .map((r) => ({ payload_json: r.payload_json }));
      return pending;
    }
    return [];
  }),
  runAsync: jest.fn().mockImplementation(async (sql, ...params) => {
    if (sql.includes('INSERT INTO schema_version')) {
      schemaVersion = params[0];
      return { lastInsertRowId: 1, changes: 1 };
    }
    if (sql.includes('INSERT OR IGNORE INTO events')) {
      const [event_id, profile_id, seq, ts, origin, node, action, payload_json, sync_status] = params;
      if (!table.find((r) => r.event_id === event_id)) {
        table.push({
          event_id,
          profile_id,
          seq,
          ts,
          origin,
          node,
          action,
          payload_json,
          sync_status: sync_status ?? 'PENDING',
          retry_count: 0,
          next_retry_at: 0,
        });
        return { lastInsertRowId: table.length, changes: 1 };
      }
      return { lastInsertRowId: 0, changes: 0 };
    }
    if (sql.includes('UPDATE events SET sync_status = ?, retry_count = 0 WHERE event_id = ?')) {
      const [status, id] = params;
      const found = table.find((r) => r.event_id === id);
      if (found) {
        found.sync_status = status;
        found.retry_count = 0;
        return { changes: 1 };
      }
      return { changes: 0 };
    }
    if (sql.includes('UPDATE events SET sync_status = ?, retry_count = ?, next_retry_at = ? WHERE event_id = ?')) {
      const [status, retry, nextRetry, id] = params;
      const found = table.find((r) => r.event_id === id);
      if (found) {
        found.sync_status = status;
        found.retry_count = retry;
        found.next_retry_at = nextRetry;
        return { changes: 1 };
      }
      return { changes: 0 };
    }
    if (sql.includes('DELETE FROM events WHERE profile_id = ?')) {
      const pid = params[0];
      const initialLen = table.length;
      for (let i = table.length - 1; i >= 0; i--) {
        if (table[i].profile_id === pid) table.splice(i, 1);
      }
      return { changes: initialLen - table.length };
    }
    return { lastInsertRowId: 0, changes: 0 };
  }),
};

// Export helper to reset mock table
mockDb.__reset = () => {
  table.length = 0;
  schemaVersion = 1;
};

module.exports = {
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
};
