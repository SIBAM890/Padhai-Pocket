import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface CompletionCardProps {
  lessonTitle?: string;
  pointsEarned?: number;
  streakDays?: number;
  onContinue: () => void;
  onBackToDashboard: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  lessonTitle = 'Motion & Displacement',
  pointsEarned = 10,
  streakDays = 7,
  onContinue,
  onBackToDashboard,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badgeCircle}>
        <Text style={styles.trophyIcon}>🎉</Text>
      </View>

      <Text style={styles.title}>Great work, Sunita!</Text>
      <Text style={styles.subtitle}>You completed {lessonTitle}</Text>

      {/* Rewards Pill Row */}
      <View style={styles.rewardsRow}>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardIcon}>🌟</Text>
          <Text style={styles.rewardValue}>+{pointsEarned} Points</Text>
        </View>

        <View style={styles.rewardItem}>
          <Text style={styles.rewardIcon}>🔥</Text>
          <Text style={styles.rewardValue}>{streakDays} Day Streak</Text>
        </View>

        <View style={styles.rewardItem}>
          <Text style={styles.rewardIcon}>📚</Text>
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
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  trophyIcon: {
    fontSize: 34,
  },
  title: {
    ...typography.h1,
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
    width: '100%',
    justifyContent: 'space-between',
  },
  rewardItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIcon: {
    fontSize: 20,
    marginBottom: 2,
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
    ...shadows.subtle,
  },
  primaryBtnText: {
    ...typography.button,
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
