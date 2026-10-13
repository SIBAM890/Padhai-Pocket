import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import type { LessonItem } from '../mock/mockData';

interface LessonBrowserCardProps {
  lesson: LessonItem;
  onPress: () => void;
}

export const LessonBrowserCard: React.FC<LessonBrowserCardProps> = ({ lesson, onPress }) => {
  const isCompleted = lesson.status === 'COMPLETED';
  const isInProgress = lesson.status === 'IN_PROGRESS';
  const isLocked = lesson.status === 'LOCKED';

  return (
    <Pressable
      style={[styles.card, isLocked && styles.cardLocked]}
      disabled={isLocked}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${lesson.number}: ${lesson.title}. Status: ${lesson.status}`}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.numberBox,
            isCompleted && styles.numberBoxCompleted,
            isInProgress && styles.numberBoxActive,
            isLocked && styles.numberBoxLocked,
          ]}
        >
          {isCompleted ? (
            <Text style={styles.checkIcon}>✓</Text>
          ) : isLocked ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <Text style={styles.numberText}>{lesson.number}</Text>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.titleOr}>{lesson.titleOr}</Text>
          <Text style={styles.summary}>{lesson.summary}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.pill}>
          <Text style={styles.duration}>{lesson.durationMin} min</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
    ...shadows.subtle,
  },
  cardLocked: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.sm,
  },
  numberBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  numberBoxCompleted: {
    backgroundColor: colors.successLight,
  },
  numberBoxActive: {
    backgroundColor: colors.primaryLight,
  },
  numberBoxLocked: {
    backgroundColor: '#F1F5F9',
  },
  checkIcon: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '800',
  },
  lockIcon: {
    fontSize: 16,
  },
  numberText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleOr: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  summary: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },
  right: {
    alignItems: 'flex-end',
  },
  pill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  duration: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
});
