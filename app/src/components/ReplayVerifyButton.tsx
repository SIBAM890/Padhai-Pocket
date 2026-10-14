import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { StoredEvent } from '../types/events';
import { nextAction, createInitialState, type EngineState, type EngineInput } from '../engine';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export interface ReplayVerifyButtonProps {
  profileId: string;
  episodeId: string;
  events: StoredEvent[];
}

export interface ReplayComparisonRow {
  step: number;
  action: string;
  inputDescription: string;
  expectedNode: string;
  actualNode: string;
  expectedMastery: number;
  replayedMastery: number;
  match: boolean;
  divergenceReason?: string;
}

export interface ReplayVerificationResult {
  hasData: boolean;
  totalSteps: number;
  allMatch: boolean;
  divergenceStep: number | null;
  rows: ReplayComparisonRow[];
}

/**
 * Deterministic string hash to uint32 seed for ctx.seed.
 */
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Pure replay evaluator. Reconstructs inputs from logged outputs and steps nextAction.
 */
export function runEpisodeReplay(
  profileId: string,
  episodeId: string,
  events: StoredEvent[],
  simulateTamper: boolean = false
): ReplayVerificationResult {
  if (!events || events.length === 0 || !episodeId) {
    return {
      hasData: false,
      totalSteps: 0,
      allMatch: true,
      divergenceStep: null,
      rows: [],
    };
  }

  // Filter for this profile and episode, sort by seq ascending
  const epEvents = events
    .filter((e) => e && e.profile_id === profileId && e.episode_id === episodeId)
    .sort((a, b) => a.seq - b.seq);

  if (epEvents.length === 0) {
    return {
      hasData: false,
      totalSteps: 0,
      allMatch: true,
      divergenceStep: null,
      rows: [],
    };
  }

  // 1. Initial State from the first MASTERY event's mastery_before (or default 0.42)
  const firstMasteryEvt = epEvents.find((e) => e.node === 'MASTERY' && typeof e.mastery_before === 'number');
  const initialConceptMastery = firstMasteryEvt?.mastery_before ?? 0.42;

  let state: EngineState = createInitialState(
    profileId,
    epEvents[0]?.session_id || 'sess_replay',
    'distance_vs_displacement',
    initialConceptMastery,
    1,
    'OFFLINE'
  );

  const seed = hashStringToSeed(episodeId);
  const rows: ReplayComparisonRow[] = [];
  let allMatch = true;
  let divergenceStep: number | null = null;
  let stepIndex = 1;

  for (let i = 0; i < epEvents.length; i++) {
    const loggedEvt = epEvents[i];

    // Identify reconstructible OBSERVE actions
    let reconstructedInput: EngineInput | null = null;
    let inputDesc = '';

    if (loggedEvt.node === 'OBSERVE' && loggedEvt.action === 'MCQ_ANSWER') {
      const isCorrect = Boolean(loggedEvt.output?.correct);
      reconstructedInput = {
        type: 'OBSERVE_MCQ',
        correct: isCorrect,
        misconception_tag: (loggedEvt.output?.misconception as string) ?? null,
      };
      inputDesc = `MCQ Answer: ${isCorrect ? 'Correct' : 'Incorrect'}`;
    } else if (loggedEvt.node === 'OBSERVE' && loggedEvt.action === 'PROBE_SET_RESULT') {
      // Replay all three probe item observations
      const P = loggedEvt.output?.P === 1;
      const A = loggedEvt.output?.A === 1;
      const T = loggedEvt.output?.T === 1;
      const audioAvailable = loggedEvt.output?.A !== null;

      const probeSteps: Array<{ modality: 'P' | 'A' | 'T'; correct: boolean; audioAvailable?: boolean }> = [
        { modality: 'P', correct: P },
        { modality: 'A', correct: A, audioAvailable },
        { modality: 'T', correct: T },
      ];

      for (const pStep of probeSteps) {
        const stepCtx = {
          now: loggedEvt.ts ? Number(new Date(loggedEvt.ts)) : 1792059821234,
          seed,
          device_id: loggedEvt.device_id || 'dev_demo_01',
        };
        const engineOut = nextAction(
          state,
          {
            type: 'OBSERVE_PROBE_ITEM',
            modality: pStep.modality,
            correct: pStep.correct,
            audio_available: pStep.audioAvailable,
          },
          stepCtx
        );
        state = engineOut.state;
      }

      // Check against this PROBE_SET_RESULT event
      const expectedMastery = loggedEvt.mastery_after ?? state.concept_mastery;
      const replayedMastery = state.concept_mastery;
      const masteryDiff = Math.abs(replayedMastery - expectedMastery);
      const isStepMatch = loggedEvt.node === 'OBSERVE' && masteryDiff < 0.0005;

      rows.push({
        step: stepIndex++,
        action: loggedEvt.action,
        inputDescription: `Probe Set Results: P=${loggedEvt.output?.P}, A=${loggedEvt.output?.A}, T=${loggedEvt.output?.T}`,
        expectedNode: loggedEvt.node,
        actualNode: 'OBSERVE',
        expectedMastery,
        replayedMastery,
        match: isStepMatch,
        divergenceReason: isStepMatch ? undefined : `Mastery divergence: expected ${expectedMastery.toFixed(4)}, got ${replayedMastery.toFixed(4)}`,
      });

      if (!isStepMatch && allMatch) {
        allMatch = false;
        divergenceStep = stepIndex - 1;
      }
      continue;
    } else if (loggedEvt.node === 'OBSERVE' && loggedEvt.action === 'CONFIRM_ITEM_RESULT') {
      const passed = Boolean(loggedEvt.output?.passed);
      reconstructedInput = {
        type: 'OBSERVE_CONFIRM_ITEM',
        correct: passed,
        term_id: (loggedEvt.output?.term_id as string) ?? 'T_DISP',
      };
      inputDesc = `Confirmation Test: ${passed ? 'Passed' : 'Failed'}`;
    }

    if (reconstructedInput) {
      const stepCtx = {
        now: loggedEvt.ts ? Number(new Date(loggedEvt.ts)) : 1792059821234,
        seed,
        device_id: loggedEvt.device_id || 'dev_demo_01',
      };

      const engineOut = nextAction(state, reconstructedInput, stepCtx);
      state = engineOut.state;

      // Simulated tamper: perturb in-memory expectation on second row
      let expectedMastery = loggedEvt.mastery_after ?? state.concept_mastery;
      if (simulateTamper && stepIndex === 1) {
        expectedMastery += 0.01;
      }

      const replayedMastery = state.concept_mastery;
      const masteryDiff = Math.abs(replayedMastery - expectedMastery);
      const isStepMatch = loggedEvt.node === 'OBSERVE' && masteryDiff < 0.0005;

      rows.push({
        step: stepIndex++,
        action: loggedEvt.action,
        inputDescription: inputDesc,
        expectedNode: loggedEvt.node,
        actualNode: 'OBSERVE',
        expectedMastery,
        replayedMastery,
        match: isStepMatch,
        divergenceReason: isStepMatch
          ? undefined
          : `Mastery divergence: expected ${expectedMastery.toFixed(4)}, got ${replayedMastery.toFixed(4)}`,
      });

      if (!isStepMatch && allMatch) {
        allMatch = false;
        divergenceStep = stepIndex - 1;
      }
    }
  }

  return {
    hasData: rows.length > 0,
    totalSteps: rows.length,
    allMatch,
    divergenceStep,
    rows,
  };
}

export function ReplayVerifyButton({
  profileId,
  episodeId,
  events,
}: ReplayVerifyButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [simulateTamper, setSimulateTamper] = useState(false);

  const result = runEpisodeReplay(profileId, episodeId, events, simulateTamper);

  return (
    <>
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.verifyButtonText}>
          Verify Episode (reconstruct & replay)
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Episode Replay Verification</Text>
                <Text style={styles.modalSubtitle}>
                  Episode: {episodeId || 'None'} • Profile: {profileId}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Verdict Banner */}
            {!result.hasData ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No episode data available.</Text>
              </View>
            ) : result.allMatch ? (
              <View style={styles.successBanner}>
                <Text style={styles.bannerIcon}>✓</Text>
                <Text style={styles.successText}>
                  All decisions reproduced from logged evidence.
                </Text>
              </View>
            ) : (
              <View style={styles.divergenceBanner}>
                <Text style={styles.bannerIcon}>⚠️</Text>
                <Text style={styles.divergenceText}>
                  Decision divergence at step {result.divergenceStep}.
                </Text>
              </View>
            )}

            {/* Per-Decision List */}
            {result.hasData && (
              <ScrollView style={styles.rowsList}>
                {result.rows.map((row) => (
                  <View key={row.step} style={styles.rowCard}>
                    <View style={styles.rowHeader}>
                      <Text style={styles.stepBadge}>Step {row.step}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          row.match ? styles.badgeMatch : styles.badgeMismatch,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            row.match ? styles.textMatch : styles.textMismatch,
                          ]}
                        >
                          {row.match ? 'MATCH' : 'MISMATCH'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.actionTitle}>{row.action}</Text>
                    <Text style={styles.inputDetail}>{row.inputDescription}</Text>

                    <View style={styles.masteryComparison}>
                      <Text style={styles.masteryText}>
                        Logged: {row.expectedMastery.toFixed(4)}
                      </Text>
                      <Text style={styles.arrowText}>→</Text>
                      <Text style={styles.masteryText}>
                        Replayed: {row.replayedMastery.toFixed(4)}
                      </Text>
                    </View>

                    {row.divergenceReason && (
                      <Text style={styles.divergenceReasonText}>
                        {row.divergenceReason}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Dev Controls */}
            <View style={styles.devControls}>
              <TouchableOpacity
                style={[
                  styles.tamperButton,
                  simulateTamper && styles.tamperActive,
                ]}
                onPress={() => setSimulateTamper(!simulateTamper)}
              >
                <Text style={styles.tamperButtonText}>
                  {simulateTamper
                    ? 'Simulate Tamper: ON (+0.01 deviation)'
                    : 'Simulate Tamper (dev)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default ReplayVerifyButton;

const styles = StyleSheet.create({
  verifyButton: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    ...shadows.subtle,
  },
  verifyButtonText: {
    color: colors.primary,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.hover,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  successBanner: {
    backgroundColor: colors.secondaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    padding: spacing.md,
    borderRadius: radius.xs,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  divergenceBanner: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: spacing.md,
    borderRadius: radius.xs,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  divergenceText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: colors.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  bannerIcon: {
    fontSize: 18,
  },
  rowsList: {
    marginVertical: spacing.sm,
  },
  rowCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepBadge: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeMatch: {
    backgroundColor: colors.secondaryLight,
  },
  badgeMismatch: {
    backgroundColor: colors.errorLight,
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '800',
  },
  textMatch: {
    color: colors.secondary,
  },
  textMismatch: {
    color: colors.error,
  },
  actionTitle: {
    fontSize: typography.cardHeading.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputDetail: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  masteryComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
  },
  masteryText: {
    fontSize: typography.caption.fontSize,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  arrowText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  divergenceReasonText: {
    fontSize: typography.caption.fontSize,
    color: colors.error,
    marginTop: spacing.xs,
  },
  devControls: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  tamperButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tamperActive: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  tamperButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
