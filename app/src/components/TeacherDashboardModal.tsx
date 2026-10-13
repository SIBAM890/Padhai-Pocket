import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { mockTeacherData } from '../mock/mockData';
import { MaleHumanIcon, FemaleHumanIcon } from './AppIcons';

interface TeacherDashboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  visible,
  onClose,
}) => {
  if (!visible) return null;

  const { overview, learners } = mockTeacherData;

  return (
    <View style={styles.backdrop}>
      <View style={styles.modalCard}>
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.teacherBadge}>TEACHER OVERVIEW (ଶିକ୍ଷକ ଡ୍ୟାସବୋର୍ଡ)</Text>
            <Text style={styles.title}>Multi-Learner Diagnostic Monitor</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Overview Metrics Cards */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{overview.activeLearners}</Text>
              <Text style={styles.metricLabel}>Active Learners</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{overview.syncedEpisodes}</Text>
              <Text style={styles.metricLabel}>Episodes Evaluated</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{overview.offlineDevices}</Text>
              <Text style={styles.metricLabel}>Offline Tablets</Text>
            </View>
            <View style={[styles.metricCard, styles.flaggedCard]}>
              <Text style={[styles.metricNumber, styles.flaggedNumber]}>
                {overview.flaggedAssistance}
              </Text>
              <Text style={styles.metricLabel}>Teacher Flags</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Learner Cohort Status</Text>

          {/* Learners List */}
          {learners.map((learner) => (
            <View key={learner.id} style={styles.learnerRow}>
              <View style={styles.learnerInfo}>
                <View style={styles.avatarContainer}>
                  {learner.avatar === '👦🏽' || learner.name.includes('Rohan') ? (
                    <MaleHumanIcon size={20} color={colors.primary} />
                  ) : (
                    <FemaleHumanIcon size={20} color={colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.learnerName}>{learner.name}</Text>
                  <Text style={styles.lastActive}>Active {learner.lastActive}</Text>
                </View>
              </View>

              <View style={styles.masteryColumns}>
                <View style={styles.masteryCol}>
                  <Text style={styles.masteryVal}>
                    {Math.round(learner.conceptMastery * 100)}%
                  </Text>
                  <Text style={styles.masteryCaption}>Concept</Text>
                </View>
                <View style={styles.masteryCol}>
                  <Text style={styles.masteryVal}>
                    {Math.round(learner.termMastery * 100)}%
                  </Text>
                  <Text style={styles.masteryCaption}>Terms</Text>
                </View>
              </View>

              {learner.confirmedGaps.length > 0 && (
                <View style={styles.gapPill}>
                  <Text style={styles.gapText}>
                    Flag: {learner.confirmedGaps.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    width: '100%',
    maxWidth: 580,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  teacherBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scroll: {
    paddingVertical: spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  flaggedCard: {
    borderColor: colors.accent,
    backgroundColor: '#FFF5F4',
  },
  metricNumber: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  flaggedNumber: {
    color: colors.accent,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  learnerRow: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  learnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnerName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lastActive: {
    ...typography.caption,
    color: colors.textMuted,
  },
  masteryColumns: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginVertical: spacing.xs,
  },
  masteryCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  masteryVal: {
    ...typography.body,
    fontWeight: '800',
    color: colors.primary,
  },
  masteryCaption: {
    ...typography.caption,
    color: colors.textMuted,
  },
  gapPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5F4',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  gapText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
