import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { TrophyIcon, FlameIcon, BookIcon } from './AppIcons';

interface CompletionCardProps {
  studentName?: string;
  lessonTitle?: string;
  pointsEarned?: number;
  streakDays?: number;
  onContinue: () => void;
  onBackToDashboard: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  studentName = 'Learner',
  lessonTitle = 'Motion & Displacement',
  pointsEarned = 10,
  streakDays = 7,
  onContinue,
  onBackToDashboard,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badgeCircle}>
        <TrophyIcon size={38} color={colors.secondary} />
      </View>

      <Text style={styles.title}>Great work, {studentName}!</Text>
      <Text style={styles.subtitle}>You completed {lessonTitle}</Text>

      {/* Rewards Pill Row */}
      <View style={styles.rewardsRow}>
        <View style={styles.rewardItem}>
          <Text style={styles.starText}>★</Text>
          <Text style={styles.rewardValue}>+{pointsEarned} Points</Text>
        </View>

        <View style={styles.rewardItem}>
          <FlameIcon size={16} color={colors.accent} />
          <Text style={styles.rewardValue}>{streakDays} Day Streak</Text>
        </View>

        <View style={styles.rewardItem}>
          <BookIcon size={16} color={colors.primary} />
          <Text style={styles.rewardValue}>+1 Lesson</Text>
        </View>
      </View>

      {/* Primary Actions */}
      <Pressable style={styles.primaryBtn} onPress={onContinue} accessibilityRole="button">
        <Text style={styles.primaryBtnText}>Continue Learning ➔</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onBackToDashboard} accessibilityRole="button">
        <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  badgeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.secondaryLight,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  starText: {
    fontSize: 16,
    color: '#EAB308',
    fontWeight: '800',
  },
  rewardValue: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
    ...shadows.subtle,
  },
  primaryBtnText: {
    ...typography.button,
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    width: '100%',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
