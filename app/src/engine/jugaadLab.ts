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

export type ExperimentId =
  | 'EXP-MOTION-RAMP'
  | 'EXP-GRAV-PENDULUM'
  | 'EXP-SOUND-CLAP'
  | 'EXP-CHEM-TURMERIC'
  | 'EXP-BIO-OSMOSIS'
  | 'EXP-MATH-SHADOW';

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'maths';

export interface SensorSample {
  t_ms: number;
  ax?: number;
  ay?: number;
  az?: number;
  db?: number;
  ph?: number;
  salt_pct?: number;
  angle_deg?: number;
  distance_m?: number;
}

export interface JugaadExperiment {
  id: ExperimentId;
  subject: SubjectId;
  chunk_id: string;
  concept_id: string;
  title_or: string;
  title_en: string;
  missing_lab_gear: string;
  village_jugaad_or: string;
  village_jugaad_en: string;
  sensor_type: 'ACCELEROMETER' | 'MICROPHONE' | 'CAMERA_COLOR' | 'SOLVER_INPUT';
  prediction_prompt_or: string;
  prediction_prompt_en: string;
  options: { id: string; label_or: string; label_en: string; correct: boolean }[];
  input_parameter_label_or?: string;
  input_parameter_label_en?: string;
  preset_inputs?: { id: string; label_or: string; label_en: string; value: number }[];
}

export const JUGAAD_EXPERIMENTS: JugaadExperiment[] = [
  {
    id: 'EXP-MOTION-RAMP',
    subject: 'physics',
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
    input_parameter_label_or: 'ଢାଲୁ ଲମ୍ବ ବାଛନ୍ତୁ (Ramp Slide Distance)',
    input_parameter_label_en: 'Ramp Slide Distance (cm)',
    preset_inputs: [
      { id: 'dist_40', label_or: '40 ସେ.ମି. ଆଗକୁ ଓ ଫେରନ୍ତା (40cm Forward & Back)', label_en: '40 cm Forward & Back (Total 80cm)', value: 40 },
      { id: 'dist_20', label_or: '20 ସେ.ମି. ଆଗକୁ ଓ ଫେରନ୍ତା (20cm Forward & Back)', label_en: '20 cm Forward & Back (Total 40cm)', value: 20 },
    ],
  },
  {
    id: 'EXP-GRAV-PENDULUM',
    subject: 'physics',
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
    input_parameter_label_or: 'ଦୋଳକ ସୂତା ଲମ୍ବ (String Length L)',
    input_parameter_label_en: 'Pendulum String Length L (m)',
    preset_inputs: [
      { id: 'len_50', label_or: '0.50 ମିଟର (50 cm string, T ≈ 1.42 s)', label_en: '0.50 m (50 cm string, T ≈ 1.42 s)', value: 0.5 },
      { id: 'len_100', label_or: '1.00 ମିଟର (100 cm string, T ≈ 2.00 s)', label_en: '1.00 m (100 cm string, T ≈ 2.00 s)', value: 1.0 },
    ],
  },
  {
    id: 'EXP-SOUND-CLAP',
    subject: 'physics',
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
    input_parameter_label_or: 'ପରୀକ୍ଷଣ ଦୂରତା (Test Distance d)',
    input_parameter_label_en: 'Test Distance d (m)',
    preset_inputs: [
      { id: 'dist_3', label_or: '3.0 ମିଟର (ଦୁଇ ତାଳି ବ୍ୟବଧାନ 1.5s)', label_en: '3.0 m (1.5s between claps)', value: 3.0 },
      { id: 'dist_6', label_or: '6.0 ମିଟର (ଦୁଇ ତାଳି ବ୍ୟବଧାନ 3.0s)', label_en: '6.0 m (3.0s between claps)', value: 6.0 },
    ],
  },
  {
    id: 'EXP-CHEM-TURMERIC',
    subject: 'chemistry',
    chunk_id: 'BSE9-CHEM-MATTER-S01',
    concept_id: 'acid_base_indicator',
    title_or: 'ହଳଦୀ କାଗଜ ଅମ୍ଳ-କ୍ଷାରକ ପରୀକ୍ଷା (Turmeric pH Indicator)',
    title_en: 'Turmeric Paper Natural Acid-Base Indicator',
    missing_lab_gear: 'Digital pH Meter & Litmus Paper',
    village_jugaad_or: 'ହଳଦୀ କାଗଜ ସୂଚକ (Turmeric Paper) — ଲେମ୍ବୁ ରସ, ଜଳ କିମ୍ବା ଚୂନ ପାଣି ପକାନ୍ତୁ',
    village_jugaad_en: 'Make turmeric paper strips and add household drops (lemon, water, lime water)',
    sensor_type: 'CAMERA_COLOR',
    prediction_prompt_or: 'ହଳଦୀ କାଗଜ ଉପରେ ଚୂନ ପାଣି (କ୍ଷାରକ, pH ~11.5) ପକାଇଲେ କେଉଁ ରଙ୍ଗ ଦେଖାଯିବ?',
    prediction_prompt_en: 'If you add lime water (alkaline/base, pH ~11.5) to yellow turmeric paper, what color appears?',
    options: [
      { id: 'opt_red', label_or: 'ଲାଲ୍-ମାଟିଆ (Reddish-Brown)', label_en: 'Reddish-Brown (Basic reaction)', correct: true },
      { id: 'opt_blue', label_or: 'ନୀଳ ରଙ୍ଗ (Blue)', label_en: 'Blue color', correct: false },
    ],
    input_parameter_label_or: 'ପରୀକ୍ଷା ଦ୍ରବଣ ବାଛନ୍ତୁ (Select Test Solution pH)',
    input_parameter_label_en: 'Select Test Solution (pH Value)',
    preset_inputs: [
      { id: 'sol_lemon', label_or: 'ଲେମ୍ବୁ ରସ (pH 2.5 - Acid)', label_en: 'Lemon Juice (pH 2.5 - Acid)', value: 2.5 },
      { id: 'sol_water', label_or: 'ବିଶୁଦ୍ଧ ଜଳ (pH 7.0 - Neutral)', label_en: 'Pure Water (pH 7.0 - Neutral)', value: 7.0 },
      { id: 'sol_lime', label_or: 'ଚୂନ ପାଣି (pH 11.5 - Base)', label_en: 'Lime Water (pH 11.5 - Base)', value: 11.5 },
    ],
  },
  {
    id: 'EXP-BIO-OSMOSIS',
    subject: 'biology',
    chunk_id: 'BSE9-BIO-CELL-S01',
    concept_id: 'osmosis_cell_transport',
    title_or: 'ଆଳୁ ଓ ଲୁଣ ପାଣି ଅଭିସ୍ରବଣ (Potato Cell Osmometer)',
    title_en: 'Potato Cavity Cell Osmometer Lab',
    missing_lab_gear: 'Digital Osmometer & Dialysis Membrane',
    village_jugaad_or: 'ଛୋଟ ଆଳୁ ଖୋଳ ଓ ଲୁଣ ପାଣି (Potato Osmometer) — ଭିତରେ ଲୁଣ ଓ ବାହାର ପାତ୍ରରେ ପାଣି',
    village_jugaad_en: 'Scoop a potato cavity with salt inside and submerge in water beaker for 1 hour',
    sensor_type: 'SOLVER_INPUT',
    prediction_prompt_or: 'ଆଳୁ ଭିତରେ ଲୁଣ ଥିବା ବେଳେ ବାହାରେ ବିଶୁଦ୍ଧ ଜଳ (0% ଲୁଣ) ରହିଲେ, ଆଳୁ ଖୋଳ ଭିତର ଜଳସ୍ତର କ’ଣ ହେବ?',
    prediction_prompt_en: 'With salt inside the potato well and pure water (0% salt) outside, what happens to cavity water level?',
    options: [
      { id: 'opt_rise', label_or: 'ଜଳସ୍ତର ବୃଦ୍ଧି ପାଇବ (Endosmosis: Water enters)', label_en: 'Level rises (Water flows in)', correct: true },
      { id: 'opt_fall', label_or: 'ଜଳସ୍ତର କମିଯିବ (Exosmosis: Water leaves)', label_en: 'Level falls', correct: false },
    ],
    input_parameter_label_or: 'ବାହ୍ୟ ପାତ୍ରର ଲୁଣ ସାନ୍ଦ୍ରତା (Beaker Salt %)',
    input_parameter_label_en: 'Beaker Salt Concentration (%)',
    preset_inputs: [
      { id: 'salt_0', label_or: '0% ଲୁଣ (ବିଶୁଦ୍ଧ ଜଳ - Hypotonic)', label_en: '0% Salt (Pure Water - Hypotonic)', value: 0 },
      { id: 'salt_1', label_or: '1% ଲୁଣ (ଲଘୁ ଦ୍ରବଣ - Dilute)', label_en: '1% Salt (Dilute Saline)', value: 1 },
      { id: 'salt_20', label_or: '20% ଲୁଣ (ଘନ ଲୁଣ ପାଣି - Hypertonic)', label_en: '20% Salt (Heavy Brine - Hypertonic)', value: 20 },
    ],
  },
  {
    id: 'EXP-MATH-SHADOW',
    subject: 'maths',
    chunk_id: 'BSE9-MATH-REAL-S01',
    concept_id: 'similar_triangles_height',
    title_or: 'ବାଡ଼ି ଛାଇ ଓ କୋଣ ମାପକ (Sun Shadow & Tilt Clinometer)',
    title_en: 'Stick Shadow Clinometer & Tall Tree Height',
    missing_lab_gear: 'Optical Theodolite & Trigonometry Stand',
    village_jugaad_or: 'ଫୋନ୍ ଢଳାଣ କୋଣ (Tilt Clinometer) ଓ ପାଦ ଗଣତି ଦୂରତା (Paced Distance)',
    village_jugaad_en: 'Sight top of tree along phone edge to get angle θ, pace distance d to find Height = d·tan(θ) + h',
    sensor_type: 'ACCELEROMETER',
    prediction_prompt_or: 'ଯଦି ଗଛ ଠାରୁ ଦୂରତା ୮ ମିଟର, କୋଣ ୪୫° (tan 45° = 1.0) ଏବଂ ଆଖି ଉଚ୍ଚତା ୧.୨ ମିଟର ହୁଏ, ତେବେ ଗଛର ଉଚ୍ଚତା କେତେ?',
    prediction_prompt_en: 'If distance d = 8 m, tilt angle 45° (tan 45° = 1.0) and eye height 1.2 m, what is the tree height?',
    options: [
      { id: 'opt_9_2', label_or: '9.2 ମିଟର (8m × 1 + 1.2m)', label_en: '9.2 meters (8.0 × 1.0 + 1.2)', correct: true },
      { id: 'opt_16', label_or: '16.0 ମିଟର (8m × 2)', label_en: '16.0 meters', correct: false },
    ],
    input_parameter_label_or: 'ଢଳାଣ କୋଣ ଓ ଦୂରତା (Angle & Distance)',
    input_parameter_label_en: 'Tilt Angle θ and Distance d',
    preset_inputs: [
      { id: 'ang_45', label_or: 'କୋଣ 45°, ଦୂରତା 8m (tan 45° = 1.0)', label_en: 'Angle 45°, Distance 8m (tan 45° = 1.0)', value: 45 },
      { id: 'ang_30', label_or: 'କୋଣ 30°, ଦୂରତା 12m (tan 30° = 0.577)', label_en: 'Angle 30°, Distance 12m (tan 30° = 0.577)', value: 30 },
      { id: 'ang_60', label_or: 'କୋଣ 60°, ଦୂରତା 5m (tan 60° = 1.732)', label_en: 'Angle 60°, Distance 5m (tan 60° = 1.732)', value: 60 },
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

  // Chemistry: Turmeric indicator
  ph_value?: number;
  observed_color?: string;
  observed_color_or?: string;
  solution_nature?: 'Acidic' | 'Neutral' | 'Basic';
  solution_nature_or?: string;

  // Biology: Potato cavity osmometer
  salt_pct?: number;
  initial_height_mm?: number;
  final_height_mm?: number;
  delta_height_mm?: number;
  osmosis_type?: 'Endosmosis' | 'Isotonic' | 'Exosmosis';
  osmosis_type_or?: string;
  turgidity_state?: 'Turgid' | 'Normal' | 'Flaccid';
  turgidity_state_or?: string;

  // Maths: Shadow & tilt clinometer
  tilt_angle_deg?: number;
  distance_m?: number;
  eye_height_m?: number;
  tan_theta?: number;
  calculated_height_m?: number;

  // Student friendly "by taking this value u get this" takeaway
  student_takeaway_or?: string;
  student_takeaway_en?: string;
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
  } else if (experimentId === 'EXP-CHEM-TURMERIC') {
    const ph = mode === 'clean' ? 11.5 : 2.5;
    for (let i = 0; i < 40; i++) {
      samples.push({
        t_ms: i * 50,
        ph: Number((ph + (mode === 'clean' ? 0 : (i % 2 === 0 ? 0.3 : -0.3))).toFixed(1)),
      });
    }
  } else if (experimentId === 'EXP-BIO-OSMOSIS') {
    const salt_pct = mode === 'clean' ? 0 : 20;
    for (let i = 0; i < 40; i++) {
      samples.push({
        t_ms: i * 50,
        salt_pct,
      });
    }
  } else if (experimentId === 'EXP-MATH-SHADOW') {
    const angle_deg = mode === 'clean' ? 45 : 30;
    const distance_m = mode === 'clean' ? 8 : 12;
    for (let i = 0; i < 40; i++) {
      samples.push({
        t_ms: i * 50,
        angle_deg,
        distance_m,
      });
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
        student_takeaway_en:
          'By taking 40 cm forward (O → A) and 40 cm back (A → O): Total Distance is 0.80 m (80 cm), while Net Displacement is exactly 0.00 m!',
        student_takeaway_or:
          'ଫୋନ୍ କୁ ୪୦ ସେମି ଆଗକୁ ନେଇ ପୁଣି ଫେରାଇ ଆଣିଲେ: ମୋଟ ଦୂରତା 0.80 ମି. (୮୦ ସେମି) ହୁଏ, କିନ୍ତୁ ନିଟ୍ ବିସ୍ଥାପନ 0.00 ମି. (ଶୂନ) ରହେ !',
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
        student_takeaway_en:
          `By taking string length L = 0.50 m and period T = ${Number(measured_T.toFixed(2))} s: Earth gravity g = 4π²L / T² = ${measured_g} m/s²!`,
        student_takeaway_or:
          `ସୂତା ଲମ୍ବ 0.50 ମି. ଏବଂ ଦୋଳନ ସମୟ ${Number(measured_T.toFixed(2))} s ନେଲେ: ମାଧ୍ୟାକର୍ଷଣ ତ୍ୱରଣ g = ${measured_g} m/s² ମିଳିଥାଏ !`,
      },
      isPhysicallyBounded,
    };
  }

  if (experimentId === 'EXP-SOUND-CLAP') {
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
        student_takeaway_en:
          `By taking distance d = 3.0 m and clap interval Δt = ${delta_t_s} s: Speed v = d / Δt = ${measured_speed_ms} m/s!`,
        student_takeaway_or:
          `ଦୂରତା 3.0 ମି. ଏବଂ ଦୁଇ ତାଳି ବ୍ୟବଧାନ ${delta_t_s} s ନେଲେ: ହାରାହାରି ବେଗ v = ${measured_speed_ms} m/s ମିଳିଥାଏ !`,
      },
      isPhysicallyBounded,
    };
  }

  if (experimentId === 'EXP-CHEM-TURMERIC') {
    const ph = samples[0]?.ph ?? 11.5;
    let color = 'Yellow';
    let colorOr = 'ହଳଦିଆ';
    let nature: 'Acidic' | 'Neutral' | 'Basic' = 'Acidic';
    let natureOr = 'ଅମ୍ଳୀୟ';

    if (ph > 8.0) {
      color = 'Reddish-Brown';
      colorOr = 'ଲାଲ୍-ମାଟିଆ';
      nature = 'Basic';
      natureOr = 'କ୍ଷାରକୀୟ';
    } else if (ph >= 6.5) {
      color = 'Yellow';
      colorOr = 'ହଳଦିଆ';
      nature = 'Neutral';
      natureOr = 'ପ୍ରଶମିତ';
    }

    const takeawayEn =
      nature === 'Basic'
        ? `By taking value pH = ${ph} (Lime water / Base), turmeric paper turns Reddish-Brown! Base deprotonates curcumin into red dianion.`
        : `By taking value pH = ${ph} (Acid/Neutral), turmeric paper stays Yellow.`;
    const takeawayOr =
      nature === 'Basic'
        ? `pH = ${ph} (ଚୂନ ପାଣି / କ୍ଷାରକ) ନେଲେ ହଳଦୀ କାଗଜ ଲାଲ୍-ମାଟିଆ ହୋଇଯାଏ ! ଏହା କ୍ଷାରକୀୟ ପ୍ରକୃତି ପ୍ରମାଣ କରେ ।`
        : `pH = ${ph} (ଅମ୍ଳ/ପ୍ରଶମିତ) ନେଲେ ହଳଦୀ କାଗଜ ହଳଦିଆ ରହେ ।`;

    const isPhysicallyBounded = ph >= 0 && ph <= 14;

    return {
      metrics: {
        ph_value: ph,
        observed_color: color,
        observed_color_or: colorOr,
        solution_nature: nature,
        solution_nature_or: natureOr,
        snr: 8.5,
        student_takeaway_en: takeawayEn,
        student_takeaway_or: takeawayOr,
      },
      isPhysicallyBounded,
    };
  }

  if (experimentId === 'EXP-BIO-OSMOSIS') {
    const salt_pct = samples[0]?.salt_pct ?? 0;
    const initial_height_mm = 10.0;
    let delta = 0;
    let final_h = 10.0;
    let osmType: 'Endosmosis' | 'Isotonic' | 'Exosmosis' = 'Endosmosis';
    let osmTypeOr = 'ଅନ୍ତଃ-ଅଭିସ୍ରବଣ';
    let turgidity: 'Turgid' | 'Normal' | 'Flaccid' = 'Turgid';
    let turgidityOr = 'ସ୍ଫୀତ';

    if (salt_pct <= 2) {
      delta = 6.8;
      final_h = 16.8;
      osmType = 'Endosmosis';
      osmTypeOr = 'ଅନ୍ତଃ-ଅଭିସ୍ରବଣ';
      turgidity = 'Turgid';
      turgidityOr = 'ସ୍ଫୀତ';
    } else {
      delta = -5.5;
      final_h = 4.5;
      osmType = 'Exosmosis';
      osmTypeOr = 'ବହିଃ-ଅଭିସ୍ରବଣ';
      turgidity = 'Flaccid';
      turgidityOr = 'ଶିଥିଳ/ସଙ୍କୁଚିତ';
    }

    const takeawayEn =
      osmType === 'Endosmosis'
        ? `By taking outside salt = ${salt_pct}% (pure water), water rushes inward by Endosmosis! Potato cavity liquid rises from 10mm to ${final_h}mm (+68%) making cells Turgid.`
        : `By taking outside salt = ${salt_pct}% (concentrated brine), water gets drawn outward by Exosmosis! Potato cavity liquid drops to ${final_h}mm (-55%) making cells Flaccid.`;
    const takeawayOr =
      osmType === 'Endosmosis'
        ? `ବାହାରେ ${salt_pct}% ଲୁଣ (ବିଶୁଦ୍ଧ ଜଳ) ନେଲେ, ଅନ୍ତଃ-ଅଭିସ୍ରବଣ ଯୋଗୁଁ ଜଳ ଆଳୁ ଭିତରକୁ ପ୍ରବେଶ କରେ ଏବଂ ସ୍ତର 10mm ରୁ ${final_h}mm କୁ ବୃଦ୍ଧି ପାଏ !`
        : `ବାହାରେ ${salt_pct}% ଘନ ଲୁଣ ପାଣି ନେଲେ, ବହିଃ-ଅଭିସ୍ରବଣ ଯୋଗୁଁ ଜଳ ବାହାରିଯାଏ ଏବଂ ସ୍ତର ${final_h}mm କୁ ହ୍ରାସ ପାଏ !`;

    const isPhysicallyBounded = final_h >= 1.0 && final_h <= 30.0;

    return {
      metrics: {
        salt_pct,
        initial_height_mm,
        final_height_mm: final_h,
        delta_height_mm: delta,
        osmosis_type: osmType,
        osmosis_type_or: osmTypeOr,
        turgidity_state: turgidity,
        turgidity_state_or: turgidityOr,
        snr: 8.0,
        student_takeaway_en: takeawayEn,
        student_takeaway_or: takeawayOr,
      },
      isPhysicallyBounded,
    };
  }

  // EXP-MATH-SHADOW
  const angle_deg = samples[0]?.angle_deg ?? 45;
  const distance_m = samples[0]?.distance_m ?? (angle_deg === 30 ? 12 : angle_deg === 60 ? 5 : 8);
  const eye_height_m = 1.2;
  const rad = (angle_deg * Math.PI) / 180;
  const tan_theta = Number(Math.tan(rad).toFixed(3));
  const calculated_height_m = Number((distance_m * tan_theta + eye_height_m).toFixed(2));

  const takeawayEn = `By taking tilt angle = ${angle_deg}° (tan = ${tan_theta}) and distance = ${distance_m}m: Tree Height = (${distance_m} × ${tan_theta}) + 1.2m = ${calculated_height_m} meters!`;
  const takeawayOr = `କୋଣ = ${angle_deg}° (tan = ${tan_theta}) ଏବଂ ଦୂରତା = ${distance_m}m ନେଲେ: ଗଛର ଉଚ୍ଚତା = (${distance_m} × ${tan_theta}) + 1.2m = ${calculated_height_m} ମିଟର !`;

  const isPhysicallyBounded = calculated_height_m >= 1.0 && calculated_height_m <= 100.0;

  return {
    metrics: {
      tilt_angle_deg: angle_deg,
      distance_m,
      eye_height_m,
      tan_theta,
      calculated_height_m,
      snr: 9.0,
      student_takeaway_en: takeawayEn,
      student_takeaway_or: takeawayOr,
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
