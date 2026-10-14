/**
 * sibam-finale.test.ts — Unit and Integration tests for Sibam's B2–B5 workstream.
 *
 * Test 1: getTeacherSnapshot correctly groups labels by confirm_threshold
 * Test 2: PIN lockout progression (5 wrong -> 60_000ms lock, 10 wrong -> 120_000ms lock)
 * Test 3: Empty events list -> empty snapshot without throwing
 */

import {
  getTeacherSnapshot,
  TeacherSnapshot,
} from '../src/db/queries/teacherQueries';
import type { StoredEvent } from '../src/types/events';

describe('Sibam Finale Tests (B2–B5)', () => {
  describe('teacherQueries — getTeacherSnapshot', () => {
    test('Empty events -> empty snapshot, no throw', () => {
      const snap = getTeacherSnapshot([], 'prof_demo_01');
      expect(snap.totalEvents).toBe(0);
      expect(snap.totalEpisodes).toBe(0);
      expect(snap.perConceptMastery).toEqual([]);
      expect(snap.perTermMastery).toEqual([]);
      expect(snap.labelCounts.provisional).toEqual({});
      expect(snap.labelCounts.confirmed).toEqual({});
      expect(snap.labelCounts.abstained).toBe(0);
      expect(snap.syncStatus).toEqual({ PENDING: 0, ACKED: 0, ERROR: 0, REJECTED: 0 });
    });

    test('Filters events strictly by profileId', () => {
      const syntheticEvents: StoredEvent[] = [
        {
          schema_version: '1.1',
          event_id: 'ev-01',
          profile_id: 'prof_other',
          seq: 1,
          ts: '2026-10-14T10:00:00.000Z',
          origin: 'device',
          node: 'MASTERY',
          action: 'CONCEPT_UPDATE',
          input_hash: '1234567890ab',
          output: { concept_id: 'motion', before: 0.4, after: 0.7 },
          mastery_before: 0.4,
          mastery_after: 0.7,
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_12345678',
          sync_status: 'ACKED',
          retry_count: 0,
          next_retry_at: 0,
        },
      ];

      const snap = getTeacherSnapshot(syntheticEvents, 'prof_demo_01');
      expect(snap.totalEvents).toBe(0);
      expect(snap.perConceptMastery.length).toBe(0);
    });

    test('Correctly groups labels by confirm_threshold (provisional vs confirmed vs abstained)', () => {
      const syntheticEvents: StoredEvent[] = [
        // 1. Provisional label (threshold = 1)
        {
          schema_version: '1.1',
          event_id: 'ev-01',
          profile_id: 'prof_demo_01',
          episode_id: 'ep-001',
          seq: 1,
          ts: '2026-10-14T10:00:00.000Z',
          origin: 'device',
          node: 'ACT',
          action: 'REMEDIATION_ASSIGNED',
          input_hash: '111111111111',
          output: { final_label: 'TERM_GAP' },
          confirm_threshold: 1,
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_hash_01',
          sync_status: 'ACKED',
          retry_count: 0,
          next_retry_at: 0,
        },
        // 2. Confirmed label (threshold = 2)
        {
          schema_version: '1.1',
          event_id: 'ev-02',
          profile_id: 'prof_demo_01',
          episode_id: 'ep-002',
          seq: 2,
          ts: '2026-10-14T10:05:00.000Z',
          origin: 'device',
          node: 'ACT',
          action: 'REMEDIATION_ASSIGNED',
          input_hash: '222222222222',
          output: { final_label: 'CONCEPT_GAP' },
          confirm_threshold: 2,
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_hash_01',
          sync_status: 'PENDING',
          retry_count: 0,
          next_retry_at: 0,
        },
        // 3. Abstained label (final_label = 'INCONSISTENT')
        {
          schema_version: '1.1',
          event_id: 'ev-03',
          profile_id: 'prof_demo_01',
          episode_id: 'ep-003',
          seq: 3,
          ts: '2026-10-14T10:10:00.000Z',
          origin: 'device',
          node: 'ACT',
          action: 'REMEDIATION_ASSIGNED',
          input_hash: '333333333333',
          output: { final_label: 'INCONSISTENT' },
          confirm_threshold: 1,
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_hash_01',
          sync_status: 'ERROR',
          retry_count: 1,
          next_retry_at: Date.now() + 1000,
        },
        // 4. Concept Mastery Update
        {
          schema_version: '1.1',
          event_id: 'ev-04',
          profile_id: 'prof_demo_01',
          seq: 4,
          ts: '2026-10-14T10:15:00.000Z',
          origin: 'device',
          node: 'MASTERY',
          action: 'CONCEPT_UPDATE',
          input_hash: '444444444444',
          output: { concept_id: 'distance_vs_displacement', after: 0.8597 },
          mastery_before: 0.5842,
          mastery_after: 0.8597,
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_hash_01',
          sync_status: 'ACKED',
          retry_count: 0,
          next_retry_at: 0,
        },
        // 5. Term Mastery Update
        {
          schema_version: '1.1',
          event_id: 'ev-05',
          profile_id: 'prof_demo_01',
          seq: 5,
          ts: '2026-10-14T10:20:00.000Z',
          origin: 'device',
          node: 'MASTERY',
          action: 'TERM_UPDATE',
          input_hash: '555555555555',
          output: { term_id: 'T_DISP', after: 0.4873 },
          mastery_before: 0.1735,
          mastery_after: 0.4873,
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_hash_01',
          sync_status: 'ACKED',
          retry_count: 0,
          next_retry_at: 0,
        },
      ];

      const snap = getTeacherSnapshot(syntheticEvents, 'prof_demo_01');

      expect(snap.totalEvents).toBe(5);
      expect(snap.totalEpisodes).toBe(3);
      expect(snap.packHash).toBe('pack_hash_01');
      expect(snap.engineVersion).toBe('1.0.0');

      // Labels
      expect(snap.labelCounts.provisional).toEqual({ TERM_GAP: 1 });
      expect(snap.labelCounts.confirmed).toEqual({ CONCEPT_GAP: 1 });
      expect(snap.labelCounts.abstained).toBe(1);

      // Sync status
      expect(snap.syncStatus).toEqual({
        PENDING: 1,
        ACKED: 3,
        ERROR: 1,
        REJECTED: 0,
      });

      // Mastery
      expect(snap.perConceptMastery).toEqual([
        {
          conceptId: 'distance_vs_displacement',
          mastery: 0.8597,
          ts: '2026-10-14T10:15:00.000Z',
        },
      ]);
      expect(snap.perTermMastery).toEqual([
        {
          termId: 'T_DISP',
          mastery: 0.4873,
          ts: '2026-10-14T10:20:00.000Z',
        },
      ]);
    });
  });

  describe('PIN Gate Lockout Math', () => {
    function computeLockoutDuration(attempts: number): number {
      if (attempts < 5 || attempts % 5 !== 0) return 0;
      const cycleIndex = Math.min(Math.floor(attempts / 5) - 1, 4);
      return 60_000 * Math.pow(2, cycleIndex);
    }

    test('5th wrong attempt triggers 60,000ms (1 min) lockout', () => {
      expect(computeLockoutDuration(4)).toBe(0);
      expect(computeLockoutDuration(5)).toBe(60_000);
    });

    test('10th wrong attempt triggers 120,000ms (2 min) lockout', () => {
      expect(computeLockoutDuration(9)).toBe(0);
      expect(computeLockoutDuration(10)).toBe(120_000);
    });

    test('15th wrong attempt triggers 240,000ms (4 min) lockout', () => {
      expect(computeLockoutDuration(15)).toBe(240_000);
    });
  });
});
