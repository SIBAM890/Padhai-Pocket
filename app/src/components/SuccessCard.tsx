import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

interface SuccessCardProps {
  title?: string;
  subtitle?: string;
  conceptMastery?: number;
  onContinue: () => void;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  title = "Nice work! You've got this idea.",
  subtitle = 'ତୁମେ ଏହି ଧାରଣାଟି ଭଲ ଭାବରେ ବୁଝିପାରିଲ।',
  conceptMastery = 0.76,
  onContinue,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badgeCircle}>
        <Text style={styles.trophyIcon}>🌟</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.masteryPill}>
        <Text style={styles.masteryLabel}>Concept Understanding</Text>
        <Text style={styles.masteryValue}>{Math.round(conceptMastery * 100)}%</Text>
      </View>

      <Pressable style={styles.continueButton} onPress={onContinue} accessibilityRole="button">
        <Text style={styles.continueText}>Continue Learning ➔</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderSuccess,
    marginBottom: spacing.md,
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#064e3b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  trophyIcon: {
    fontSize: 34,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  masteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  masteryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  masteryValue: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '800',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    ...typography.button,
    color: '#07111f',
    fontSize: 16,
  },
});
