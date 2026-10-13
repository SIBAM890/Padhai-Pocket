import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface LessonIntroCardProps {
  title: string;
  titleOr?: string;
  estimatedMinutes?: number;
  lessonNumber?: string;
  totalLessons?: number;
  onStart: () => void;
  onBack: () => void;
}

export const LessonIntroCard: React.FC<LessonIntroCardProps> = ({
  title = 'Motion & Mechanics',
  titleOr = 'ଗତି ଏବଂ ବଳ',
  estimatedMinutes = 5,
  lessonNumber = 'Lesson 2 of 3',
  onStart,
  onBack,
}) => {
  return (
    <View style={styles.card}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </Pressable>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>PHYSICAL SCIENCE · CLASS 9</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      {titleOr && <Text style={styles.titleOr}>{titleOr}</Text>}

      <Text style={styles.description}>
        In this lesson, we will understand how objects travel, track starting points, and uncover the simple difference between distance traveled and displacement.
      </Text>

      {/* Meta indicators */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={styles.metaText}>{estimatedMinutes} minutes</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📖</Text>
          <Text style={styles.metaText}>{lessonNumber}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🗣️</Text>
          <Text style={styles.metaText}>Odia Voice Ready</Text>
        </View>
      </View>

      <Pressable style={styles.startButton} onPress={onStart} accessibilityRole="button">
        <Text style={styles.startButtonText}>Start Lesson ➔</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  titleOr: {
    ...typography.h3,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    ...shadows.subtle,
  },
  startButtonText: {
    ...typography.button,
    fontSize: 16,
  },
});
