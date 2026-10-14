import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface ContinueLearningCardProps {
  subject: string;
  lessonNumber: string;
  lessonTitle: string;
  lessonTitleOr?: string;
  progressPercent: number;
  onContinue: () => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  subject = 'Physics · Motion',
  lessonNumber = 'Lesson 2',
  lessonTitle = 'Displacement and Distance',
  lessonTitleOr = 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
  progressPercent = 80,
  onContinue,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>CONTINUE LEARNING</Text>
        </View>
        <Text style={styles.lessonNumber}>{lessonNumber}</Text>
      </View>

      <Text style={styles.subject}>{subject}</Text>
      <Text style={styles.title}>{lessonTitle}</Text>
      {lessonTitleOr && <Text style={styles.titleOr}>{lessonTitleOr}</Text>}

      {/* Clean progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>

      <Pressable
        style={styles.continueButton}
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue lesson"
      >
        <Text style={styles.continueButtonText}>Continue Lesson ➔</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  lessonNumber: {
    ...typography.caption,
    color: colors.textMuted,
  },
  subject: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs + 2,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  titleOr: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEF2F6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    marginTop: spacing.md + 4,
    ...shadows.subtle,
  },
  continueButtonText: {
    ...typography.button,
    fontSize: 16,
  },
});
