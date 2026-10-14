/**
 * Unit Test Suite for Pocket Jugaad Lab
 * Tests 1 to 8:
 * 1. All 3 experiments exist in JUGAAD_EXPERIMENTS with valid chunk IDs and Odia descriptions.
 * 2. EXP-MOTION-RAMP clean trace computes total_distance_m = 0.80 and net_displacement_m = 0.00.
 * 3. EXP-GRAV-PENDULUM clean trace computes g in [9.6, 10.0] m/s².
 * 4. EXP-SOUND-CLAP clean trace computes delta_t = 1.50 s and v = 2.00 m/s.
 * 5. All 4 REFLECT gates pass independently on clean trials and boost Concept BKT (0.42 -> 0.7643).
 * 6. Shaky/noisy trials fail signal_to_noise / physical_bounds, emit ACT: RETRY_STEADY_HAND, and do NOT lower Concept BKT (0.42 -> 0.42).
 * 7. Emitted events strictly conform to shared/event.schema.json (12-hex input_hash, valid node, seq strictly increasing).
 * 8. Purity check: running runJugaadExperimentTurn twice with identical inputs produces byte-identical outputs.
 */

import {
  JUGAAD_EXPERIMENTS,
  generateSyntheticSensorSamples,
  calculateJugaadMetrics,
  runJugaadExperimentTurn,
  JugaadExperimentTurnParams,
} from '../src/engine/jugaadLab';

describe('Pocket Jugaad Lab — Offline Hardware Sensor Physics Lab Agent', () => {
  const baseParams: JugaadExperimentTurnParams = {
    experimentId: 'EXP-MOTION-RAMP',
    samples: [],
    hypothesisCorrect: true,
    profileId: 'prof_demo_01',
    sessionId: '34d63316-1d35-45d8-ba0b-d5425180df00',
    deviceId: 'dev_mock_001',
    seqStart: 10,
    now: 1792059821000,
    currentMastery: 0.42,
    networkMode: 'OFFLINE',
    packHash: 'pack_mock_hash_123',
  };

  test('T1: All 3 experiments exist in JUGAAD_EXPERIMENTS with valid chunk IDs and Odia descriptions', () => {
    expect(JUGAAD_EXPERIMENTS.length).toBe(3);
    const ids = JUGAAD_EXPERIMENTS.map((e) => e.id);
    expect(ids).toContain('EXP-MOTION-RAMP');
    expect(ids).toContain('EXP-GRAV-PENDULUM');
    expect(ids).toContain('EXP-SOUND-CLAP');

    for (const exp of JUGAAD_EXPERIMENTS) {
      expect(exp.chunk_id).toMatch(/^BSE9-PHYS-/);
      expect(exp.village_jugaad_or.length).toBeGreaterThan(10);
      expect(exp.village_jugaad_en.length).toBeGreaterThan(10);
      expect(exp.missing_lab_gear.length).toBeGreaterThan(5);
      expect(exp.options.length).toBeGreaterThanOrEqual(2);
      expect(exp.options.some((o) => o.correct)).toBe(true);
    }
  });

  test('T2: EXP-MOTION-RAMP clean trace computes total_distance_m = 0.80 and net_displacement_m = 0.00', () => {
    const samples = generateSyntheticSensorSamples('EXP-MOTION-RAMP', 'clean');
    expect(samples.length).toBe(40);

    const { metrics } = calculateJugaadMetrics('EXP-MOTION-RAMP', samples);
    expect(metrics.total_distance_m).toBe(0.80);
    expect(metrics.net_displacement_m).toBe(0.00);
  });

  test('T3: EXP-GRAV-PENDULUM clean trace computes g in [9.6, 10.0] m/s²', () => {
    const samples = generateSyntheticSensorSamples('EXP-GRAV-PENDULUM', 'clean');
    expect(samples.length).toBe(40);

    const { metrics } = calculateJugaadMetrics('EXP-GRAV-PENDULUM', samples);
    expect(metrics.measured_g_ms2).toBeDefined();
    expect(metrics.measured_g_ms2!).toBeGreaterThanOrEqual(9.6);
    expect(metrics.measured_g_ms2!).toBeLessThanOrEqual(10.0);
    expect(metrics.measured_g_ms2).toBe(9.79);
  });

  test('T4: EXP-SOUND-CLAP clean trace computes delta_t = 1.50 s and v = 2.00 m/s', () => {
    const samples = generateSyntheticSensorSamples('EXP-SOUND-CLAP', 'clean');
    expect(samples.length).toBe(40);

    const { metrics } = calculateJugaadMetrics('EXP-SOUND-CLAP', samples);
    expect(metrics.delta_t_s).toBe(1.50);
    expect(metrics.measured_speed_ms).toBe(2.00);
  });

  test('T5: All 4 REFLECT gates pass independently on clean trials and boost Concept BKT (0.42 -> 0.7643)', () => {
    const samples = generateSyntheticSensorSamples('EXP-MOTION-RAMP', 'clean');
    const result = runJugaadExperimentTurn({
      ...baseParams,
      experimentId: 'EXP-MOTION-RAMP',
      samples,
      hypothesisCorrect: true,
      currentMastery: 0.42,
    });

    expect(result.reflectChecks.sensor_calibrated).toBe('PASS');
    expect(result.reflectChecks.signal_to_noise).toBe('PASS');
    expect(result.reflectChecks.physical_bounds).toBe('PASS');
    expect(result.reflectChecks.hypothesis_match).toBe('PASS');
    expect(result.allPassed).toBe(true);

    // Concept BKT update for correct trial: 0.42 -> 0.7643
    expect(result.masteryBefore).toBe(0.42);
    expect(result.masteryAfter).toBe(0.7643);
    expect(result.action).toBe('CONFIRM_PHYSICAL_INTUITION');
  });

  test('T6: Shaky/noisy trials fail signal_to_noise / physical_bounds, emit ACT: RETRY_STEADY_HAND, and do NOT lower Concept BKT (0.42 -> 0.42)', () => {
    const noisySamples = generateSyntheticSensorSamples('EXP-MOTION-RAMP', 'shaky_noise');
    const result = runJugaadExperimentTurn({
      ...baseParams,
      experimentId: 'EXP-MOTION-RAMP',
      samples: noisySamples,
      hypothesisCorrect: true,
      currentMastery: 0.42,
    });

    expect(result.reflectChecks.signal_to_noise === 'FAIL' || result.reflectChecks.physical_bounds === 'FAIL').toBe(true);
    expect(result.allPassed).toBe(false);

    // Hard invariant: never penalize mastery on noisy sensor
    expect(result.masteryAfter).toBe(0.42);
    expect(result.action).toBe('RETRY_STEADY_HAND');

    const actEvent = result.events.find((e) => e.node === 'ACT');
    expect(actEvent).toBeDefined();
    expect(actEvent?.action).toBe('RETRY_STEADY_HAND');
    expect(actEvent?.output?.feedback_or).toContain('ଚାଲ ହାତ ସ୍ଥିର ରଖି ଆଉଥରେ ଚେଷ୍ଟା କରିବା');
  });

  test('T7: Emitted events strictly conform to shared/event.schema.json (12-hex input_hash, valid node, seq strictly increasing)', () => {
    const samples = generateSyntheticSensorSamples('EXP-MOTION-RAMP', 'clean');
    const result = runJugaadExperimentTurn({
      ...baseParams,
      seqStart: 100,
      samples,
      hypothesisCorrect: true,
    });

    expect(result.events.length).toBeGreaterThanOrEqual(5);

    const validNodes = ['PLAN', 'TOOL', 'OBSERVE', 'PROBE', 'CONFIRM', 'REFLECT', 'ACT', 'MASTERY'];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let prevSeq = 99;
    for (const ev of result.events) {
      expect(ev.schema_version).toBe('1.1');
      expect(ev.event_id).toMatch(uuidRegex);
      expect(ev.profile_id).toBe(baseParams.profileId);
      expect(ev.session_id).toBe(baseParams.sessionId);
      expect(ev.origin).toBe('device');
      expect(validNodes).toContain(ev.node);
      expect(typeof ev.action).toBe('string');
      expect(ev.input_hash).toMatch(/^[0-9a-f]{12}$/);
      expect(typeof ev.output).toBe('object');
      expect(ev.network_mode).toBe('OFFLINE');
      expect(ev.engine_version).toBe('1.1.0');
      expect(ev.pack_hash).toBe(baseParams.packHash);

      // Strictly increasing seq
      expect(ev.seq).toBe(prevSeq + 1);
      prevSeq = ev.seq;
    }
  });

  test('T8: Purity check: running runJugaadExperimentTurn twice with identical inputs produces byte-identical outputs', () => {
    const samples = generateSyntheticSensorSamples('EXP-GRAV-PENDULUM', 'clean');
    const input: JugaadExperimentTurnParams = {
      ...baseParams,
      experimentId: 'EXP-GRAV-PENDULUM',
      samples,
      hypothesisCorrect: true,
      seqStart: 42,
      now: 1792059999000,
      currentMastery: 0.50,
    };

    const res1 = runJugaadExperimentTurn(input);
    const res2 = runJugaadExperimentTurn(input);

    expect(JSON.stringify(res1)).toBe(JSON.stringify(res2));
  });
});
