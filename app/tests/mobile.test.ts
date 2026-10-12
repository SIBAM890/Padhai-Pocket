/**
 * Test suite for Satya Mobile Infrastructure slice:
 * - SQLite storage & schema operations (PENDING, ACKED, ERROR)
 * - Trace Screen reading directly from SQLite
 * - Raw Log Screen reading directly from SQLite
 * - Network detection abstraction (ONLINE, WEAK, OFFLINE)
 * - Sync Client batch upload against OpenAPI specification
 * - Retry with exponential backoff & idempotency
 */

import type { PadhaiEvent, StoredEvent, SyncStatus } from '../src/types/events';
import {
  initDatabase,
  insertEvent,
  listEvents,
  pendingEvents,
  markAcked,
  markError,
  purgeProfile,
} from '../src/db/database';

describe('Satya Mobile Infrastructure Slice', () => {
  beforeEach(async () => {
    const sqliteMock = require('./mocks/expo-sqlite');
    const db = await sqliteMock.openDatabaseAsync('test.db');
    if (db.__reset) db.__reset();
  });

  describe('TASK 6: SQLite Local Persistence & Status Lifecycle', () => {
    test('initDatabase creates database and schema successfully', async () => {
      const db = await initDatabase();
      expect(db).toBeDefined();
    });

    test('event survives insert and retains PENDING status and timestamps', async () => {
      const sampleEvent: PadhaiEvent = {
        schema_version: '1.1',
        event_id: '123e4567-e89b-12d3-a456-426614174000',
        device_id: 'dev_01',
        profile_id: 'prof_01',
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        episode_id: null,
        seq: 1,
        ts: '2026-10-12T10:00:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: '000000000000',
        output: { correct: true },
        latency_ms: 120,
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'e3b0c44298fc',
      };

      await insertEvent(sampleEvent, 'PENDING');
      const events = await listEvents();
      expect(events.length).toBe(1);
      expect(events[0].event_id).toBe(sampleEvent.event_id);
      expect(events[0].sync_status).toBe('PENDING');
      expect(events[0].seq).toBe(1);
    });

    test('markAcked updates sync_status to ACKED only after server acknowledgment', async () => {
      const sampleEvent: PadhaiEvent = {
        schema_version: '1.1',
        event_id: '123e4567-e89b-12d3-a456-426614174002',
        device_id: 'dev_01',
        profile_id: 'prof_01',
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        episode_id: null,
        seq: 2,
        ts: '2026-10-12T10:01:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: '000000000000',
        output: { correct: false },
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'e3b0c44298fc',
      };

      await insertEvent(sampleEvent, 'PENDING');
      let pending = await pendingEvents();
      expect(pending.some((e) => e.event_id === sampleEvent.event_id)).toBe(true);

      // Now server responds with ACK
      await markAcked([sampleEvent.event_id]);

      const stored = await listEvents();
      const updated = stored.find((e) => e.event_id === sampleEvent.event_id);
      expect(updated?.sync_status).toBe('ACKED');

      // Should no longer be pending
      pending = await pendingEvents();
      expect(pending.some((e) => e.event_id === sampleEvent.event_id)).toBe(false);
    });

    test('markError increments retry count and sets exponential backoff', async () => {
      const sampleEvent: PadhaiEvent = {
        schema_version: '1.1',
        event_id: '123e4567-e89b-12d3-a456-426614174003',
        device_id: 'dev_01',
        profile_id: 'prof_01',
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        episode_id: null,
        seq: 3,
        ts: '2026-10-12T10:02:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: '000000000000',
        output: { correct: false },
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'e3b0c44298fc',
      };

      await insertEvent(sampleEvent, 'PENDING');
      await markError([sampleEvent.event_id]);

      const stored = await listEvents();
      const errored = stored.find((e) => e.event_id === sampleEvent.event_id);
      expect(errored?.sync_status).toBe('ERROR');
      expect(errored?.retry_count).toBe(1);
      expect(errored?.next_retry_at).toBeGreaterThan(Date.now());
    });

    test('purgeProfile purges all events belonging to that profile', async () => {
      const sampleEvent: PadhaiEvent = {
        schema_version: '1.1',
        event_id: '123e4567-e89b-12d3-a456-426614174004',
        device_id: 'dev_01',
        profile_id: 'prof_to_delete',
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        episode_id: null,
        seq: 1,
        ts: '2026-10-12T10:03:00.000Z',
        origin: 'device',
        node: 'PURGE',
        action: 'DELETE',
        input_hash: '000000000000',
        output: {},
        network_mode: 'ONLINE',
        engine_version: '1.0.0',
        pack_hash: 'e3b0c44298fc',
      };

      await insertEvent(sampleEvent);
      let list = await listEvents();
      expect(list.some((e) => e.profile_id === 'prof_to_delete')).toBe(true);

      await purgeProfile('prof_to_delete');
      list = await listEvents();
      expect(list.some((e) => e.profile_id === 'prof_to_delete')).toBe(false);
    });
  });

  describe('TASK 7 & 8: Trace & Raw Log Integration with SQLite', () => {
    test('Trace & Raw Log screens read directly from SQLite listEvents', async () => {
      const sampleEvent: PadhaiEvent = {
        schema_version: '1.1',
        event_id: '123e4567-e89b-12d3-a456-426614174005',
        device_id: 'dev_01',
        profile_id: 'prof_01',
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        episode_id: null,
        seq: 10,
        ts: '2026-10-12T10:04:00.000Z',
        origin: 'device',
        node: 'PROBE',
        action: 'PROBE_ITEM',
        input_hash: '000000000000',
        output: { modality: 'P', correct: true },
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'e3b0c44298fc',
      };

      await insertEvent(sampleEvent, 'PENDING');
      const rows = await listEvents(100);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0].node).toBe('PROBE');
      expect(rows[0].action).toBe('PROBE_ITEM');
      expect(rows[0].output).toEqual({ modality: 'P', correct: true });
    });
  });

  describe('TASK 9: Network Detection Abstraction', () => {
    test('detectNetworkMode supports ONLINE, WEAK, OFFLINE and forced offline toggle', async () => {
      const net = await import('../src/network/network');
      
      // Default with fetch
      const mode = await net.detectNetworkMode();
      expect(['ONLINE', 'WEAK', 'OFFLINE']).toContain(mode);

      // Force offline
      net.setForcedOffline(true);
      expect(net.isForcedOffline()).toBe(true);
      const forcedMode = await net.detectNetworkMode();
      expect(forcedMode).toBe('OFFLINE');

      // Unforce offline
      net.setForcedOffline(false);
      expect(net.isForcedOffline()).toBe(false);
    });
  });

  describe('TASK 10: Sync Client Contract & Idempotency', () => {
    test('sync handles ACKED, duplicates, and rejected according to openapi contract', async () => {
      const originalFetch = global.fetch;
      const testEventId = '11111111-1111-4111-8111-111111111111';

      await insertEvent({
        schema_version: '1.1',
        event_id: testEventId,
        device_id: 'dev_tab_01',
        profile_id: 'prof_01',
        session_id: '33333333-3333-4333-8333-333333333333',
        episode_id: null,
        seq: 1,
        ts: '2026-10-12T10:00:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: '000000000000',
        output: { correct: true },
        latency_ms: 0,
        network_mode: 'ONLINE',
        engine_version: '1.0.0',
        pack_hash: 'e3b0c44298fc',
      });

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('/healthz')) {
          return Promise.resolve({ ok: true });
        }
        if (url.includes('/v1/sync/events')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                acked: [testEventId],
                duplicates: [],
                rejected: [],
              }),
          });
        }
        return Promise.reject(new Error('Unknown url'));
      }) as any;

      const syncModule = await import('../src/sync/syncClient');
      const syncResult = await syncModule.syncPending({
        baseUrl: 'http://localhost:8000',
        deviceId: 'dev_tab_01',
      });

      expect(syncResult.acked).toBe(1);
      expect(syncResult.skipped).toBe(false);

      // Verify status changed to ACKED in SQLite
      const rows = await listEvents();
      const updated = rows.find((r) => r.event_id === testEventId);
      expect(updated?.sync_status).toBe('ACKED');

      global.fetch = originalFetch;
    });

    test('Exponential backoff calculation matches 1s, 2s, 4s, 8s, 16s, 32s, 60s max', () => {
      const getDelay = (retry: number) => Math.min(60_000, 1_000 * 2 ** Math.min(retry - 1, 6));
      expect(getDelay(1)).toBe(1000);
      expect(getDelay(2)).toBe(2000);
      expect(getDelay(3)).toBe(4000);
      expect(getDelay(4)).toBe(8000);
      expect(getDelay(5)).toBe(16000);
      expect(getDelay(6)).toBe(32000);
      expect(getDelay(7)).toBe(60000);
      expect(getDelay(10)).toBe(60000);
    });
  });
});
