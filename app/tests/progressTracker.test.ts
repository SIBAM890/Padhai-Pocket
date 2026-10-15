/**
 * progressTracker.test.ts — Unit Test Suite for FR-30 Compliant Student Progress Tracker
 *
 * 7 Mandatory Verification Tests:
 * 1. Initial state with 0 events returns baseline mastery (42% concept, 40% T_DISP) and recommends foundational practice.
 * 2. Feeding a full episode of events (0.42 -> 0.2248 -> 0.5842 -> 0.8597 concept and 0.40 -> 0.1735 -> 0.4873 term) updates concepts history array and terms mastery accurately.
 * 3. Modality strength calculator accurately computes P, A, and T pass percentages from PROBE_SET_RESULT events.
 * 4. Autonomous next_recommendation prioritizes TERM_FOLLOW_UP on T_DISP when Concept is 86% (0.8597) but Term is 49% (0.4873 < 0.55).
 * 5. replayMasteryFromEvents (FR-30) reproduces the exact 4-decimal BKT chain (maxDrift < 5e-5, verified === true) and detects tampering (verified === false) if a stored mastery_after float is altered.
 * 6. Zero forbidden deficit vocabulary ("wrong", "gap", "diagnosis", "failed", "weak") appears in child-facing labels (FR-13).
 * 7. Engine purity (FR-21): zero Math.random() or Date.now() in app/src/engine/progressTracker.ts.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  computeStudentProgress,
  replayMasteryFromEvents,
} from '../src/engine/progressTracker';
import type { StoredEvent } from '../src/types/events';

describe('FR-30 Student Progress Tracker Engine', () => {
  const profileId = 'prof_demo_01';

  function createStoredEvent(overrides: Partial<StoredEvent>): StoredEvent {
    return {
      schema_version: '1.1',
      event_id: 'ev_' + (overrides.seq ?? 1),
      profile_id: profileId,
      seq: 1,
      ts: '2026-10-15T00:00:00.000Z',
      origin: 'device',
      node: 'MASTERY',
      action: 'CONCEPT_UPDATE',
      input_hash: '1234567890ab',
      output: {},
      network_mode: 'OFFLINE',
      engine_version: '1.0.0',
      pack_hash: 'pack_demo',
      sync_status: 'ACKED',
      retry_count: 0,
      next_retry_at: 0,
      ...overrides,
    };
  }

  // -------------------------------------------------------------------------
  // TEST 1: Initial state with 0 events
  // -------------------------------------------------------------------------
  test('1. Initial state with 0 events returns baseline mastery (42% concept, 40% T_DISP) and recommends foundational practice', () => {
    const snap = computeStudentProgress(profileId, []);

    expect(snap.profile_id).toBe(profileId);
    expect(snap.total_events).toBe(0);
    expect(snap.episodes_completed).toBe(0);
    expect(snap.overall_concept_pct).toBe(42);
    expect(snap.overall_term_pct).toBeGreaterThan(0);

    // Concept baseline
    const concept = snap.concepts.find((c) => c.concept_id === 'distance_vs_displacement');
    expect(concept).toBeDefined();
    expect(concept?.current_mastery).toBe(0.42);
    expect(concept?.history).toEqual([0.42]);
    expect(concept?.status).toBe('UNLOCKED');

    // Term baseline
    const dispTerm = snap.terms.find((t) => t.term_id === 'T_DISP');
    expect(dispTerm).toBeDefined();
    expect(dispTerm?.current_mastery).toBe(0.40);
    expect(dispTerm?.history).toEqual([0.40]);
    expect(dispTerm?.status).toBe('NEW');

    // Recommendation when 0 events & mastery < 0.60
    expect(snap.next_recommendation.type).toBe('CONCEPT_REVISION');
    expect(snap.next_recommendation.target_id).toBe('distance_vs_displacement');
    expect(snap.next_recommendation.title_en).toContain('Foundational Concept Practice');
  });

  // -------------------------------------------------------------------------
  // TEST 2: Full episode event feeding & trajectory computation
  // -------------------------------------------------------------------------
  test('2. Feeding a full episode of events (0.42 -> 0.2248 -> 0.5842 -> 0.8597 concept and 0.40 -> 0.1735 -> 0.4873 term) updates concepts history array and terms mastery accurately', () => {
    const episodeEvents: StoredEvent[] = [
      createStoredEvent({
        seq: 1,
        node: 'MASTERY',
        action: 'CONCEPT_UPDATE',
        mastery_before: 0.42,
        mastery_after: 0.2248,
        output: { concept_id: 'distance_vs_displacement', before: 0.42, after: 0.2248 },
      }),
      createStoredEvent({
        seq: 2,
        node: 'MASTERY',
        action: 'CONCEPT_UPDATE',
        mastery_before: 0.2248,
        mastery_after: 0.5842,
        output: { concept_id: 'distance_vs_displacement', before: 0.2248, after: 0.5842 },
      }),
      createStoredEvent({
        seq: 3,
        node: 'MASTERY',
        action: 'CONCEPT_UPDATE',
        mastery_before: 0.5842,
        mastery_after: 0.8597,
        output: { concept_id: 'distance_vs_displacement', before: 0.5842, after: 0.8597 },
      }),
      createStoredEvent({
        seq: 4,
        node: 'MASTERY',
        action: 'TERM_UPDATE',
        mastery_before: 0.40,
        mastery_after: 0.1735,
        output: { term_id: 'T_DISP', before: 0.40, after: 0.1735 },
      }),
      createStoredEvent({
        seq: 5,
        node: 'MASTERY',
        action: 'TERM_UPDATE',
        mastery_before: 0.1735,
        mastery_after: 0.4873,
        output: { term_id: 'T_DISP', before: 0.1735, after: 0.4873 },
      }),
      createStoredEvent({
        seq: 6,
        node: 'SESSION',
        action: 'COMPLETION',
        output: {},
      }),
    ];

    const snap = computeStudentProgress(profileId, episodeEvents);

    expect(snap.total_events).toBe(6);
    expect(snap.episodes_completed).toBe(1);

    // Concept trajectory
    const concept = snap.concepts.find((c) => c.concept_id === 'distance_vs_displacement')!;
    expect(concept.history).toEqual([0.42, 0.2248, 0.5842, 0.8597]);
    expect(concept.current_mastery).toBe(0.8597);
    expect(concept.status).toBe('MASTERED');
    expect(snap.overall_concept_pct).toBe(86);

    // Term trajectory
    const term = snap.terms.find((t) => t.term_id === 'T_DISP')!;
    expect(term.history).toEqual([0.40, 0.1735, 0.4873]);
    expect(term.current_mastery).toBe(0.4873);
    expect(term.status).toBe('GROWING');
  });

  // -------------------------------------------------------------------------
  // TEST 3: 3-Modality Strength Profile (P, A, T)
  // -------------------------------------------------------------------------
  test('3. Modality strength calculator accurately computes P, A, and T pass percentages from PROBE_SET_RESULT events', () => {
    const probeEvents: StoredEvent[] = [
      createStoredEvent({
        seq: 1,
        node: 'OBSERVE',
        action: 'PROBE_SET_RESULT',
        output: { P: 1, A: 0, T: 1 },
      }),
      createStoredEvent({
        seq: 2,
        node: 'OBSERVE',
        action: 'PROBE_SET_RESULT',
        output: { P: 1, A: 1, T: 0 },
      }),
    ];

    const snap = computeStudentProgress(profileId, probeEvents);

    const pMod = snap.modalities.find((m) => m.modality === 'P')!;
    const aMod = snap.modalities.find((m) => m.modality === 'A')!;
    const tMod = snap.modalities.find((m) => m.modality === 'T')!;

    // P: 2/2 passed = 100%
    expect(pMod.passed).toBe(2);
    expect(pMod.total).toBe(2);
    expect(pMod.rate_pct).toBe(100);

    // A: 1/2 passed = 50%
    expect(aMod.passed).toBe(1);
    expect(aMod.total).toBe(2);
    expect(aMod.rate_pct).toBe(50);

    // T: 1/2 passed = 50%
    expect(tMod.passed).toBe(1);
    expect(tMod.total).toBe(2);
    expect(tMod.rate_pct).toBe(50);
  });

  // -------------------------------------------------------------------------
  // TEST 4: Autonomous "What to Study Next" Queue Priority
  // -------------------------------------------------------------------------
  test('4. Autonomous next_recommendation prioritizes TERM_FOLLOW_UP on T_DISP when Concept is 86% (0.8597) but Term is 49% (0.4873 < 0.55)', () => {
    const episodeEvents: StoredEvent[] = [
      createStoredEvent({
        seq: 1,
        action: 'CONCEPT_UPDATE',
        mastery_after: 0.8597,
        output: { concept_id: 'distance_vs_displacement', after: 0.8597 },
      }),
      createStoredEvent({
        seq: 2,
        action: 'TERM_UPDATE',
        mastery_after: 0.4873,
        output: { term_id: 'T_DISP', after: 0.4873 },
      }),
    ];

    const snap = computeStudentProgress(profileId, episodeEvents);

    expect(snap.overall_concept_pct).toBe(86);
    expect(snap.next_recommendation.type).toBe('TERM_FOLLOW_UP');
    expect(snap.next_recommendation.target_id).toBe('T_DISP');
    expect(snap.next_recommendation.title_en).toContain('15-Second Word Practice');
    expect(snap.next_recommendation.title_or).toContain('୧୫-ସେକେଣ୍ଡ ଓଡ଼ିଆ ଶବ୍ଦ ଅଭ୍ୟାସ: ବିସ୍ଥାପନ');
  });

  // -------------------------------------------------------------------------
  // TEST 5: FR-30 Live BKT Replay Verification & Tamper Detection
  // -------------------------------------------------------------------------
  test('5. replayMasteryFromEvents (FR-30) reproduces the exact 4-decimal BKT chain (maxDrift < 5e-5, verified === true) and detects tampering (verified === false) if a stored mastery_after float is altered', () => {
    const goldenEvents: StoredEvent[] = [
      createStoredEvent({
        seq: 1,
        node: 'MASTERY',
        action: 'CONCEPT_UPDATE',
        mastery_before: 0.42,
        mastery_after: 0.2248,
        output: { concept_id: 'distance_vs_displacement', after: 0.2248 },
      }),
      createStoredEvent({
        seq: 2,
        node: 'MASTERY',
        action: 'CONCEPT_UPDATE',
        mastery_before: 0.2248,
        mastery_after: 0.5842,
        output: { concept_id: 'distance_vs_displacement', after: 0.5842 },
      }),
      createStoredEvent({
        seq: 3,
        node: 'MASTERY',
        action: 'CONCEPT_UPDATE',
        mastery_before: 0.5842,
        mastery_after: 0.8597,
        output: { concept_id: 'distance_vs_displacement', after: 0.8597 },
      }),
      createStoredEvent({
        seq: 4,
        node: 'MASTERY',
        action: 'TERM_UPDATE',
        mastery_before: 0.40,
        mastery_after: 0.1735,
        output: { term_id: 'T_DISP', after: 0.1735 },
      }),
      createStoredEvent({
        seq: 5,
        node: 'MASTERY',
        action: 'TERM_UPDATE',
        mastery_before: 0.1735,
        mastery_after: 0.4873,
        output: { term_id: 'T_DISP', after: 0.4873 },
      }),
    ];

    // Clean replay
    const cleanResult = replayMasteryFromEvents(goldenEvents, 0.42, 0.40);
    expect(cleanResult.verified).toBe(true);
    expect(cleanResult.maxDrift).toBeLessThan(5e-5);
    expect(cleanResult.steps.length).toBe(5);
    expect(cleanResult.steps.every((s) => s.match)).toBe(true);

    // Tampered replay (tamper step 1 mastery_after by +0.01)
    const tamperedEvents: StoredEvent[] = goldenEvents.map((e, idx) =>
      idx === 0
        ? { ...e, mastery_after: 0.2348, output: { ...e.output, after: 0.2348 } }
        : e
    );

    const tamperedResult = replayMasteryFromEvents(tamperedEvents, 0.42, 0.40);
    expect(tamperedResult.verified).toBe(false);
    expect(tamperedResult.maxDrift).toBeGreaterThan(1e-4);
    expect(tamperedResult.steps[0].match).toBe(false);
  });

  // -------------------------------------------------------------------------
  // TEST 6: Zero Deficit Vocabulary (FR-13)
  // -------------------------------------------------------------------------
  test('6. Zero forbidden deficit vocabulary ("wrong", "gap", "diagnosis", "failed", "weak") appears in child-facing labels (FR-13)', () => {
    const snap = computeStudentProgress(profileId, [
      createStoredEvent({
        seq: 1,
        action: 'CONCEPT_UPDATE',
        mastery_after: 0.2248,
        output: { concept_id: 'distance_vs_displacement', after: 0.2248 },
      }),
    ]);

    const forbiddenWords = ['wrong', 'gap', 'diagnosis', 'failed', 'weak'];

    const childFacingStrings: string[] = [
      snap.next_recommendation.title_en,
      snap.next_recommendation.title_or,
      snap.next_recommendation.reason_en,
      snap.next_recommendation.reason_or,
      ...snap.concepts.map((c) => c.title_en),
      ...snap.concepts.map((c) => c.title_or),
      ...snap.concepts.map((c) => c.status),
      ...snap.terms.map((t) => t.en_word),
      ...snap.terms.map((t) => t.odia_word),
      ...snap.terms.map((t) => t.status),
      ...snap.modalities.map((m) => m.label_en),
      ...snap.modalities.map((m) => m.label_or),
    ];

    for (const text of childFacingStrings) {
      const lower = text.toLowerCase();
      for (const forbidden of forbiddenWords) {
        expect(lower).not.toContain(forbidden);
      }
    }
  });

  // -------------------------------------------------------------------------
  // TEST 7: Engine Purity (FR-21)
  // -------------------------------------------------------------------------
  test('7. Engine purity (FR-21): zero Math.random() or Date.now() in app/src/engine/progressTracker.ts', () => {
    const filePath = path.resolve(__dirname, '../src/engine/progressTracker.ts');
    const sourceCode = fs.readFileSync(filePath, 'utf-8');

    expect(sourceCode).not.toContain('Math.random()');
    expect(sourceCode).not.toContain('Date.now()');
    expect(sourceCode).not.toContain('window.');
    expect(sourceCode).not.toContain('fetch(');
  });
});
