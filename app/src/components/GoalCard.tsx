import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface GoalCardProps {
  goalTitle?: string;
  activitiesDone?: number;
  totalActivities?: number;
  onPress: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goalTitle = 'Complete 1 lesson today',
  activitiesDone = 1,
  totalActivities = 3,
  onPress,
}) => {
  const percent = Math.round((activitiesDone / totalActivities) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🎯</Text>
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.kicker}>TODAY'S GOAL</Text>
          <Text style={styles.title}>{goalTitle}</Text>
          <Text style={styles.progressText}>
            {activitiesDone} / {totalActivities} activities finished ({percent}%)
          </Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={onPress} accessibilityRole="button">
        <Text style={styles.btnText}>Start</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.subtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  icon: {
    fontSize: 20,
  },
  textGroup: {
    flex: 1,
  },
  kicker: {
    ...typography.caption,
    fontSize: 10,
    color: colors.warning,
    fontWeight: '800',
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
  },
  btnText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '800',
  },
});
