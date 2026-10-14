import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import type { SubjectModule } from '../mock/mockData';

interface SubjectCardProps {
  module: SubjectModule;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ module, onPress }) => {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${module.title}: ${module.progressPercent}% completed`}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{module.icon}</Text>
        </View>
        <Text style={styles.progressPercent}>{module.progressPercent}%</Text>
      </View>

      <Text style={styles.title}>{module.title}</Text>
      <Text style={styles.titleOr}>{module.titleOr}</Text>

      {/* Progress Track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${module.progressPercent}%`, backgroundColor: module.color }]} />
      </View>

      <Text style={styles.stats}>
        {module.completedLessons} of {module.totalLessons} lessons
      </Text>
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
    minWidth: 160,
    flex: 1,
    ...shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  progressPercent: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  titleOr: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginTop: spacing.sm + 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  stats: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
});
