import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface LessonContentCardProps {
  conceptTitle: string;
  conceptTitleOr?: string;
  story: string;
  storyOr?: string;
  prompt: string;
  promptOr?: string;
}

export const LessonContentCard: React.FC<LessonContentCardProps> = ({
  conceptTitle,
  conceptTitleOr,
  story,
  storyOr,
  prompt,
  promptOr,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Text style={styles.kicker}>PHYSICAL SCIENCE · QUESTION</Text>
        <Text style={styles.badgeNumber}>2 of 3</Text>
      </View>

      <Text style={styles.title}>{conceptTitle}</Text>
      {conceptTitleOr && <Text style={styles.titleOr}>{conceptTitleOr}</Text>}

      {story && (
        <View style={styles.storyBox}>
          <Text style={styles.storyText}>{story}</Text>
          {storyOr && <Text style={styles.storyOrText}>{storyOr}</Text>}
        </View>
      )}

      {/* Visual East/West movement track */}
      <View style={styles.diagramContainer}>
        <Text style={styles.diagramTitle}>Visual Concept Guide</Text>
        <View style={styles.track}>
          <View style={styles.nodeItem}>
            <Text style={styles.nodeIcon}>🚩</Text>
            <Text style={styles.nodeText}>Start Flag</Text>
          </View>

          <View style={styles.vectorCenter}>
            <Text style={styles.eastArrow}>3m East ➔➔</Text>
            <View style={styles.dividerLine} />
            <Text style={styles.westArrow}>⮌⮌ 3m West</Text>
          </View>

          <View style={styles.nodeItem}>
            <Text style={styles.nodeIcon}>📍</Text>
            <Text style={styles.nodeText}>Turnaround</Text>
          </View>
        </View>
        <Text style={styles.captionText}>
          The student walks 3m forward, turns right around, and walks 3m back.
        </Text>
      </View>

      {/* Question prompts */}
      <Text style={styles.prompt}>{prompt}</Text>
      {promptOr && <Text style={styles.promptOr}>{promptOr}</Text>}
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
    marginBottom: spacing.md,
    ...shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kicker: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  badgeNumber: {
    ...typography.caption,
    color: colors.textMuted,
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
  storyBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.card,
    marginVertical: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  storyText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
    fontWeight: '600',
  },
  storyOrText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  diagramContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  diagramTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  nodeItem: {
    alignItems: 'center',
  },
  nodeIcon: {
    fontSize: 22,
  },
  nodeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  vectorCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  eastArrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  dividerLine: {
    height: 2,
    width: '80%',
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  westArrow: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
  },
  captionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  prompt: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
    lineHeight: 26,
  },
  promptOr: {
    ...typography.body,
    color: colors.secondary,
    marginTop: 4,
    lineHeight: 22,
  },
});
