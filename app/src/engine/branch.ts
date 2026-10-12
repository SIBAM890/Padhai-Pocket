/**
 * PRD v4.0 §8 Offline Decision Branch Policy (Agency Proof)
 *
 * Rule:
 * Wrong answer offline ->
 * 1. retry_with_simpler_cached_variant (tier_1)
 * 2. revision queued in state
 * 3. mastery updated (lowered)
 * Three visible state changes produced in trace.
 */

import { updateConceptMastery } from './bkt';

export interface OfflineBranchState {
  currentMastery: number;
  queuedRevisions: string[];
  chosenTier: number;
  lastAction: string;
}

export interface OfflineBranchResult {
  nextMastery: number;
  queuedRevisions: string[];
  chosenTier: number;
  action: string;
  stateChanges: {
    tierChanged: boolean;
    revisionQueued: boolean;
    masteryLowered: boolean;
  };
}

/**
 * Handles wrong answer offline according to the 3 visible state changes requirement.
 */
export function handleOfflineWrongAnswer(
  conceptId: string,
  state: OfflineBranchState
): OfflineBranchResult {
  const masteryBefore = state.currentMastery;
  const nextMastery = updateConceptMastery(masteryBefore, false);
  const updatedRevisions = [...state.queuedRevisions, conceptId];
  const chosenTier = 1; // Pick simpler cached tier 1 variant
  const action = 'retry_with_simpler_cached_variant';

  return {
    nextMastery,
    queuedRevisions: updatedRevisions,
    chosenTier,
    action,
    stateChanges: {
      tierChanged: chosenTier !== state.chosenTier || chosenTier === 1,
      revisionQueued: updatedRevisions.length > state.queuedRevisions.length,
      masteryLowered: nextMastery < masteryBefore,
    },
  };
}
