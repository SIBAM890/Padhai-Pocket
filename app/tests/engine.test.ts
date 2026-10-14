import * as fs from 'fs';
import * as path from 'path';
import {
  candidateOf,
  resolve,
  Candidate,
  Bit,
  Pat,
  SetLabel,
} from '../src/engine/table';
import {
  bktStep,
  updateConceptMastery,
  updateTermMastery,
} from '../src/engine/bkt';
import { mulberry32, probeOrder } from '../src/engine/seed';
import { finalLabel, Verdict } from '../src/engine/finalLabel';
import { handleOfflineWrongAnswer } from '../src/engine/branch';
import {
  nextAction,
  createInitialState,
  EngineContext,
} from '../src/engine/index';

const sharedDir = path.resolve(__dirname, '../../shared');
const probeVectorsPath = path.join(sharedDir, 'probe_vectors.json');
const bktVectorsPath = path.join(sharedDir, 'bkt_vectors.json');

const probeVectors = JSON.parse(fs.readFileSync(probeVectorsPath, 'utf8'));
const bktVectors = JSON.parse(fs.readFileSync(bktVectorsPath, 'utf8'));

describe('Task 2 / Gate G1: Padhai Pocket Engine Tests', () => {
  describe('table.ts — candidateOf & resolve golden vectors', () => {
    test('Passes all 8 P/A/T patterns to candidates', () => {
      for (const item of probeVectors.patterns_to_candidate) {
        const pat = item.pattern as Pat;
        const actual = candidateOf(pat);
        expect(actual).toBe(item.candidate);
      }
    });

    test('Passes all 6 candidate × confirmation resolution outcomes', () => {
      for (const item of probeVectors.candidate_confirmation_to_label) {
        const actual = resolve(
          item.candidate as Candidate,
          item.confirm_passed
        );
        expect(actual).toBe(item.expected_label);
      }
    });

    test('Passes null audio cases (A = null -> INCONSISTENT)', () => {
      for (const item of probeVectors.null_audio_cases) {
        const pat = item.pattern as Pat;
        const actual = candidateOf(pat);
        expect(actual).toBe('INCONSISTENT');
      }
    });
  });

  describe('bkt.ts — BKT formulas & golden vectors', () => {
    const tolerance = bktVectors.parameters.tolerance;

    test('C-1: 0.42 + wrong -> 0.2248', () => {
      const v = bktVectors.vectors.find((x: any) => x.id === 'C-1');
      const res = updateConceptMastery(v.start, false);
      expect(Math.abs(res - v.steps[0].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );
    });

    test('C-2: 0.42 + correct -> 0.7643', () => {
      const v = bktVectors.vectors.find((x: any) => x.id === 'C-2');
      const res = updateConceptMastery(v.start, true);
      expect(Math.abs(res - v.steps[0].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );
    });

    test('C-3 chain: 0.42 -> wrong -> correct -> correct -> 0.2248, 0.5842, 0.8597', () => {
      const v = bktVectors.vectors.find((x: any) => x.id === 'C-3');
      let curr = v.start;

      curr = updateConceptMastery(curr, false);
      expect(Math.abs(curr - v.steps[0].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );

      curr = updateConceptMastery(curr, true);
      expect(Math.abs(curr - v.steps[1].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );

      curr = updateConceptMastery(curr, true);
      expect(Math.abs(curr - v.steps[2].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );
    });

    test('T-1: 0.40 term -> wrong -> correct -> 0.1735, 0.4873', () => {
      const v = bktVectors.vectors.find((x: any) => x.id === 'T-1');
      let curr = v.start;

      curr = updateTermMastery(curr, false);
      expect(Math.abs(curr - v.steps[0].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );

      curr = updateTermMastery(curr, true);
      expect(Math.abs(curr - v.steps[1].expected_rounded)).toBeLessThanOrEqual(
        tolerance
      );
    });
  });

  describe('seed.ts — Deterministic PRNG and PRD §4.9 seeded orders', () => {
    test('Reproduces all seeded probe orders from probe_vectors.json', () => {
      for (const item of probeVectors.seeded_orders) {
        const order = probeOrder(item.seed);
        expect(order).toEqual(item.order);
      }
    });
  });

  describe('finalLabel.ts — Agreement rule & sequence vectors', () => {
    test('Reproduces all finalLabel sequence vectors', () => {
      for (const item of probeVectors.final_label_sequences) {
        const verdict = finalLabel(
          item.sets as SetLabel[],
          item.threshold as 1 | 2
        );
        expect(verdict.done).toBe(item.expected.done);
        if (verdict.done) {
          const exp = item.expected as any;
          expect(verdict.label).toBe(exp.label);
          expect(verdict.status).toBe(exp.status);
          expect(verdict.agreement).toBe(exp.agreement);
        }
      }
    });
  });

  describe('branch.ts — Offline Decision Policy', () => {
    test('Offline wrong answer produces 3 distinct state changes', () => {
      const initial = {
        currentMastery: 0.42,
        queuedRevisions: [],
        chosenTier: 2,
        lastAction: 'none',
      };
      const res = handleOfflineWrongAnswer(
        'distance_vs_displacement',
        initial
      );

      expect(res.action).toBe('retry_with_simpler_cached_variant');
      expect(res.chosenTier).toBe(1);
      expect(res.queuedRevisions).toEqual(['distance_vs_displacement']);
      expect(res.nextMastery).toBeLessThan(initial.currentMastery);
      expect(res.stateChanges.tierChanged).toBe(true);
      expect(res.stateChanges.revisionQueued).toBe(true);
      expect(res.stateChanges.masteryLowered).toBe(true);
    });
  });

  describe('index.ts — pure nextAction state machine test', () => {
    test('Purity check: nextAction strictly uses ctx for now and seed', () => {
      const state = createInitialState('prof_demo_01', 'sess_01', 'distance_vs_displacement', 0.42, 1, 'OFFLINE');
      const ctx: EngineContext = { now: 1792059821234, seed: 1806635391, device_id: 'dev-test-uuid' };

      const out = nextAction(state, { type: 'OBSERVE_MCQ', correct: false, misconception_tag: 'path_equals_displacement' }, ctx);

      expect(out.events.length).toBeGreaterThan(0);
      expect(out.events[0].ts).toBe(new Date(ctx.now).toISOString());
      expect(out.state.current_set_order).toEqual(['T', 'A', 'P']); // seeded for 1806635391
      expect(out.state.queued_revisions).toContain('distance_vs_displacement');
    });
  });

  describe('G1 Audit Evidence', () => {
    test('A2: inputHash is canonical and 12 hex chars', () => {
      const { computeInputHash } = require('../src/engine/eventBuilder');
      const a = computeInputHash({ b: 2, a: 1 });
      const b = computeInputHash({ a: 1, b: 2 });
      expect(a).toBe(b);
      expect(a).toHaveLength(12);
      expect(/^[0-9a-f]{12}$/.test(a)).toBe(true);
    });

    test('A2: inputHash handles Odia UTF-8 without crash', () => {
      const { computeInputHash } = require('../src/engine/eventBuilder');
      const h = computeInputHash({ text: 'ଗତି' });
      expect(h).toHaveLength(12);
      expect(/^[0-9a-f]{12}$/.test(h)).toBe(true);
    });

    test('A4: BKT chain at full precision matches PRD §5.1', () => {
      const { updateConceptMastery } = require('../src/engine/bkt');
      const p1 = updateConceptMastery(0.42, false);
      const p2 = updateConceptMastery(p1, true);
      const p3 = updateConceptMastery(p2, true);
      expect(Math.abs(p1 - 0.2248)).toBeLessThan(5e-5);
      expect(Math.abs(p2 - 0.5842)).toBeLessThan(5e-5);
      expect(Math.abs(p3 - 0.8597)).toBeLessThan(5e-5);
    });
  });

  describe('resourceMatch.ts — Deterministic Resource Match & Disqualification Gates', () => {
    const { matchResources } = require('../src/engine/resourceMatch');

    test('TERM_GAP with P=1 selects RES-KUI-DISP-01 (100/100) and filters out draft RES-CLOUD-GEN-01', () => {
      const res = matchResources({
        final_label: 'TERM_GAP',
        pattern: [1, 0, 0],
        concept_id: 'distance_vs_displacement',
        term_id: 'T_DISP',
        concept_mastery: 0.5842,
        reading_load: 0,
        audio_available: true,
        network_mode: 'OFFLINE',
      });

      expect(res.selected.resource_id).toBe('RES-KUI-DISP-01');
      expect(res.selected.score).toBe(100);
      expect(res.runner_up?.resource_id).toBe('RES-VIS-WELL-01');
      expect(res.disqualified.some((d: any) => d.resource_id === 'RES-CLOUD-GEN-01' && d.reason === 'NOT_APPROVED')).toBe(true);
    });

    test('READING_GAP when audio_available=false disqualifies RES-AUD-STORY-01 and falls back to visual', () => {
      const res = matchResources({
        final_label: 'READING_GAP',
        pattern: [1, null, 0],
        concept_id: 'distance_vs_displacement',
        concept_mastery: 0.42,
        reading_load: 1,
        audio_available: false,
        network_mode: 'OFFLINE',
      });

      expect(res.disqualified.some((d: any) => d.resource_id === 'RES-AUD-STORY-01' && d.reason === 'AUDIO_UNAVAILABLE')).toBe(true);
      expect(res.selected.resource_id).toBe('RES-SLOW-PIC-01');
    });

    test('Cycle 2 anti-repetition skips already-used Rank #1 resource and selects Rank #2', () => {
      const res = matchResources({
        final_label: 'TERM_GAP',
        pattern: [1, 0, 0],
        concept_id: 'distance_vs_displacement',
        term_id: 'T_DISP',
        concept_mastery: 0.5842,
        reading_load: 0,
        audio_available: true,
        network_mode: 'OFFLINE',
        used_resource_ids: ['RES-KUI-DISP-01'],
      });

      expect(res.selected.resource_id).toBe('RES-VIS-WELL-01');
      expect(res.disqualified.some((d: any) => d.resource_id === 'RES-KUI-DISP-01' && d.reason === 'ALREADY_TRIED_IN_EPISODE')).toBe(true);
    });
  });
});

