import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/theme';
import type { PadhaiEvent, StoredEvent } from '../types/events';
import {
  computeStudentProgress,
  replayMasteryFromEvents,
  type EngineState,
  type NextStudyRecommendation,
  type ReplayVerificationResult,
} from '../engine';

export interface StudentProgressModalProps {
  visible: boolean;
  onClose: () => void;
  profileId: string;
  events: Array<PadhaiEvent | StoredEvent>;
  engineState?: EngineState;
  onStartRecommendation?: (rec: NextStudyRecommendation) => void;
}

export function StudentProgressModal({
  visible,
  onClose,
  profileId,
  events,
  engineState,
  onStartRecommendation,
}: StudentProgressModalProps) {
  const [replayRefreshCounter, setReplayRefreshCounter] = useState(0);

  // Dynamically compute progress snapshot from local SQLite events
  const snapshot = useMemo(() => {
    return computeStudentProgress(profileId, events, engineState);
  }, [profileId, events, engineState]);

  // Live replay verification from raw SQLite event stream
  const replayResult: ReplayVerificationResult = useMemo(() => {
    return replayMasteryFromEvents(
      events,
      engineState?.concept_mastery ?? 0.42,
      engineState?.term_masteries?.['T_DISP'] ?? 0.40
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, engineState, replayRefreshCounter]);

  const handleStartRecommendation = () => {
    if (onStartRecommendation && snapshot.next_recommendation) {
      onStartRecommendation(snapshot.next_recommendation);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>📊 ମୋ ପ୍ରଗତି (My Progress Tracker)</Text>
            <Text style={styles.headerSubtitle}>
              Event-Sourced Mastery & Learning Path · FR-30 Compliant
            </Text>
          </View>
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close Progress Tracker"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ======================================================== */}
          {/* SECTION A: Overall Growth & Autonomous Next Step Card    */}
          {/* ======================================================== */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>🌱 ସାମଗ୍ରିକ ଅଗ୍ରଗତି (Overall Growth)</Text>
            <Text style={styles.sectionHeaderSub}>
              Based on real-time Bayesian Knowledge Tracing (BKT) and local event log
            </Text>

            {/* 3 Metric Summary Badges */}
            <View style={styles.statsRow}>
              <View style={[styles.statTile, { borderColor: colors.primary }]}>
                <Text style={styles.statLabel}>ଧାରଣା ଦକ୍ଷତା</Text>
                <Text style={styles.statSubLabel}>Concept Mastery</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {snapshot.overall_concept_pct}%
                </Text>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      { width: `${snapshot.overall_concept_pct}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.statTile, { borderColor: colors.secondary }]}>
                <Text style={styles.statLabel}>ଓଡ଼ିଆ ଶବ୍ଦକୋଷ</Text>
                <Text style={styles.statSubLabel}>Vocabulary</Text>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  {snapshot.overall_term_pct}%
                </Text>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      { width: `${snapshot.overall_term_pct}%`, backgroundColor: colors.secondary },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.statTile, { borderColor: '#10B981' }]}>
                <Text style={styles.statLabel}>ଅଧ୍ୟାୟ / ପଦକ୍ଷେପ</Text>
                <Text style={styles.statSubLabel}>Episodes & Events</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {snapshot.episodes_completed}
                </Text>
                <Text style={styles.statMetaText}>
                  {snapshot.total_events} events logged
                </Text>
              </View>
            </View>

            {/* Autonomous "What to Study Next" Card */}
            <View style={styles.recommendationCard}>
              <View style={styles.recBadgeRow}>
                <View style={styles.recPill}>
                  <Text style={styles.recPillText}>🤖 ସ୍ୱୟଂଚାଳିତ ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ</Text>
                </View>
                <Text style={styles.recPillSub}>Autonomous Recommendation</Text>
              </View>

              <Text style={styles.recTitleOdia}>
                {snapshot.next_recommendation.title_or}
              </Text>
              <Text style={styles.recTitleEn}>
                {snapshot.next_recommendation.title_en}
              </Text>

              <View style={styles.recReasonBox}>
                <Text style={styles.recReasonOdia}>
                  💡 {snapshot.next_recommendation.reason_or}
                </Text>
                <Text style={styles.recReasonEn}>
                  {snapshot.next_recommendation.reason_en}
                </Text>
              </View>

              <Pressable
                style={styles.startRecBtn}
                onPress={handleStartRecommendation}
                accessibilityRole="button"
                accessibilityLabel="Start Recommended Step Now"
              >
                <Text style={styles.startRecBtnText}>
                  ▶️ ଏବେ ଆରମ୍ଭ କର (Start This Step Now)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ======================================================== */}
          {/* SECTION B: Concept Mastery Trajectory                     */}
          {/* ======================================================== */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>
              🎯 ଧାରଣା ଦକ୍ଷତା ମାର୍ଗ (Concept Mastery Trajectory)
            </Text>
            <Text style={styles.sectionHeaderSub}>
              BSE Odisha Class 9 Physics · Mathematical BKT trajectory updated per event
            </Text>

            {snapshot.concepts.map((concept) => {
              const pct = Math.round(concept.current_mastery * 100);
              const statusColor =
                concept.status === 'MASTERED'
                  ? '#10B981'
                  : concept.status === 'GROWING'
                  ? colors.primary
                  : colors.textSecondary;

              const statusBadgeText =
                concept.status === 'MASTERED'
                  ? '🌟 ଶିଖିଗଲ (Mastered)'
                  : concept.status === 'GROWING'
                  ? '🌱 ଅଭ୍ୟାସ ଚାଲିଛି (Growing)'
                  : '🔓 ଅନ୍‌ଲକ୍ ହୋଇଛି (Unlocked)';

              return (
                <View key={concept.concept_id} style={styles.conceptBlock}>
                  <View style={styles.conceptHeaderRow}>
                    <View style={styles.conceptTitleContainer}>
                      <Text style={styles.conceptTitleOdia}>{concept.title_or}</Text>
                      <Text style={styles.conceptTitleEn}>{concept.title_en}</Text>
                    </View>
                    <View style={styles.conceptPctBadge}>
                      <Text style={[styles.conceptPctText, { color: statusColor }]}>
                        {pct}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${pct}%`, backgroundColor: statusColor },
                      ]}
                    />
                  </View>

                  {/* Status & Trajectory History Chips */}
                  <View style={styles.trajectoryChipsRow}>
                    <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {statusBadgeText}
                      </Text>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.historyChipsScroll}
                    >
                      {concept.history.map((val, idx) => (
                        <View key={idx} style={styles.historyChip}>
                          <Text style={styles.historyChipStep}>#{idx}</Text>
                          <Text style={styles.historyChipVal}>
                            {Math.round(val * 100)}%
                          </Text>
                          {idx < concept.history.length - 1 && (
                            <Text style={styles.historyChipArrow}>➔</Text>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ======================================================== */}
          {/* SECTION C: Odia Word Bank & 3-Modality Strengths         */}
          {/* ======================================================== */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>
              📚 ଓଡ଼ିଆ ବିଜ୍ଞାନ ଶବ୍ଦକୋଷ (Odia Science Vocabulary Bank)
            </Text>
            <Text style={styles.sectionHeaderSub}>
              Textbook terminology mastery with independent BKT tracking
            </Text>

            <View style={styles.termGrid}>
              {snapshot.terms.map((term) => {
                const pct = Math.round(term.current_mastery * 100);
                const isMastered = term.status === 'MASTERED';
                const isGrowing = term.status === 'GROWING';
                const badgeColor = isMastered
                  ? '#10B981'
                  : isGrowing
                  ? colors.secondary
                  : colors.textSecondary;
                const badgeLabel = isMastered
                  ? '🌟 ଶିଖିଗଲ'
                  : isGrowing
                  ? '🌱 ଅଭ୍ୟାସ'
                  : '✨ ନୂତନ';

                return (
                  <View key={term.term_id} style={styles.termCard}>
                    <View style={styles.termCardTop}>
                      <Text style={styles.termIdText}>{term.term_id}</Text>
                      <View style={[styles.termStatusChip, { borderColor: badgeColor }]}>
                        <Text style={[styles.termStatusChipText, { color: badgeColor }]}>
                          {badgeLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.termOdiaWord}>{term.odia_word}</Text>
                    <Text style={styles.termEnWord}>{term.en_word}</Text>

                    <View style={styles.termProgressTrack}>
                      <View
                        style={[
                          styles.termProgressFill,
                          { width: `${pct}%`, backgroundColor: badgeColor },
                        ]}
                      />
                    </View>
                    <Text style={styles.termPercentText}>{pct}% ({term.current_mastery.toFixed(4)})</Text>
                  </View>
                );
              })}
            </View>

            {/* 3-Modality Strengths */}
            <View style={styles.modalitySection}>
              <Text style={styles.modalityHeaderTitle}>
                🎨 ୩-ମାଧ୍ୟମ ଶକ୍ତି ପ୍ରୋଫାଇଲ୍ (3-Modality Strength Profile)
              </Text>
              <Text style={styles.modalityHeaderSub}>
                Picture (P), Audio (A), and Text (T) probe response distribution
              </Text>

              {snapshot.modalities.map((mod) => (
                <View key={mod.modality} style={styles.modalityRow}>
                  <View style={styles.modalityLabelCol}>
                    <Text style={styles.modalityLabelOdia}>{mod.label_or}</Text>
                    <Text style={styles.modalityLabelEn}>{mod.label_en}</Text>
                  </View>

                  <View style={styles.modalityBarCol}>
                    <View style={styles.modalityTrack}>
                      <View
                        style={[
                          styles.modalityFill,
                          {
                            width: `${mod.rate_pct}%`,
                            backgroundColor:
                              mod.modality === 'P'
                                ? colors.primary
                                : mod.modality === 'A'
                                ? colors.secondary
                                : '#10B981',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.modalityStatsText}>
                      {mod.rate_pct}% ({mod.passed}/{mod.total})
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ======================================================== */}
          {/* SECTION D: FR-30 Live SQLite Replay Verification Box     */}
          {/* ======================================================== */}
          <View style={styles.sectionCard}>
            <View style={styles.replayHeaderRow}>
              <View style={styles.replayHeaderTitleCol}>
                <Text style={styles.sectionHeaderTitle}>
                  🔄 FR-30 Live SQLite Replay Verification
                </Text>
                <Text style={styles.sectionHeaderSub}>
                  Deterministic verification of logged events against pure BKT floats
                </Text>
              </View>
              <Pressable
                style={styles.refreshReplayBtn}
                onPress={() => setReplayRefreshCounter((c) => c + 1)}
                accessibilityRole="button"
                accessibilityLabel="Rebuild Mastery from Raw SQLite Events"
              >
                <Text style={styles.refreshReplayBtnText}>
                  🔄 Rebuild
                </Text>
              </Pressable>
            </View>

            {/* Verification Banner */}
            <View
              style={[
                styles.replayBanner,
                {
                  backgroundColor: replayResult.verified ? '#064E3B' : '#7F1D1D',
                  borderColor: replayResult.verified ? '#10B981' : '#EF4444',
                },
              ]}
            >
              <Text style={styles.replayBannerTitle}>
                {replayResult.verified
                  ? '✅ 100% Verified · Zero Mathematical Drift'
                  : '⚠️ Mathematical Divergence Detected'}
              </Text>
              <Text style={styles.replayBannerSub}>
                Replay Max Drift: {replayResult.maxDrift.toFixed(6)} · Tolerated: ≤ 0.0001
              </Text>
            </View>

            {/* Replay Steps Table */}
            <View style={styles.stepsTable}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Seq</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Target</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Stored</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Replayed</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>
                  Status
                </Text>
              </View>

              {replayResult.steps.length === 0 ? (
                <View style={styles.emptyStepsBox}>
                  <Text style={styles.emptyStepsText}>
                    No mastery events logged yet. Replay engine verified baseline parameters.
                  </Text>
                </View>
              ) : (
                replayResult.steps.map((st, idx) => (
                  <View key={idx} style={styles.tableDataRow}>
                    <Text style={[styles.tableDataCell, { flex: 1 }]}>#{st.seq}</Text>
                    <Text style={[styles.tableDataCell, { flex: 1.5 }]}>
                      {st.kind === 'concept' ? 'Concept' : 'Term'}
                    </Text>
                    <Text style={[styles.tableDataCell, { flex: 2, fontFamily: 'monospace' }]}>
                      {st.expected.toFixed(4)}
                    </Text>
                    <Text style={[styles.tableDataCell, { flex: 2, fontFamily: 'monospace' }]}>
                      {st.replayed.toFixed(4)}
                    </Text>
                    <Text
                      style={[
                        styles.tableDataCell,
                        {
                          flex: 1.5,
                          textAlign: 'right',
                          color: st.match ? '#10B981' : '#EF4444',
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {st.match ? '✓ MATCH' : '✗ DIFF'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#F3F4F6',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: '#131D31',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F2E4D',
    ...shadows.card,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  statSubLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
  },
  statMetaText: {
    fontSize: 9,
    color: '#64748B',
  },
  miniBarTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  recommendationCard: {
    backgroundColor: '#1E293B',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  recBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  recPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  recPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  recPillSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  recTitleOdia: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 4,
  },
  recTitleEn: {
    fontSize: 14,
    color: '#93C5FD',
    marginBottom: spacing.xs,
  },
  recReasonBox: {
    backgroundColor: '#0F172A',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  recReasonOdia: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  recReasonEn: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  startRecBtn: {
    backgroundColor: '#2563EB',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  startRecBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  conceptBlock: {
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  conceptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conceptTitleContainer: {
    flex: 1,
  },
  conceptTitleOdia: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  conceptTitleEn: {
    fontSize: 11,
    color: '#94A3B8',
  },
  conceptPctBadge: {
    paddingLeft: spacing.sm,
  },
  conceptPctText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  trajectoryChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  historyChipStep: {
    fontSize: 9,
    color: '#64748B',
  },
  historyChipVal: {
    fontSize: 10,
    color: '#E2E8F0',
    fontWeight: '700',
  },
  historyChipArrow: {
    fontSize: 10,
    color: '#3B82F6',
    marginLeft: 2,
  },
  termGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  termCard: {
    width: '48%',
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  termCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termIdText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  termStatusChip: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  termStatusChipText: {
    fontSize: 8,
    fontWeight: '700',
  },
  termOdiaWord: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 4,
  },
  termEnWord: {
    fontSize: 10,
    color: '#94A3B8',
  },
  termProgressTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  termProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  termPercentText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalitySection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  modalityHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalityHeaderSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: spacing.sm,
  },
  modalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalityLabelCol: {
    width: 140,
  },
  modalityLabelOdia: {
    fontSize: 11,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  modalityLabelEn: {
    fontSize: 9,
    color: '#64748B',
  },
  modalityBarCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalityTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  modalityFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalityStatsText: {
    width: 75,
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
  },
  replayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  replayHeaderTitleCol: {
    flex: 1,
  },
  refreshReplayBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  refreshReplayBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  replayBanner: {
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  replayBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  replayBannerSub: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 2,
  },
  stepsTable: {
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tableHeaderCell: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tableDataCell: {
    fontSize: 10,
    color: '#E2E8F0',
  },
  emptyStepsBox: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyStepsText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
