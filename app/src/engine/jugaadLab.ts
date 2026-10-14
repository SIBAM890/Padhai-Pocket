/**
 * PadhAI Pocket — Pocket Jugaad Lab Engine
 * PRD v4.0 §4, §5, §7, §8 | FR-7, FR-8, FR-13, FR-20, FR-21
 *
 * 100% PURE TypeScript offline hardware sensor and village-object physics lab engine.
 * No non-deterministic functions, window, navigator, or fetch.
 * All time and sensor frames are passed as immutable arguments.
 */

import { updateConceptMastery } from './bkt';
import { EventData, buildEvent } from './eventBuilder';
import { sha256Bytes } from './sha256';

export type ExperimentId = 'EXP-MOTION-RAMP' | 'EXP-GRAV-PENDULUM' | 'EXP-SOUND-CLAP';

export interface SensorSample {
  t_ms: number;
  ax?: number;
  ay?: number;
  az?: number;
  db?: number;
}

export interface JugaadExperiment {
  id: ExperimentId;
  chunk_id: string;
  concept_id: string;
  title_or: string;
  title_en: string;
  missing_lab_gear: string;
  village_jugaad_or: string;
  village_jugaad_en: string;
  sensor_type: 'ACCELEROMETER' | 'MICROPHONE';
  prediction_prompt_or: string;
  prediction_prompt_en: string;
  options: { id: string; label_or: string; label_en: string; correct: boolean }[];
}

export const JUGAAD_EXPERIMENTS: JugaadExperiment[] = [
  {
    id: 'EXP-MOTION-RAMP',
    chunk_id: 'BSE9-PHYS-MOTION-S02-02',
    concept_id: 'distance_vs_displacement',
    title_or: 'ବହି ଢାଲୁ ଓ ଫୋନ୍ ସ୍ଲାଇଡ୍ (Book Ramp Motion)',
    title_en: 'Book Ramp & Phone Slide Motion',
    missing_lab_gear: 'Linear Air Track & Ticker-Tape Timer',
    village_jugaad_or: 'ବହି ঢାଲୁ (Book Ramp) — ଫୋନ୍ ଟିକୁ O ରୁ A (40 cm) ଏବଂ ପୁଣି A ରୁ O କୁ ଘୁଞ୍ଚାନ୍ତୁ',
    village_jugaad_en: 'Slide phone 40 cm forward (O → A) and 40 cm back to start (A → O) on a book',
    sensor_type: 'ACCELEROMETER',
    prediction_prompt_or: 'ଯଦି ଫୋନ୍ ଟି O ରୁ A (40 ସେ.ମି.) ଯାଇ ପୁଣି O କୁ ଫେରିଆସେ, ତେବେ ମୋଟ ବିସ୍ଥାପନ (Displacement) କେତେ ହେବ?',
    prediction_prompt_en: 'If the phone moves 40 cm forward (O → A) and returns to O, what is the net displacement?',
    options: [
      { id: 'opt_0', label_or: '0 ସେ.ମି. (ଶୂନ ବିସ୍ଥାପନ)', label_en: '0 cm (Zero displacement)', correct: true },
      { id: 'opt_80', label_or: '80 ସେ.ମି. (ମୋଟ ଦୂରତା)', label_en: '80 cm (Total distance)', correct: false },
    ],
  },
  {
    id: 'EXP-GRAV-PENDULUM',
    chunk_id: 'BSE9-PHYS-GRAV-S01-01',
    concept_id: 'gravitation_free_fall',
    title_or: 'ପଥର ଓ ସୂତା ଦୋଳକ (Stone Pendulum Gravity)',
    title_en: 'Stone & Thread Pendulum Gravity',
    missing_lab_gear: 'Brass Pendulum Bob, Retort Stand & Photogate',
    village_jugaad_or: 'ପଥର ଓ ସୂତା ଦୋଳକ (Stone & 50cm Thread Pendulum) — ୫ ଥର ଦୋଳାନ୍ତୁ',
    village_jugaad_en: 'Swing phone/pouch on a 50 cm string for 5 oscillations to measure gravity g',
    sensor_type: 'ACCELEROMETER',
    prediction_prompt_or: '୫୦ ସେ.ମି. ସୂତାରେ ବନ୍ଧା ପଥର ୫ ଥର ଦୋଳିଲେ, ପୃଥିବୀ ପୃଷ୍ଠରେ ମାଧ୍ୟାକର୍ଷଣଜନିତ ତ୍ୱରଣ (g) ର ମୂଲ୍ୟ ପ୍ରାୟ କେତେ ହେବ?',
    prediction_prompt_en: 'What will be the approximate acceleration due to gravity (g) measured on Earth?',
    options: [
      { id: 'opt_9_8', label_or: 'ପ୍ରାୟ 9.8 m/s² (ପୃଥିବୀ g)', label_en: 'Around 9.8 m/s² (Earth g)', correct: true },
      { id: 'opt_1_6', label_or: '1.6 m/s² (ଚନ୍ଦ୍ର g)', label_en: '1.6 m/s² (Moon g)', correct: false },
    ],
  },
  {
    id: 'EXP-SOUND-CLAP',
    chunk_id: 'BSE9-PHYS-MOTION-S02-01',
    concept_id: 'distance_vs_displacement',
    title_or: 'ଦୁଇଟି ତାଳି ଧ୍ୱନି ଘଡ଼ି (Two-Clap Acoustic Speed)',
    title_en: 'Two-Clap Acoustic Chronograph Speed',
    missing_lab_gear: 'Digital Acoustic Chronograph',
    village_jugaad_or: 'ଦୁଇଟି ତାଳି ଘଡ଼ି (Two-Clap Acoustic Timer) — ଆରମ୍ଭ ଓ ଶେଷ ତାଳି ବଜାନ୍ତୁ',
    village_jugaad_en: 'Clap at start (0 m) and clap at finish (3 m) to measure average speed v = d/t',
    sensor_type: 'MICROPHONE',
    prediction_prompt_or: '୩ ମିଟର ଦୂରତାରେ ଦୁଇଟି ତାଳି ମଧ୍ୟରେ ସମୟ ୧.୫ ସେକେଣ୍ଡ ହେଲେ, ହାରାହାରି ବେଗ (v = d/t) କେତେ ହେବ?',
    prediction_prompt_en: 'For 3 meters with 1.5 seconds between claps, what is the average speed v = d/t?',
    options: [
      { id: 'opt_2', label_or: '2.0 m/s (3m / 1.5s)', label_en: '2.0 m/s (3m / 1.5s)', correct: true },
      { id: 'opt_4_5', label_or: '4.5 m/s (3m × 1.5s)', label_en: '4.5 m/s (3m × 1.5s)', correct: false },
    ],
  },
];

export interface JugaadReflectChecks {
  sensor_calibrated: 'PASS' | 'FAIL';
  signal_to_noise: 'PASS' | 'FAIL';
  physical_bounds: 'PASS' | 'FAIL';
  hypothesis_match: 'PASS' | 'FAIL';
}

export interface JugaadMetrics {
  total_distance_m?: number;
  net_displacement_m?: number;
  measured_g_ms2?: number;
  measured_period_s?: number;
  delta_t_s?: number;
  measured_speed_ms?: number;
  snr: number;
  peak_accel_ms2?: number;
  peak_db?: number;
}

export interface JugaadExperimentTurnParams {
  experimentId: ExperimentId;
  samples: SensorSample[];
  hypothesisCorrect: boolean;
  profileId: string;
  sessionId: string;
  deviceId: string;
  seqStart: number;
  now: number;
  currentMastery: number;
  networkMode: 'ONLINE' | 'WEAK' | 'OFFLINE';
  packHash: string;
}

export interface JugaadExperimentTurnResult {
  events: EventData[];
  metrics: JugaadMetrics;
  reflectChecks: JugaadReflectChecks;
  allPassed: boolean;
  masteryBefore: number;
  masteryAfter: number;
  action: string;
}

/**
 * Pure UTF-8 encoder without Node Buffer or browser TextEncoder dependency.
 */
function utf8ToBytes(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Pure deterministic UUID v4 generator using SHA-256.
 * Guaranteed bit-identical output across runs.
 */
export function deterministicUuid(seedStr: string): string {
  const hash = sha256Bytes(utf8ToBytes(seedStr));
  const b = Array.from(hash.slice(0, 16));
  b[6] = (b[6] & 0x0f) | 0x40; // Version 4
  b[8] = (b[8] & 0x3f) | 0x80; // Variant RFC 4122
  const hex = b.map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Deterministic synthetic waveform generator.
 * Produces exactly 40 points (50 Hz, 50ms intervals from 0 to 1950 ms).
 * Pure mathematical functions (Math.sin, Math.cos).
 */
export function generateSyntheticSensorSamples(
  experimentId: ExperimentId,
  mode: 'clean' | 'shaky_noise'
): SensorSample[] {
  const samples: SensorSample[] = [];
  const dt = 0.05;

  if (experimentId === 'EXP-MOTION-RAMP') {
    if (mode === 'clean') {
      // 10 steps of +1.6, 10 steps of -1.6 (reaches 0.40m)
      // 10 steps of -1.6, 10 steps of +1.6 (returns to 0.00m)
      for (let i = 0; i < 40; i++) {
        let ax = 0;
        if (i < 10) ax = 1.6;
        else if (i < 20) ax = -1.6;
        else if (i < 30) ax = -1.6;
        else ax = 1.6;

        samples.push({
          t_ms: i * 50,
          ax: Number(ax.toFixed(4)),
          ay: 0,
          az: 9.8,
        });
      }
    } else {
      // High frequency alternating noise ±35 m/s²
      for (let i = 0; i < 40; i++) {
        const ax = i % 2 === 0 ? 35.0 : -35.0;
        samples.push({
          t_ms: i * 50,
          ax,
          ay: i % 2 === 0 ? -15.0 : 15.0,
          az: 9.8 + (i % 2 === 0 ? 25.0 : -25.0),
        });
      }
    }
  } else if (experimentId === 'EXP-GRAV-PENDULUM') {
    if (mode === 'clean') {
      const T = 1.42;
      const omega = (2 * Math.PI) / T;
      for (let i = 0; i < 40; i++) {
        const t = i * dt;
        const ax = 2.5 * Math.sin(omega * t);
        const az = 9.8 + 0.8 * Math.cos(2 * omega * t);
        samples.push({
          t_ms: i * 50,
          ax: Number(ax.toFixed(4)),
          ay: 0,
          az: Number(az.toFixed(4)),
        });
      }
    } else {
      for (let i = 0; i < 40; i++) {
        const ax = (i % 2 === 0 ? 32.0 : -32.0) + Math.sin(i * 1.5) * 5.0;
        samples.push({
          t_ms: i * 50,
          ax: Number(ax.toFixed(4)),
          ay: 12.0 * Math.cos(i),
          az: 9.8 + (i % 2 === 0 ? 28.0 : -28.0),
        });
      }
    }
  } else if (experimentId === 'EXP-SOUND-CLAP') {
    if (mode === 'clean') {
      for (let i = 0; i < 40; i++) {
        const t_ms = i * 50;
        let db = 35.0;
        if (t_ms === 200) db = 82.0;
        else if (t_ms === 1700) db = 84.0;
        samples.push({
          t_ms,
          db,
        });
      }
    } else {
      for (let i = 0; i < 40; i++) {
        const t_ms = i * 50;
        const db = 78.0 + (i % 3 === 0 ? 1.5 : -1.5);
        samples.push({
          t_ms,
          db: Number(db.toFixed(1)),
        });
      }
    }
  }

  return samples;
}

/**
 * Pure trial metrics calculator.
 */
export function calculateJugaadMetrics(
  experimentId: ExperimentId,
  samples: SensorSample[]
): { metrics: JugaadMetrics; isPhysicallyBounded: boolean } {
  if (experimentId === 'EXP-MOTION-RAMP') {
    let cur_v = 0;
    let tot_dist = 0;
    let net_disp = 0;
    let max_a = 0;
    let diff_sum = 0;

    for (let i = 0; i < samples.length; i++) {
      const a = samples[i].ax ?? 0;
      const absA = Math.abs(a);
      if (absA > max_a) max_a = absA;

      if (i > 0) {
        const prevA = samples[i - 1].ax ?? 0;
        diff_sum += Math.abs(a - prevA);
      }

      const dt_step =
        i < samples.length - 1
          ? (samples[i + 1].t_ms - samples[i].t_ms) / 1000
          : i > 0
          ? (samples[i].t_ms - samples[i - 1].t_ms) / 1000
          : 0.05;

      const v_start = cur_v;
      cur_v += a * dt_step;
      const v_end = cur_v;
      const dx = ((v_start + v_end) / 2) * dt_step;
      tot_dist += Math.abs(dx);
      net_disp += dx;
    }

    const avgJitter = diff_sum / Math.max(1, samples.length - 1);
    // SNR: clean signal has peak 1.6 and low jitter; noisy signal has huge jitter
    const snr = avgJitter > 0 ? Number((max_a / (avgJitter * 0.4 || 0.1)).toFixed(2)) : 10.0;
    const isPhysicallyBounded = max_a <= 25.0;

    return {
      metrics: {
        total_distance_m: Number(tot_dist.toFixed(2)),
        net_displacement_m: Number(net_disp.toFixed(2)),
        peak_accel_ms2: Number(max_a.toFixed(2)),
        snr,
      },
      isPhysicallyBounded,
    };
  }

  if (experimentId === 'EXP-GRAV-PENDULUM') {
    const zeroCrossings: number[] = [];
    let max_a = 0;
    let diff_sum = 0;

    for (let i = 0; i < samples.length - 1; i++) {
      const a1 = samples[i].ax ?? 0;
      const a2 = samples[i + 1].ax ?? 0;
      const t1 = samples[i].t_ms / 1000;
      const t2 = samples[i + 1].t_ms / 1000;

      if (Math.abs(a1) > max_a) max_a = Math.abs(a1);
      diff_sum += Math.abs(a2 - a1);

      if (a1 <= 0 && a2 > 0) {
        const t_cross = t1 + ((0 - a1) / (a2 - a1)) * (t2 - t1);
        zeroCrossings.push(t_cross);
      }
    }

    let measured_g = 0;
    let measured_T = 0;
    if (zeroCrossings.length >= 2) {
      measured_T = zeroCrossings[1] - zeroCrossings[0];
      measured_g = Number(((4 * Math.PI * Math.PI * 0.5) / (measured_T * measured_T)).toFixed(2));
    }

    const avgJitter = diff_sum / Math.max(1, samples.length - 1);
    const snr = avgJitter > 0 ? Number((max_a / (avgJitter * 0.4 || 0.1)).toFixed(2)) : 10.0;
    const isPhysicallyBounded = max_a <= 25.0 && measured_g >= 8.5 && measured_g <= 11.0;

    return {
      metrics: {
        measured_g_ms2: measured_g,
        measured_period_s: Number(measured_T.toFixed(2)),
        peak_accel_ms2: Number(max_a.toFixed(2)),
        snr,
      },
      isPhysicallyBounded,
    };
  }

  // EXP-SOUND-CLAP
  const ambient = 35.0;
  const clapThreshold = 60.0;
  const claps: number[] = [];
  let max_db = 0;
  let min_db = 999;

  for (const s of samples) {
    const db = s.db ?? ambient;
    if (db > max_db) max_db = db;
    if (db < min_db) min_db = db;
    if (db >= clapThreshold) {
      claps.push(s.t_ms);
    }
  }

  let delta_t_s = 0;
  let measured_speed_ms = 0;
  if (claps.length >= 2) {
    delta_t_s = Number(((claps[claps.length - 1] - claps[0]) / 1000).toFixed(2));
    measured_speed_ms = Number((3.0 / delta_t_s).toFixed(2));
  }

  const dynamicRange = max_db - min_db;
  const snr = Number((dynamicRange / 10.0).toFixed(2));
  const isPhysicallyBounded = max_db <= 120.0 && measured_speed_ms >= 0.5 && measured_speed_ms <= 15.0;

  return {
    metrics: {
      delta_t_s,
      measured_speed_ms,
      peak_db: max_db,
      snr,
    },
    isPhysicallyBounded,
  };
}

/**
 * Pure Trial Evaluator & Event Emitter.
 * Evaluates the 4 unmerged REFLECT checks and emits valid EventData rows.
 */
export function runJugaadExperimentTurn(
  params: JugaadExperimentTurnParams
): JugaadExperimentTurnResult {
  const exp =
    JUGAAD_EXPERIMENTS.find((e) => e.id === params.experimentId) ?? JUGAAD_EXPERIMENTS[0];

  const { metrics, isPhysicallyBounded } = calculateJugaadMetrics(
    params.experimentId,
    params.samples
  );

  const reflectChecks: JugaadReflectChecks = {
    sensor_calibrated: params.samples.length >= 10 ? 'PASS' : 'FAIL',
    signal_to_noise: metrics.snr >= 2.5 ? 'PASS' : 'FAIL',
    physical_bounds: isPhysicallyBounded ? 'PASS' : 'FAIL',
    hypothesis_match: params.hypothesisCorrect ? 'PASS' : 'FAIL',
  };

  const allPassed =
    reflectChecks.sensor_calibrated === 'PASS' &&
    reflectChecks.signal_to_noise === 'PASS' &&
    reflectChecks.physical_bounds === 'PASS' &&
    reflectChecks.hypothesis_match === 'PASS';

  let masteryAfter = params.currentMastery;
  let action = 'CONFIRM_PHYSICAL_INTUITION';

  if (allPassed) {
    masteryAfter = Number(updateConceptMastery(params.currentMastery, true).toFixed(4));
    action = 'CONFIRM_PHYSICAL_INTUITION';
  } else if (
    reflectChecks.signal_to_noise === 'FAIL' ||
    reflectChecks.physical_bounds === 'FAIL'
  ) {
    // Shaky or noisy trial: NEVER penalize the child
    masteryAfter = params.currentMastery;
    action = 'RETRY_STEADY_HAND';
  } else {
    // Hypothesis mismatch
    masteryAfter = params.currentMastery;
    action = 'RETRY_STEADY_HAND';
  }

  const isoTs = new Date(params.now).toISOString();
  const events: EventData[] = [];

  const emit = (
    node: EventData['node'],
    act: string,
    output: Record<string, any>,
    overrides?: Partial<EventData>
  ) => {
    const seq = params.seqStart + events.length;
    const event_id = deterministicUuid(`${params.sessionId}:${seq}:${node}:${act}`);

    const ev = buildEvent({
      schema_version: '1.1',
      event_id,
      device_id: params.deviceId,
      profile_id: params.profileId,
      session_id: params.sessionId,
      episode_id: null,
      seq,
      ts: isoTs,
      origin: 'device',
      node,
      action: act,
      output,
      latency_ms: 50,
      network_mode: params.networkMode,
      agreement: null,
      confirm_threshold: 1,
      mastery_before: params.currentMastery,
      mastery_after: masteryAfter,
      engine_version: '1.1.0',
      pack_hash: params.packHash,
      ...overrides,
    });

    events.push(ev);
  };

  // 1. PLAN
  emit('PLAN', 'PLAN_JUGAAD_EXPERIMENT', {
    experiment_id: exp.id,
    concept_id: exp.concept_id,
    missing_lab_gear: exp.missing_lab_gear,
    village_jugaad_or: exp.village_jugaad_or,
    village_jugaad_en: exp.village_jugaad_en,
  });

  // 2. TOOL
  emit('TOOL', 'CAPTURE_SENSOR_STREAM', {
    sensor_type: exp.sensor_type,
    sample_count: params.samples.length,
    interval_ms: 50,
  });

  // 3. OBSERVE
  emit('OBSERVE', 'ANALYZE_SENSOR_DATA', {
    experiment_id: exp.id,
    metrics,
  });

  // 4. REFLECT (4 unmerged checks)
  emit('REFLECT', 'EVALUATE_PHYSICAL_TRIAL', {
    checks: reflectChecks,
    all_passed: allPassed,
  });

  // 5. ACT
  if (action === 'RETRY_STEADY_HAND') {
    emit('ACT', 'RETRY_STEADY_HAND', {
      feedback_or: 'ଚାଲ ହାତ ସ୍ଥିର ରଖି ଆଉଥରେ ଚେଷ୍ଟା କରିବା',
      feedback_en: "Let's hold the phone steady and try once more",
    });
  } else {
    emit('ACT', 'CONFIRM_PHYSICAL_INTUITION', {
      feedback_or: 'ଅଭିନନ୍ଦନ! ଆପଣଙ୍କ ପରୀକ୍ଷଣ ସଫଳ ହେଲା ।',
      feedback_en: 'Great job! Your experiment matched physical theory.',
    });
  }

  // 6. MASTERY (when passed)
  if (allPassed) {
    emit(
      'MASTERY',
      'UPDATE_CONCEPT_MASTERY',
      {
        concept_id: exp.concept_id,
        mastery_before: params.currentMastery,
        mastery_after: masteryAfter,
      },
      {
        mastery_before: params.currentMastery,
        mastery_after: masteryAfter,
      }
    );
  }

  return {
    events,
    metrics,
    reflectChecks,
    allPassed,
    masteryBefore: params.currentMastery,
    masteryAfter,
    action,
  };
}
