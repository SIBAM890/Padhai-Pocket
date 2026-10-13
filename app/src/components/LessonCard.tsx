import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

interface LessonCardProps {
  chapter: string;
  lessonIndex: number;
  totalLessons: number;
  title: string;
  prompt: string;
  promptOr?: string;
  showIllustration?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  chapter,
  lessonIndex,
  totalLessons,
  title,
  prompt,
  promptOr,
  showIllustration = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.kicker}>{chapter.toUpperCase()}</Text>
        <Text style={styles.counter}>
          Lesson {lessonIndex} of {totalLessons}
        </Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      {/* Primary Question Prompt */}
      <Text style={styles.prompt}>{prompt}</Text>

      {/* Odia translation prompt for low-literacy clarity */}
      {promptOr && <Text style={styles.promptOr}>{promptOr}</Text>}

      {/* Visual Movement Illustration (3m East then 3m West) */}
      {showIllustration && (
        <View style={styles.illustrationContainer}>
          <View style={styles.track}>
            <View style={styles.nodeItem}>
              <Text style={styles.flagIcon}>🚩</Text>
              <Text style={styles.nodeLabel}>Start</Text>
            </View>
            <View style={styles.arrowBox}>
              <Text style={styles.arrowText}>3m East ➔</Text>
              <View style={styles.dashedLine} />
              <Text style={styles.arrowText}>⮌ 3m West</Text>
            </View>
            <View style={styles.nodeItem}>
              <Text style={styles.flagIcon}>📍</Text>
              <Text style={styles.nodeLabel}>Turnaround</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kicker: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  prompt: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  promptOr: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 22,
  },
  illustrationContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceSubtle,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeItem: {
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 22,
  },
  nodeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  arrowBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  arrowText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  dashedLine: {
    height: 2,
    width: '80%',
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});
