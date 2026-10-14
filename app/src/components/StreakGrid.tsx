import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import type { StreakDay } from '../mock/mockData';

interface StreakGridProps {
  streakDays?: number;
  minutesThisWeek?: number;
  gridData: StreakDay[];
}

export const StreakGrid: React.FC<StreakGridProps> = ({
  streakDays = 7,
  minutesThisWeek = 42,
  gridData,
}) => {
  const getCellColor = (level: number) => {
    switch (level) {
      case 3:
        return colors.secondary; // High intensity teal
      case 2:
        return '#38C1B0'; // Medium teal
      case 1:
        return '#B4E6DF'; // Light teal
      default:
        return '#F1F5F9'; // Inactive day
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your learning streak</Text>
          <Text style={styles.subtitle}>Consistency builds mastery every day</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.flameIcon}>🔥</Text>
          <Text style={styles.streakCount}>{streakDays} days</Text>
        </View>
      </View>

      {/* Contribution Grid */}
      <View style={styles.gridContainer}>
        {gridData.map((day) => (
          <View key={day.dayName} style={styles.dayColumn}>
            {day.levels.map((level, idx) => (
              <View
                key={`${day.dayName}-${idx}`}
                style={[styles.gridCell, { backgroundColor: getCellColor(level) }]}
              />
            ))}
            <Text style={styles.dayLabel}>{day.dayName}</Text>
          </View>
        ))}
      </View>

      {/* Footer stats */}
      <View style={styles.footerRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{streakDays}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{minutesThisWeek} min</Text>
          <Text style={styles.statLabel}>THIS WEEK</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.cardHeading,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 4,
  },
  flameIcon: {
    fontSize: 14,
  },
  streakCount: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  gridCell: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  dayLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
});
