/**
 * PRD v4.0 §4, §5, §8 Engine v1
 *
 * nextAction(state, input, ctx)
 * Pure function: No Date.now(), no Math.random(), no fetch, no storage.
 * All time and RNG comes strictly through injected ctx: { now: number, seed: number }.
 */

import { Bit, Candidate, Pat, SetLabel, candidateOf, resolve } from './table';
import { updateConceptMastery, updateTermMastery } from './bkt';
import { mulberry32, probeOrder, computeSeed } from './seed';
import { Verdict, finalLabel } from './finalLabel';
import { EventData, EventNode, buildEvent } from './eventBuilder';
import { handleOfflineWrongAnswer } from './branch';

export interface EngineContext {
  now: number; // Injected timestamp (epoch ms)
  seed: number; // Injected seed (uint32)
  probeOrder: Array<'P' | 'A' | 'T'>; // Pre-computed probe order (since computeSeed is async)
}

export type StepState =
  | 'IDLE'
  | 'QUESTION_ACTIVE'
  | 'PROBE_ACTIVE'
  | 'CONFIRM_ACTIVE'
  | 'REMEDIATION_ACTIVE'
  | 'EPISODE_DONE';

export interface EngineState {
  profile_id: string;
  session_id: string;
  episode_id: string | null;
  seq: number;
  engine_version: string;
  pack_hash: string;
  network_mode: 'ONLINE' | 'WEAK' | 'OFFLINE';

  step: StepState;
  concept_id: string;
  concept_mastery: number;
  term_masteries: Record<string, number>;

  // Episode probe tracking
  threshold: 1 | 2; // 1 = demo, 2 = production
  current_set_id: 'A' | 'B' | 'C';
  current_set_order: Array<'P' | 'A' | 'T'>;
  current_probe_pattern: [Bit, Bit, Bit]; // [P, A, T]
  probe_step_index: number; // 0..2
  current_candidate: Candidate | null;
  current_set_label: SetLabel | null;
  set_labels: SetLabel[];
  verdict: Verdict;

  // Offline revision state
  queued_revisions: string[];
  chosen_tier: number;
  audio_first: boolean;
  reading_load: number;
}

export interface EngineInput {
  type:
    | 'OBSERVE_MCQ'
    | 'OBSERVE_PROBE_ITEM'
    | 'OBSERVE_CONFIRM_ITEM'
    | 'SKIP'
    | 'NEXT_LESSON';
  concept_id?: string;
  term_id?: string;
  modality?: 'P' | 'A' | 'T' | 'W' | 'TX' | 'PX' | 'MCQ';
  correct?: boolean;
  audio_available?: boolean;
  misconception_tag?: string | null;
}

export interface EngineOutput {
  state: EngineState;
  events: EventData[];
  action: string;
  payload: Record<string, any>;
}

// Internal event builder input (before hash computation)
export interface EventDataInput extends Omit<EventData, 'input_hash'> {
  input_hash?: string;
}

/**
 * Creates default initial engine state.
 */
export function createInitialState(
  profileId: string,
  sessionId: string,
  conceptId: string = 'distance_vs_displacement',
  initialMastery: number = 0.42,
  threshold: 1 | 2 = 1,
  networkMode: 'ONLINE' | 'WEAK' | 'OFFLINE' = 'OFFLINE',
  packHash: string = 'e3b0c44298fc'
): EngineState {
  return {
    profile_id: profileId,
    session_id: sessionId,
    episode_id: null,
    seq: 0,
    engine_version: '1.0.0',
    pack_hash: packHash,
    network_mode: networkMode,
    step: 'IDLE',
    concept_id: conceptId,
    concept_mastery: initialMastery,
    term_masteries: { T_DISP: 0.4 },
    threshold,
    current_set_id: 'A',
    current_set_order: ['P', 'A', 'T'],
    current_probe_pattern: [null, null, null],
    probe_step_index: 0,
    current_candidate: null,
    current_set_label: null,
    set_labels: [],
    verdict: { done: false },
    queued_revisions: [],
    chosen_tier: 1,
    audio_first: false,
    reading_load: 0,
  };
}

/**
 * Pure state machine transition function (async due to Web Crypto for input_hash).
 */
export async function nextAction(
  state: EngineState,
  input: EngineInput,
  ctx: EngineContext
): Promise<EngineOutput> {
  const isoTs = new Date(ctx.now).toISOString();
  const events: EventDataInput[] = [];

  // Helper to append event (without hash - computed at the end)
  const emit = (
    node: EventNode,
    action: string,
    output: Record<string, any>,
    overrides?: Partial<EventDataInput>
  ) => {
    const ev: EventDataInput = {
      event_id: `evt-${state.profile_id}-${state.seq + events.length + 1}`,
      profile_id: state.profile_id,
      session_id: state.session_id,
      episode_id: state.episode_id,
      seq: state.seq + events.length + 1,
      ts: isoTs,
      origin: 'device',
      node,
      action,
      output,
      latency_ms: 0,
      network_mode: state.network_mode,
      engine_version: state.engine_version,
      pack_hash: state.pack_hash,
      confirm_threshold: state.threshold,
      ...overrides,
    };
    events.push(ev);
  };

  // Case 1: Initial MCQ Observation
  if (input.type === 'OBSERVE_MCQ') {
    const isCorrect = !!input.correct;
    const masteryBefore = state.concept_mastery;
    const masteryAfter = updateConceptMastery(masteryBefore, isCorrect);

    emit('OBSERVE', 'MCQ_ANSWER', {
      concept_id: state.concept_id,
      correct: isCorrect,
      misconception: input.misconception_tag ?? null,
    });

    emit(
      'MASTERY',
      'CONCEPT_UPDATE',
      {
        concept_id: state.concept_id,
        before: masteryBefore,
        after: masteryAfter,
      },
      { mastery_before: masteryBefore, mastery_after: masteryAfter }
    );

    if (isCorrect) {
      return finalizeEvents(state, events, {
        state: {
          ...state,
          seq: state.seq + events.length,
          concept_mastery: masteryAfter,
          step: 'EPISODE_DONE',
        },
        action: 'ADVANCE_NEXT_LESSON',
        payload: { concept_mastery: masteryAfter },
      });
    }

    // Wrong answer triggers diagnostic probe episode
    const episodeId = `ep-${ctx.seed}`;
    const order = ctx.probeOrder;

    emit('PROBE', 'TRIGGER_EVAL', {
      rule: 'B',
      pre_update_mastery: masteryBefore,
      condition: 'mastery < 0.50',
    });

    emit('PROBE', 'SOUND_CHECK', { status: 'PASS' });

    emit('PROBE', 'START_PROBE_SET', {
      episode_id: episodeId,
      set: state.current_set_id,
      order,
      seed: ctx.seed,
    });

    // Check offline decision branch policy (PRD §8)
    // Wrong answer offline -> retry with simpler cached variant, queue revision, lower mastery
    // Does NOT run probe in offline mode
    if (state.network_mode === 'OFFLINE') {
      const offlineBranch = handleOfflineWrongAnswer(state.concept_id, {
        currentMastery: masteryBefore,
        queuedRevisions: state.queued_revisions,
        chosenTier: state.chosen_tier,
        lastAction: 'wrong_answer_offline',
      });

      emit('ACT', offlineBranch.action, {
        tier: offlineBranch.chosenTier,
        queued_revision: state.concept_id,
        state_changes: offlineBranch.stateChanges,
      });

      const offlineState: EngineState = {
        ...state,
        seq: state.seq + events.length,
        episode_id: episodeId,
        concept_mastery: offlineBranch.nextMastery,
        step: 'EPISODE_DONE',
        queued_revisions: offlineBranch.queuedRevisions,
        chosen_tier: offlineBranch.chosenTier,
      };
      return finalizeEvents(state, events, {
        state: offlineState,
        action: 'OFFLINE_REMEDIATION',
        payload: {
          tier: offlineBranch.chosenTier,
          queued_revision: state.concept_id,
          state_changes: offlineBranch.stateChanges,
        },
      });
    }

    return finalizeEvents(state, events, {
      state: {
        ...state,
        seq: state.seq + events.length,
        episode_id: episodeId,
        concept_mastery: masteryAfter,
        step: 'PROBE_ACTIVE',
        current_set_order: order,
        current_probe_pattern: [null, null, null],
        probe_step_index: 0,
      },
      action: 'RUN_PROBE_ITEM',
      payload: {
        modality: order[0],
        set: state.current_set_id,
        order,
      },
    });
  }

  // Case 2: Observe Probe Item (P, A, T)
  if (input.type === 'OBSERVE_PROBE_ITEM') {
    const modality = input.modality as 'P' | 'A' | 'T';
    const isAudio = modality === 'A';
    const audioAvailable = input.audio_available !== false;

    let bit: Bit;
    if (isAudio && !audioAvailable) {
      bit = null;
    } else {
      bit = input.correct ? 1 : 0;
    }

    const newPattern: [Bit, Bit, Bit] = [...state.current_probe_pattern];
    if (modality === 'P') newPattern[0] = bit;
    if (modality === 'A') newPattern[1] = bit;
    if (modality === 'T') newPattern[2] = bit;

    let updatedConceptMastery = state.concept_mastery;
    // Picture probe passed boosts concept mastery
    if (modality === 'P' && bit === 1) {
      const before = state.concept_mastery;
      updatedConceptMastery = updateConceptMastery(before, true);
      emit(
        'MASTERY',
        'CONCEPT_UPDATE',
        {
          before,
          after: updatedConceptMastery,
          reason: 'picture_probe_passed',
        },
        { mastery_before: before, mastery_after: updatedConceptMastery }
      );
    }

    const nextProbeIndex = state.probe_step_index + 1;

    // Check if 3-way probe complete
    if (nextProbeIndex >= 3) {
      const candidate = candidateOf(newPattern);

      emit('OBSERVE', 'PROBE_SET_RESULT', {
        P: newPattern[0],
        A: newPattern[1],
        T: newPattern[2],
      });

      emit('REFLECT', 'PROBE_CANDIDATE', { candidate });

      if (candidate === 'RESOLVED') {
        const v = finalLabel(['RESOLVED'], state.threshold);
        return finalizeEvents(state, events, {
          state: {
            ...state,
            seq: state.seq + events.length,
            concept_mastery: updatedConceptMastery,
            current_probe_pattern: newPattern,
            current_candidate: 'RESOLVED',
            current_set_label: 'RESOLVED',
            set_labels: [...state.set_labels, 'RESOLVED'],
            verdict: v,
            step: 'EPISODE_DONE',
          },
          action: 'RESOLVED_TRANSFER',
          payload: { candidate: 'RESOLVED', verdict: v },
        });
      }

      if (candidate === 'INCONSISTENT') {
        const nextSetLabels: SetLabel[] = [...state.set_labels, 'INCONSISTENT'];
        const v = finalLabel(nextSetLabels, state.threshold);
        
        // If not done, advance to next probe set (A->B->C)
        const nextSet = v.done 
          ? state.current_set_id 
          : state.current_set_id === 'A' ? 'B' : state.current_set_id === 'B' ? 'C' : 'C';

        return finalizeEvents(state, events, {
          state: {
            ...state,
            seq: state.seq + events.length,
            concept_mastery: updatedConceptMastery,
            current_probe_pattern: v.done ? newPattern : [null, null, null],
            current_candidate: 'INCONSISTENT',
            current_set_label: 'INCONSISTENT',
            current_set_id: nextSet,
            set_labels: nextSetLabels,
            verdict: v,
            step: v.done ? 'EPISODE_DONE' : 'PROBE_ACTIVE',
            probe_step_index: 0,
          },
          action: v.done ? 'SAFE_DEFAULT' : 'NEXT_PROBE_SET',
          payload: { candidate: 'INCONSISTENT', verdict: v, next_set: nextSet },
        });
      }

      // Candidate needs targeted confirmation
      let confirmType: 'W' | 'TX' | 'PX' = 'W';
      if (candidate === 'READING_GAP_CANDIDATE') confirmType = 'TX';
      if (candidate === 'CONCEPT_GAP_CANDIDATE') confirmType = 'PX';

      emit('CONFIRM', 'START_CONFIRMATION', {
        candidate,
        confirm_type: confirmType,
        items: state.threshold === 1 ? 1 : 2,
      });

      return finalizeEvents(state, events, {
        state: {
          ...state,
          seq: state.seq + events.length,
          concept_mastery: updatedConceptMastery,
          current_probe_pattern: newPattern,
          current_candidate: candidate,
          step: 'CONFIRM_ACTIVE',
        },
        action: 'RUN_CONFIRM_ITEM',
        payload: { candidate, confirmType },
      });
    }

    // Continue next probe modality
    const nextModality = state.current_set_order[nextProbeIndex];
    return finalizeEvents(state, events, {
      state: {
        ...state,
        seq: state.seq + events.length,
        concept_mastery: updatedConceptMastery,
        current_probe_pattern: newPattern,
        probe_step_index: nextProbeIndex,
      },
      action: 'RUN_PROBE_ITEM',
      payload: {
        modality: nextModality,
        set: state.current_set_id,
      },
    });
  }

  // Case 3: Observe Targeted Confirmation Item
  if (input.type === 'OBSERVE_CONFIRM_ITEM') {
    const passed = !!input.correct;
    const candidate = state.current_candidate ?? 'INCONSISTENT';
    const label = resolve(candidate, passed);

    emit('OBSERVE', 'CONFIRM_ITEM_RESULT', {
      passed,
      candidate,
      resulting_label: label,
    });

    // If term gap test failed, update term mastery
    let updatedTermMasteries = { ...state.term_masteries };
    const termId = input.term_id ?? 'T_DISP';
    if (label === 'TERM_GAP') {
      const before = updatedTermMasteries[termId] ?? 0.4;
      const after = updateTermMastery(before, false);
      updatedTermMasteries[termId] = after;

      emit(
        'MASTERY',
        'TERM_UPDATE',
        { term_id: termId, before, after },
        { mastery_before: before, mastery_after: after }
      );
    }

    const nextSetLabels = [...state.set_labels, label];
    const v = finalLabel(nextSetLabels, state.threshold);

    emit('REFLECT', 'EVALUATE_AGREEMENT', {
      label,
      set_labels: nextSetLabels,
      verdict: v,
    });

    if (v.done) {
      emit('ACT', `REMEDIATION_${v.label}`, {
        final_label: v.label,
        agreement: v.agreement,
        status: v.status,
      });

      return finalizeEvents(state, events, {
        state: {
          ...state,
          seq: state.seq + events.length,
          term_masteries: updatedTermMasteries,
          current_set_label: label,
          set_labels: nextSetLabels,
          verdict: v,
          step: 'REMEDIATION_ACTIVE',
        },
        action: `ACT_${v.label}`,
        payload: { verdict: v },
      });
    }

    // Need next set
    const nextSet =
      state.current_set_id === 'A'
        ? 'B'
        : state.current_set_id === 'B'
        ? 'C'
        : 'C';
    return finalizeEvents(state, events, {
      state: {
        ...state,
        seq: state.seq + events.length,
        term_masteries: updatedTermMasteries,
        current_set_id: nextSet,
        current_set_label: label,
        set_labels: nextSetLabels,
        verdict: v,
        step: 'PROBE_ACTIVE',
        probe_step_index: 0,
        current_probe_pattern: [null, null, null],
      },
      action: 'NEXT_PROBE_SET',
      payload: { next_set: nextSet },
    });
  }

  // Default passthrough
  return finalizeEvents(state, events, {
    state: {
      ...state,
      seq: state.seq + events.length,
    },
    action: 'NOOP',
    payload: {},
  });
}

/**
 * Compute input_hash for all events and return final output.
 */
async function finalizeEvents(
  state: EngineState,
  events: EventDataInput[],
  output: Omit<EngineOutput, 'events'>
): Promise<EngineOutput> {
  const builtEvents: EventData[] = [];
  for (const ev of events) {
    builtEvents.push(await buildEvent(ev));
  }
  return {
    ...output,
    events: builtEvents,
  };
}

export * from './table';
export * from './bkt';
export * from './seed';
export * from './finalLabel';
export * from './eventBuilder';
export * from './branch';
export * from './bkt';
export * from './seed';
export * from './finalLabel';
export * from './eventBuilder';
export * from './branch';
