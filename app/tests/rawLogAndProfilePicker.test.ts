import { _tickFiveTap } from '../src/hooks/useFiveTapGesture';
import { filterEventsForProfile } from '../src/components/RawLogModal';
import { generateProfileId } from '../src/screens/ProfilePickerScreen';
import type { StoredEvent } from '../src/types/events';

describe('Isolated Helper Components', () => {
  describe('_tickFiveTap — five-tap gesture logic', () => {
    test('T1 — 5 taps within 3s fires triggered=true on the 5th', () => {
      const windowMs = 3000;
      const requiredTaps = 5;
      let state = { count: 0, lastTapMs: 0 };

      // Simulate 5 taps within window
      const baseTime = 1000000;
      for (let i = 1; i <= 5; i++) {
        const now = baseTime + i * 100; // 100ms apart
        const { nextState, triggered } = _tickFiveTap(
          state,
          now,
          windowMs,
          requiredTaps
        );
        state = nextState;

        if (i === 5) {
          expect(triggered).toBe(true);
          expect(state.count).toBe(0); // counter resets after trigger
        } else {
          expect(triggered).toBe(false);
          expect(state.count).toBe(i);
        }
      }
    });

    test('T2 — 4 taps only → triggered=false', () => {
      const windowMs = 3000;
      const requiredTaps = 5;
      let state = { count: 0, lastTapMs: 0 };

      const baseTime = 1000000;
      for (let i = 1; i <= 4; i++) {
        const now = baseTime + i * 100;
        const { nextState, triggered } = _tickFiveTap(
          state,
          now,
          windowMs,
          requiredTaps
        );
        state = nextState;
        expect(triggered).toBe(false);
      }
      expect(state.count).toBe(4);
    });

    test('T3 — 5 taps with a >3s gap between them → reset, triggered=false', () => {
      const windowMs = 3000;
      const requiredTaps = 5;
      let state = { count: 0, lastTapMs: 0 };

      // First 3 taps close together
      const baseTime = 1000000;
      for (let i = 1; i <= 3; i++) {
        const now = baseTime + i * 100;
        const { nextState, triggered } = _tickFiveTap(
          state,
          now,
          windowMs,
          requiredTaps
        );
        state = nextState;
        expect(triggered).toBe(false);
      }
      expect(state.count).toBe(3);

      // Long gap (>3s) - should reset
      const nowAfterGap = baseTime + 4000; // 4 seconds later
      const { nextState: resetState, triggered: resetTriggered } = _tickFiveTap(
        state,
        nowAfterGap,
        windowMs,
        requiredTaps
      );
      expect(resetTriggered).toBe(false);
      expect(resetState.count).toBe(1); // Reset to 1 (current tap)
    });

    test('T4 — After firing, counter resets (next 5 taps fire again)', () => {
      const windowMs = 3000;
      const requiredTaps = 5;
      let state = { count: 0, lastTapMs: 0 };

      const baseTime = 1000000;

      // First 5 taps
      for (let i = 1; i <= 5; i++) {
        const now = baseTime + i * 100;
        const { nextState, triggered } = _tickFiveTap(
          state,
          now,
          windowMs,
          requiredTaps
        );
        state = nextState;
        if (i === 5) {
          expect(triggered).toBe(true);
        }
      }

      // Next 5 taps should fire again
      for (let i = 6; i <= 10; i++) {
        const now = baseTime + i * 100;
        const { nextState, triggered } = _tickFiveTap(
          state,
          now,
          windowMs,
          requiredTaps
        );
        state = nextState;
        if (i === 10) {
          expect(triggered).toBe(true);
        }
      }
    });
  });

  describe('filterEventsForProfile — RawLogModal helper', () => {
    const mockEvents: StoredEvent[] = [
      {
        event_id: 'evt-1',
        profile_id: 'prof_abc123',
        seq: 3,
        ts: '2026-01-01T10:00:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: 'abc12345',
        output: { correct: false },
        sync_status: 'ACKED',
        retry_count: 0,
        next_retry_at: 0,
        schema_version: '1.1',
        session_id: 'sess-1',
        episode_id: 'ep-1',
        latency_ms: 0,
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'abcdef123456',
      },
      {
        event_id: 'evt-2',
        profile_id: 'prof_abc123',
        seq: 1,
        ts: '2026-01-01T09:00:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: 'def67890',
        output: { correct: true },
        sync_status: 'PENDING',
        retry_count: 0,
        next_retry_at: 0,
        schema_version: '1.1',
        session_id: 'sess-1',
        episode_id: 'ep-1',
        latency_ms: 0,
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'abcdef123456',
      },
      {
        event_id: 'evt-3',
        profile_id: 'prof_xyz789',
        seq: 1,
        ts: '2026-01-01T11:00:00.000Z',
        origin: 'device',
        node: 'OBSERVE',
        action: 'MCQ_ANSWER',
        input_hash: 'ghi11111',
        output: { correct: true },
        sync_status: 'ACKED',
        retry_count: 0,
        next_retry_at: 0,
        schema_version: '1.1',
        session_id: 'sess-2',
        episode_id: 'ep-2',
        latency_ms: 0,
        network_mode: 'OFFLINE',
        engine_version: '1.0.0',
        pack_hash: 'abcdef123456',
      },
    ];

    test('T5 — Filters events by profileId', () => {
      const filtered = filterEventsForProfile(mockEvents, 'prof_abc123');
      expect(filtered.length).toBe(2);
      expect(filtered.every((e) => e.profile_id === 'prof_abc123')).toBe(true);
    });

    test('T6 — Sorts by seq ASC', () => {
      const filtered = filterEventsForProfile(mockEvents, 'prof_abc123');
      expect(filtered[0].seq).toBe(1);
      expect(filtered[1].seq).toBe(3);
    });
  });

  describe('generateProfileId — ProfilePickerScreen helper', () => {
    test('T7 — Returns string starting with prof_ and length 12-16 chars', () => {
      const id = generateProfileId();
      expect(typeof id).toBe('string');
      expect(id.startsWith('prof_')).toBe(true);
      expect(id.length).toBeGreaterThanOrEqual(12);
      expect(id.length).toBeLessThanOrEqual(16);
    });
  });
});