/**
 * replayVerify.test.ts — Unit tests for Replay Verification & Divergence Detection.
 *
 * T1 — Golden 3-event episode (MCQ wrong, PROBE 1/0/0, CONFIRM passed=false)
 *      -> all decisions MATCH.
 * T2 — Perturb one logged mastery_after by +0.01 -> exactly one MISMATCH
 *      at the expected step.
 * T3 — Empty events array -> returns "no episode data", no throw.
 */

import { runEpisodeReplay } from '../src/components/ReplayVerifyButton';
import type { StoredEvent } from '../src/types/events';

describe('Task B3: Episode Replay Verification', () => {
  const profileId = 'prof_demo_01';
  const episodeId = 'ep-1806635391';

  // Synthetic golden episode
  const goldenEpisodeEvents: StoredEvent[] = [
    // 1. OBSERVE MCQ_ANSWER (wrong -> mastery: 0.42 -> 0.2248)
    {
      schema_version: '1.1',
      event_id: 'ev-replay-01',
      profile_id: profileId,
      episode_id: episodeId,
      seq: 1,
      ts: '2026-10-14T10:00:00.000Z',
      origin: 'device',
      node: 'OBSERVE',
      action: 'MCQ_ANSWER',
      input_hash: '1234567890ab',
      output: { concept_id: 'distance_vs_displacement', correct: false },
      mastery_before: 0.42,
      mastery_after: 0.2248,
      network_mode: 'OFFLINE',
      engine_version: '1.0.0',
      pack_hash: 'pack_demo',
      sync_status: 'ACKED',
      retry_count: 0,
      next_retry_at: 0,
    },
    // 2. MASTERY Event (initial anchor)
    {
      schema_version: '1.1',
      event_id: 'ev-replay-02',
      profile_id: profileId,
      episode_id: episodeId,
      seq: 2,
      ts: '2026-10-14T10:00:01.000Z',
      origin: 'device',
      node: 'MASTERY',
      action: 'CONCEPT_UPDATE',
      input_hash: '1234567890ac',
      output: { concept_id: 'distance_vs_displacement', before: 0.42, after: 0.2248 },
      mastery_before: 0.42,
      mastery_after: 0.2248,
      network_mode: 'OFFLINE',
      engine_version: '1.0.0',
      pack_hash: 'pack_demo',
      sync_status: 'ACKED',
      retry_count: 0,
      next_retry_at: 0,
    },
    // 3. OBSERVE PROBE_SET_RESULT (P=1, A=0, T=0 -> P=1 boosts mastery from 0.2248 to 0.5842)
    {
      schema_version: '1.1',
      event_id: 'ev-replay-03',
      profile_id: profileId,
      episode_id: episodeId,
      seq: 3,
      ts: '2026-10-14T10:01:00.000Z',
      origin: 'device',
      node: 'OBSERVE',
      action: 'PROBE_SET_RESULT',
      input_hash: '1234567890ad',
      output: { P: 1, A: 0, T: 0 },
      mastery_before: 0.2248,
      mastery_after: 0.5842,
      network_mode: 'OFFLINE',
      engine_version: '1.0.0',
      pack_hash: 'pack_demo',
      sync_status: 'ACKED',
      retry_count: 0,
      next_retry_at: 0,
    },
    // 4. OBSERVE CONFIRM_ITEM_RESULT (passed=false)
    {
      schema_version: '1.1',
      event_id: 'ev-replay-04',
      profile_id: profileId,
      episode_id: episodeId,
      seq: 4,
      ts: '2026-10-14T10:02:00.000Z',
      origin: 'device',
      node: 'OBSERVE',
      action: 'CONFIRM_ITEM_RESULT',
      input_hash: '1234567890ae',
      output: { passed: false, candidate: 'LANGUAGE_OR_TERM_GAP_CANDIDATE', resulting_label: 'TERM_GAP' },
      mastery_before: 0.5842,
      mastery_after: 0.5842,
      network_mode: 'OFFLINE',
      engine_version: '1.0.0',
      pack_hash: 'pack_demo',
      sync_status: 'ACKED',
      retry_count: 0,
      next_retry_at: 0,
    },
  ];

  test('T1 — Golden episode reproduction -> all decisions MATCH', () => {
    const res = runEpisodeReplay(profileId, episodeId, goldenEpisodeEvents, false);

    expect(res.hasData).toBe(true);
    expect(res.totalSteps).toBe(3);
    expect(res.allMatch).toBe(true);
    expect(res.divergenceStep).toBeNull();
    expect(res.rows.every((r) => r.match)).toBe(true);

    // Verify step actions
    expect(res.rows[0].action).toBe('MCQ_ANSWER');
    expect(res.rows[1].action).toBe('PROBE_SET_RESULT');
    expect(res.rows[2].action).toBe('CONFIRM_ITEM_RESULT');
  });

  test('T2 — Simulate tamper (+0.01 perturbation) -> exactly one MISMATCH at step 1', () => {
    const res = runEpisodeReplay(profileId, episodeId, goldenEpisodeEvents, true);

    expect(res.hasData).toBe(true);
    expect(res.allMatch).toBe(false);
    expect(res.divergenceStep).toBe(1);
    expect(res.rows[0].match).toBe(false);
    expect(res.rows[0].divergenceReason).toContain('Mastery divergence');

    // Remaining steps match
    expect(res.rows[1].match).toBe(true);
    expect(res.rows[2].match).toBe(true);
  });

  test('T3 — Empty events array -> returns "no episode data", no throw', () => {
    const res = runEpisodeReplay(profileId, episodeId, []);
    expect(res.hasData).toBe(false);
    expect(res.totalSteps).toBe(0);
    expect(res.allMatch).toBe(true);
    expect(res.rows).toEqual([]);

    // Check with missing episode ID
    const res2 = runEpisodeReplay(profileId, '', goldenEpisodeEvents);
    expect(res2.hasData).toBe(false);
  });
});
