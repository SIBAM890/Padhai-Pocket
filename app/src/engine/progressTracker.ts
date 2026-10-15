/**
 * PRD v4.0 §5.1, §8.4 / FR-30 & FR-8: Event-Sourced Student Progress Tracker
 *
 * Engine Purity (FR-21): 100% pure TypeScript.
 * Deterministic execution with zero time, RNG, DOM, or network dependencies.
 * Zero Deficit Vocabulary (FR-13): All child-facing copy uses growth framing.
 */

import { updateConceptMastery, updateTermMastery } from './bkt';
import type { PadhaiEvent, StoredEvent } from '../types/events';

// ---------------------------------------------------------------------------
// 1. DATA INTERFACES
// ---------------------------------------------------------------------------

export interface ConceptProgressItem {
  concept_id: string;
  title_or: string;
  title_en: string;
  chunk_id: string;
  current_mastery: number;
  history: number[];
  attempts: number;
  status: 'MASTERED' | 'GROWING' | 'UNLOCKED';
}

export interface TermProgressItem {
  term_id: string;
  odia_word: string;
  en_word: string;
  current_mastery: number;
  history: number[];
  status: 'MASTERED' | 'GROWING' | 'NEW';
}

export interface ModalityStrength {
  modality: 'P' | 'A' | 'T';
  label_or: string;
  label_en: string;
  passed: number;
  total: number;
  rate_pct: number;
}

export interface NextStudyRecommendation {
  type: 'TERM_FOLLOW_UP' | 'CONCEPT_REVISION' | 'SENSOR_LAB' | 'NEXT_CONCEPT';
  target_id: string;
  title_or: string;
  title_en: string;
  reason_or: string;
  reason_en: string;
}

export interface StudentProgressSnapshot {
  profile_id: string;
  total_events: number;
  episodes_completed: number;
  overall_concept_pct: number;
  overall_term_pct: number;
  concepts: ConceptProgressItem[];
  terms: TermProgressItem[];
  modalities: ModalityStrength[];
  next_recommendation: NextStudyRecommendation;
  replay_verified: boolean;
  replay_max_drift: number;
}

export interface ReplayStep {
  seq: number;
  kind: 'concept' | 'term';
  expected: number;
  replayed: number;
  match: boolean;
}

export interface ReplayVerificationResult {
  verified: boolean;
  maxDrift: number;
  replayedConceptMastery: number;
  replayedTermMastery: number;
  steps: ReplayStep[];
}

export interface ProgressEngineState {
  profile_id?: string;
  concept_id?: string;
  concept_mastery?: number;
  term_masteries?: Record<string, number>;
  queued_revisions?: string[];
}

// ---------------------------------------------------------------------------
// 2. BASELINE CURRICULUM DEFINITIONS (BSE Odisha Class 9 Science)
// ---------------------------------------------------------------------------

export const DEFAULT_CONCEPTS: Array<{
  concept_id: string;
  title_or: string;
  title_en: string;
  chunk_id: string;
  initial_mastery: number;
}> = [
  {
    concept_id: 'distance_vs_displacement',
    title_or: 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
    title_en: 'Distance vs Displacement',
    chunk_id: 'motion_01',
    initial_mastery: 0.42,
  },
  {
    concept_id: 'velocity_and_acceleration',
    title_or: 'ବେଗ ଏବଂ ତ୍ୱରଣ',
    title_en: 'Velocity & Acceleration',
    chunk_id: 'motion_02',
    initial_mastery: 0.35,
  },
  {
    concept_id: 'gravitation_mass_weight',
    title_or: 'ମାଧ୍ୟାକର୍ଷଣ, ବସ୍ତୁତ୍ୱ ଏବଂ ଓଜନ',
    title_en: 'Gravitation, Mass & Weight',
    chunk_id: 'gravitation_01',
    initial_mastery: 0.30,
  },
];

export const DEFAULT_TERMS: Array<{
  term_id: string;
  odia_word: string;
  en_word: string;
  default_mastery: number;
}> = [
  { term_id: 'T_DISP', odia_word: 'ବିସ୍ଥାପନ', en_word: 'Displacement', default_mastery: 0.40 },
  { term_id: 'T_DIST', odia_word: 'ଦୂରତା', en_word: 'Distance', default_mastery: 0.55 },
  { term_id: 'T_SPEED', odia_word: 'ଦ୍ରୁତି', en_word: 'Speed', default_mastery: 0.50 },
  { term_id: 'T_VEL', odia_word: 'ବେଗ', en_word: 'Velocity', default_mastery: 0.40 },
  { term_id: 'T_ACC', odia_word: 'ତ୍ୱରଣ', en_word: 'Acceleration', default_mastery: 0.40 },
  { term_id: 'T_REST', odia_word: 'ସ୍ଥିରାବସ୍ଥା', en_word: 'Rest', default_mastery: 0.65 },
];

// ---------------------------------------------------------------------------
// 3. PURE AGGREGATION FUNCTION: computeStudentProgress
// ---------------------------------------------------------------------------

export function computeStudentProgress(
  profileId: string,
  events: Array<PadhaiEvent | StoredEvent> = [],
  currentState?: ProgressEngineState
): StudentProgressSnapshot {
  // Filter events strictly for profile if profileId is present
  const userEvents = events
    .filter((e) => !profileId || !e.profile_id || e.profile_id === profileId)
    .slice()
    .sort((a, b) => a.seq - b.seq);

  // 1. Calculate episodes completed
  const completedEpSet = new Set<string>();
  let completionActionCount = 0;
  for (const ev of userEvents) {
    if (ev.action === 'COMPLETION' || ev.action === 'EPISODE_DONE') {
      completionActionCount += 1;
      if (ev.episode_id) completedEpSet.add(ev.episode_id);
    } else if (ev.node === 'ACT' && ev.action === 'REMEDIATION_ASSIGNED' && ev.episode_id) {
      completedEpSet.add(ev.episode_id);
    }
  }
  const episodesCompleted = Math.max(completedEpSet.size, completionActionCount);

  // 2. Track Concept Mastery Trajectories from events
  const concepts: ConceptProgressItem[] = DEFAULT_CONCEPTS.map((c) => {
    const isCurrentConcept = currentState?.concept_id ? currentState.concept_id === c.concept_id : c.concept_id === 'distance_vs_displacement';
    const baseMastery = isCurrentConcept && typeof currentState?.concept_mastery === 'number'
      ? currentState.concept_mastery
      : c.initial_mastery;

    const history: number[] = [baseMastery];
    let attempts = 0;

    for (const evt of userEvents) {
      const isConceptEvent =
        evt.action === 'CONCEPT_UPDATE' ||
        evt.output?.concept_id === c.concept_id ||
        (evt.node === 'MASTERY' && evt.action === 'CONCEPT_UPDATE') ||
        (evt.node === 'OBSERVE' && evt.action === 'MCQ_ANSWER' && (evt.output?.concept_id === c.concept_id || !evt.output?.concept_id)) ||
        (evt.node === 'OBSERVE' && evt.action === 'PROBE_SET_RESULT' && c.concept_id === 'distance_vs_displacement');

      if (!isConceptEvent) continue;

      const masteryVal =
        typeof evt.mastery_after === 'number' && Number.isFinite(evt.mastery_after)
          ? evt.mastery_after
          : typeof evt.output?.after === 'number' && Number.isFinite(evt.output.after as number)
          ? (evt.output.after as number)
          : null;

      if (masteryVal !== null) {
        attempts += 1;
        // Anchor initial value if provided in event
        if (history.length === 1 && typeof evt.mastery_before === 'number' && Math.abs(history[0] - evt.mastery_before) > 1e-4) {
          history[0] = evt.mastery_before;
        }
        // Avoid duplicate adjacent values
        if (Math.abs(history[history.length - 1] - masteryVal) > 1e-4) {
          history.push(masteryVal);
        }
      }
    }

    const currentMastery = history[history.length - 1];
    let status: 'MASTERED' | 'GROWING' | 'UNLOCKED';
    if (currentMastery >= 0.70) {
      status = 'MASTERED';
    } else if (history.length > 1 || attempts > 0 || Math.abs(currentMastery - c.initial_mastery) > 1e-4) {
      status = 'GROWING';
    } else {
      status = 'UNLOCKED';
    }

    return {
      concept_id: c.concept_id,
      title_or: c.title_or,
      title_en: c.title_en,
      chunk_id: c.chunk_id,
      current_mastery: currentMastery,
      history,
      attempts,
      status,
    };
  });

  // 3. Track Odia Science Word Bank (Terms)
  const terms: TermProgressItem[] = DEFAULT_TERMS.map((t) => {
    const baseMastery =
      currentState?.term_masteries && typeof currentState.term_masteries[t.term_id] === 'number'
        ? currentState.term_masteries[t.term_id]
        : t.default_mastery;

    const history: number[] = [baseMastery];

    for (const evt of userEvents) {
      const isTermEvent =
        evt.action === 'TERM_UPDATE' ||
        evt.output?.term_id === t.term_id ||
        (evt.node === 'MASTERY' && (evt.action === 'TERM_UPDATE' || evt.action.includes('TERM')));

      if (!isTermEvent) continue;

      const masteryVal =
        typeof evt.mastery_after === 'number' && Number.isFinite(evt.mastery_after)
          ? evt.mastery_after
          : typeof evt.output?.after === 'number' && Number.isFinite(evt.output.after as number)
          ? (evt.output.after as number)
          : null;

      if (masteryVal !== null) {
        if (history.length === 1 && typeof evt.mastery_before === 'number' && Math.abs(history[0] - evt.mastery_before) > 1e-4) {
          history[0] = evt.mastery_before;
        }
        if (Math.abs(history[history.length - 1] - masteryVal) > 1e-4) {
          history.push(masteryVal);
        }
      }
    }

    const currentMastery = history[history.length - 1];
    let status: 'MASTERED' | 'GROWING' | 'NEW';
    if (currentMastery >= 0.70) {
      status = 'MASTERED';
    } else if (history.length > 1 || Math.abs(currentMastery - t.default_mastery) > 1e-4) {
      status = 'GROWING';
    } else {
      status = 'NEW';
    }

    return {
      term_id: t.term_id,
      odia_word: t.odia_word,
      en_word: t.en_word,
      current_mastery: currentMastery,
      history,
      status,
    };
  });

  // 4. Modality Strengths (P, A, T)
  const pCount = { passed: 0, total: 0 };
  const aCount = { passed: 0, total: 0 };
  const tCount = { passed: 0, total: 0 };

  for (const evt of userEvents) {
    if (evt.action === 'PROBE_SET_RESULT') {
      const out = evt.output as Record<string, unknown> | undefined;
      if (out) {
        if (out.P === 1) {
          pCount.passed += 1;
          pCount.total += 1;
        } else if (out.P === 0) {
          pCount.total += 1;
        }

        if (out.A === 1) {
          aCount.passed += 1;
          aCount.total += 1;
        } else if (out.A === 0) {
          aCount.total += 1;
        }

        if (out.T === 1) {
          tCount.passed += 1;
          tCount.total += 1;
        } else if (out.T === 0) {
          tCount.total += 1;
        }
      }
    } else if (evt.node === 'OBSERVE' && evt.action === 'OBSERVE_PROBE_ITEM') {
      const out = evt.output as Record<string, unknown> | undefined;
      const mod = out?.modality;
      const isPassed = out?.correct === true || out?.passed === true || out?.bit === 1;
      if (mod === 'P') {
        if (isPassed) pCount.passed += 1;
        pCount.total += 1;
      } else if (mod === 'A') {
        if (isPassed) aCount.passed += 1;
        aCount.total += 1;
      } else if (mod === 'T') {
        if (isPassed) tCount.passed += 1;
        tCount.total += 1;
      }
    }
  }

  const modalities: ModalityStrength[] = [
    {
      modality: 'P',
      label_or: '📷 ଚିତ୍ର (Picture P)',
      label_en: 'Visual & Picture',
      passed: pCount.passed,
      total: pCount.total,
      rate_pct: pCount.total > 0 ? Math.round((pCount.passed / pCount.total) * 100) : 0,
    },
    {
      modality: 'A',
      label_or: '🔊 ଅଡିଓ (Audio A)',
      label_en: 'Spoken Audio',
      passed: aCount.passed,
      total: aCount.total,
      rate_pct: aCount.total > 0 ? Math.round((aCount.passed / aCount.total) * 100) : 0,
    },
    {
      modality: 'T',
      label_or: '📝 ପାଠ୍ୟ (Odia Script T)',
      label_en: 'Text & Reading',
      passed: tCount.passed,
      total: tCount.total,
      rate_pct: tCount.total > 0 ? Math.round((tCount.passed / tCount.total) * 100) : 0,
    },
  ];

  // 5. Autonomous "What to Study Next" Queue
  // Priority 1: If any practiced term has mastery < 0.55
  const practicedTerms = terms.filter(
    (t) => t.history.length > 1 || t.status === 'GROWING' || t.status === 'MASTERED'
  );
  const lowPracticedTerm = practicedTerms.find((t) => t.current_mastery < 0.55);

  let nextRecommendation: NextStudyRecommendation;

  if (lowPracticedTerm) {
    nextRecommendation = {
      type: 'TERM_FOLLOW_UP',
      target_id: lowPracticedTerm.term_id,
      title_or: `୧୫-ସେକେଣ୍ଡ ଓଡ଼ିଆ ଶବ୍ଦ ଅଭ୍ୟାସ: ${lowPracticedTerm.odia_word}`,
      title_en: `15-Second Word Practice: ${lowPracticedTerm.en_word}`,
      reason_or: `${lowPracticedTerm.odia_word} (${lowPracticedTerm.en_word}) ଶବ୍ଦଟିକୁ ସ୍ପଷ୍ଟ ଭାବରେ ବୁଝିବା ପାଇଁ ଏକ ଦ୍ରୁତ ଅଭ୍ୟାସ।`,
      reason_en: `Build strong mastery for ${lowPracticedTerm.en_word} (${lowPracticedTerm.odia_word}) with quick practice.`,
    };
  } else if (
    currentState?.queued_revisions &&
    currentState.queued_revisions.length > 0 &&
    currentState.queued_revisions.includes('EXP-MOTION-RAMP')
  ) {
    nextRecommendation = {
      type: 'SENSOR_LAB',
      target_id: 'EXP-MOTION-RAMP',
      title_or: 'ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍: ର‌୍ୟାମ୍ପ ଓ ଗତି ପରୀକ୍ଷଣ',
      title_en: 'Pocket Jugaad Lab: Ramp & Motion Trial',
      reason_or: 'ମୋବାଇଲ୍ ସେନ୍ସର୍ ବ୍ୟବହାର କରି ଗତି ଏବଂ ତ୍ୱରଣର ପ୍ରତ୍ୟକ୍ଷ ଅନୁଭୂତି ହାସଲ କରନ୍ତୁ।',
      reason_en: 'Explore real physics and acceleration hands-on using phone sensors.',
    };
  } else if (
    (currentState?.queued_revisions && currentState.queued_revisions.length > 0) ||
    concepts[0].current_mastery < 0.60
  ) {
    const targetConcept = concepts[0];
    nextRecommendation = {
      type: 'CONCEPT_REVISION',
      target_id: currentState?.queued_revisions?.[0] || targetConcept.concept_id,
      title_or: `ଧାରଣା ଅଭ୍ୟାସ: ${targetConcept.title_or}`,
      title_en: `Foundational Concept Practice: ${targetConcept.title_en}`,
      reason_or: 'ମଜବୁତ୍ ମୂଳଦୁଆ ଗଠନ ପାଇଁ ଏହି ବିଷୟର ଅଭ୍ୟାସ ଜାରି ରଖନ୍ତୁ।',
      reason_en: 'Strengthen your understanding with foundational concept practice.',
    };
  } else {
    // Priority 3: Advance to next concept
    const nextConcept = concepts[1] || DEFAULT_CONCEPTS[1];
    nextRecommendation = {
      type: 'NEXT_CONCEPT',
      target_id: nextConcept.concept_id,
      title_or: `ପରବର୍ତ୍ତୀ ବିଷୟ: ${nextConcept.title_or}`,
      title_en: `Advance to Next Concept: ${nextConcept.title_en}`,
      reason_or: 'ଆପଣ ଏହି ବିଷୟରେ ଦକ୍ଷତା ହାସଲ କରିଛନ୍ତି! ପରବର୍ତ୍ତୀ ଅଧ୍ୟାୟ ଆରମ୍ଭ କରନ୍ତୁ।',
      reason_en: 'Great mastery achieved! Ready to advance to the next learning milestone.',
    };
  }

  // 6. Overall Percentages
  const overallConceptPct = Math.round(concepts[0].current_mastery * 100);
  const termSum = terms.reduce((acc, t) => acc + t.current_mastery, 0);
  const overallTermPct = terms.length > 0 ? Math.round((termSum / terms.length) * 100) : 40;

  // 7. Verify replay integrity
  const replayResult = replayMasteryFromEvents(
    userEvents,
    currentState?.concept_mastery ?? 0.42,
    currentState?.term_masteries?.['T_DISP'] ?? 0.40
  );

  return {
    profile_id: profileId,
    total_events: userEvents.length,
    episodes_completed: episodesCompleted,
    overall_concept_pct: overallConceptPct,
    overall_term_pct: overallTermPct,
    concepts,
    terms,
    modalities,
    next_recommendation: nextRecommendation,
    replay_verified: replayResult.verified,
    replay_max_drift: replayResult.maxDrift,
  };
}

// ---------------------------------------------------------------------------
// 4. FR-30 MASTERY REPLAY VERIFIER: replayMasteryFromEvents
// ---------------------------------------------------------------------------

export function replayMasteryFromEvents(
  events: Array<PadhaiEvent | StoredEvent> = [],
  initialConcept: number = 0.42,
  initialTerm: number = 0.40
): ReplayVerificationResult {
  const sorted = events.slice().sort((a, b) => a.seq - b.seq);
  let replayedConceptMastery = initialConcept;
  let replayedTermMastery = initialTerm;
  let maxDrift = 0;
  const steps: ReplayStep[] = [];

  for (const evt of sorted) {
    const storedMastery =
      typeof evt.mastery_after === 'number' && Number.isFinite(evt.mastery_after)
        ? evt.mastery_after
        : typeof evt.output?.after === 'number' && Number.isFinite(evt.output.after as number)
        ? (evt.output.after as number)
        : null;

    if (storedMastery === null) continue;

    const isTerm =
      evt.action === 'TERM_UPDATE' ||
      evt.output?.term_id !== undefined ||
      (evt.node === 'MASTERY' && evt.action.includes('TERM'));

    if (isTerm) {
      if (Math.abs(storedMastery - replayedTermMastery) < 1e-4) {
        steps.push({
          seq: evt.seq,
          kind: 'term',
          expected: storedMastery,
          replayed: replayedTermMastery,
          match: true,
        });
      } else {
        const candCorrect = updateTermMastery(replayedTermMastery, true);
        const candWrong = updateTermMastery(replayedTermMastery, false);
        const chosen =
          Math.abs(candCorrect - storedMastery) < Math.abs(candWrong - storedMastery)
            ? candCorrect
            : candWrong;
        const drift = Math.abs(chosen - storedMastery);
        if (drift > maxDrift) maxDrift = drift;
        const match = drift <= 1e-4;
        replayedTermMastery = chosen;
        steps.push({
          seq: evt.seq,
          kind: 'term',
          expected: storedMastery,
          replayed: chosen,
          match,
        });
      }
    } else {
      // Concept update
      if (Math.abs(storedMastery - replayedConceptMastery) < 1e-4) {
        steps.push({
          seq: evt.seq,
          kind: 'concept',
          expected: storedMastery,
          replayed: replayedConceptMastery,
          match: true,
        });
      } else {
        const candCorrect = updateConceptMastery(replayedConceptMastery, true);
        const candWrong = updateConceptMastery(replayedConceptMastery, false);
        const chosen =
          Math.abs(candCorrect - storedMastery) < Math.abs(candWrong - storedMastery)
            ? candCorrect
            : candWrong;
        const drift = Math.abs(chosen - storedMastery);
        if (drift > maxDrift) maxDrift = drift;
        const match = drift <= 1e-4;
        replayedConceptMastery = chosen;
        steps.push({
          seq: evt.seq,
          kind: 'concept',
          expected: storedMastery,
          replayed: chosen,
          match,
        });
      }
    }
  }

  return {
    verified: maxDrift <= 1e-4,
    maxDrift,
    replayedConceptMastery,
    replayedTermMastery,
    steps,
  };
}
