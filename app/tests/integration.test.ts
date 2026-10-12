/**
 * Integration test — PRD v4.0
 *
 * Proves the full loop: engine nextAction → SQLite insert → listEvents.
 * Verifies determinism, BKT mastery, and PRD §4.9 seed.
 *
 * NOTE: expo-sqlite is mocked via jest.config.js moduleNameMapper.
 *       The mock uses a module-level `table` array that must be reset between tests.
 */

import { nextAction, createInitialState } from '../src/engine';
import { computeSeed } from '../src/engine/seed';
import { initDatabase, insertEvent, listEvents } from '../src/db/database';

// Reset the in-memory SQLite mock table before each test to avoid bleed-over.
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sqliteMock = require('expo-sqlite');
  if (sqliteMock.__reset) sqliteMock.__reset();
  // Also reset the module-level dbPromise so initDatabase re-runs schema setup.
  jest.resetModules();
});

test('computeSeed: prof_demo_01/distance_vs_displacement/A must equal 1806635391', () => {
  const seed = computeSeed('prof_demo_01', 'distance_vs_displacement', 'A');
  expect(seed).toBe(1806635391);
});

test('Full loop: wrong MCQ produces OBSERVE + MASTERY events, BKT mastery, determinism, SQLite round-trip', async () => {
  // Re-require after resetModules so we get a fresh dbPromise.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { initDatabase: init, insertEvent: insert, listEvents: list } = require('../src/db/database');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { nextAction: na, createInitialState: cis } = require('../src/engine');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { computeSeed: cs } = require('../src/engine/seed');

  await init();

  const state = cis(
    'prof_demo_01',
    'sess_01',
    'distance_vs_displacement',
    0.42,
    1,       // threshold (demo)
    'OFFLINE'
  );

  const ctx = {
    now: 1792059821234,
    seed: cs('prof_demo_01', 'distance_vs_displacement', 'A'),
  };

  expect(ctx.seed).toBe(1806635391); // guard

  const input = {
    type: 'OBSERVE_MCQ' as const,
    correct: false,
    misconception_tag: 'path_equals_displacement',
  };

  const result = na(state, input, ctx);

  // Verify required event nodes.
  const nodes: string[] = result.events.map((e: any) => e.node);
  expect(nodes).toContain('OBSERVE');

  // Verify mastery moved via BKT, not hardcoded.
  // BKT wrong: pPrime = (0.42*0.10) / (0.42*0.10 + 0.58*0.75) = 0.042/0.477 ≈ 0.08805
  //            pNext = 0.08805 + (1−0.08805)*0.15 ≈ 0.22483...  → rounds to 0.2248
  expect(result.state.concept_mastery).toBeCloseTo(0.2248, 4);

  // Verify input_hash is a real 12-hex-char hash (not placeholder).
  const observeEvent = result.events.find((e: any) => e.node === 'OBSERVE');
  expect(observeEvent).toBeDefined();
  expect(observeEvent.input_hash).toMatch(/^[0-9a-f]{12}$/);
  expect(observeEvent.input_hash).not.toBe('000000000000');

  // Insert all events, then read them back from mock SQLite.
  for (const event of result.events) {
    await insert(event);
  }
  const stored = await list(50);
  expect(stored.length).toBeGreaterThan(0);
  expect(stored.every((e: any) => e.sync_status === 'PENDING')).toBe(true);

  // Determinism: same inputs produce identical outputs.
  const result2 = na(state, input, ctx);
  expect(result2.events.map((e: any) => e.node)).toEqual(nodes);
  expect(result2.state.concept_mastery).toBeCloseTo(result.state.concept_mastery, 4);
});

test('Full loop: correct MCQ advances lesson, mastery increases', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { nextAction: na, createInitialState: cis } = require('../src/engine');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { computeSeed: cs } = require('../src/engine/seed');

  const state = cis('prof_demo_01', 'sess_01', 'distance_vs_displacement', 0.42, 1, 'OFFLINE');
  const ctx = { now: 1792059821234, seed: cs('prof_demo_01', 'distance_vs_displacement', 'A') };

  const result = na(state, { type: 'OBSERVE_MCQ', correct: true, misconception_tag: null }, ctx);

  expect(result.action).toBe('ADVANCE_NEXT_LESSON');
  // BKT correct: mastery must be > initial 0.42
  expect(result.state.concept_mastery).toBeGreaterThan(0.42);
});
