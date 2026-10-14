import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import type { StreakDay, StreakCell } from '../utils/streakHelper';

interface StreakGridProps {
  streakDays?: number;
  minutesThisWeek?: number;
  gridData: StreakDay[];
  defaultSelectedCell?: StreakCell;
}

export const StreakGrid: React.FC<StreakGridProps> = ({
  streakDays = 0,
  minutesThisWeek = 0,
  gridData,
  defaultSelectedCell,
}) => {
  // Find today's cell as initial selected cell for the inline tooltip
  const findTodayCell = (): StreakCell | null => {
    if (defaultSelectedCell) return defaultSelectedCell;
    for (const day of gridData) {
      if (day.cells) {
        const todayCell = day.cells.find((c) => c.isToday);
        if (todayCell) return todayCell;
      }
    }
    return gridData[0]?.cells?.[3] ?? null;
  };

  const [selectedCell, setSelectedCell] = useState<StreakCell | null>(findTodayCell);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PADHAI DIAGNOSTIC MASTERY MATRIX</Text>
          <Text style={styles.title}>Your learning streak</Text>
          <Text style={styles.subtitle}>Real-time multimodal activity & mastery progression</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.flameIcon}>🔥</Text>
          <Text style={styles.streakCount}>{streakDays} days</Text>
        </View>
      </View>

      {/* 4-Week Rolling Contribution Heatmap Grid */}
      <View style={styles.matrixContainer}>
        <View style={styles.gridContainer}>
          {gridData.map((day) => (
            <View key={day.dayName} style={styles.dayColumn}>
              {day.cells.map((cell, rowIdx) => {
                const isSelected = selectedCell?.dateKey === cell.dateKey;

                return (
                  <Pressable
                    key={`${day.dayName}-${cell.dateKey}-${rowIdx}`}
                    onPress={() => setSelectedCell(cell)}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.dayName} ${cell.displayDate}: ${cell.count} activities, ${cell.gapLabel}`}
                    style={({ pressed }) => [
                      styles.cellWrapper,
                      pressed && styles.cellPressed,
                    ]}
                  >
                    {/* Tiny 'TODAY' micro-indicator */}
                    {cell.isToday && (
                      <View style={styles.todayIndicatorBadge}>
                        <Text style={styles.todayIndicatorText}>TODAY</Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.gridCell,
                        { backgroundColor: cell.color },
                        cell.isFuture && styles.futureCell,
                        cell.isToday && styles.todayCell,
                        isSelected && !cell.isToday && styles.selectedCell,
                      ]}
                    >
                      {/* Micro-dot badge letter for Term ('T') and Reading ('R') */}
                      {cell.badgeLetter && !cell.isFuture && (
                        <Text style={styles.microBadgeLetter}>{cell.badgeLetter}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
              <Text style={styles.dayLabel}>{day.dayName}</Text>
            </View>
          ))}
        </View>

        {/* Compact 4-Pill Diagnostic Color Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Mastery</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
            <Text style={styles.legendText}>Kui Term Bridge (T)</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
            <Text style={styles.legendText}>Audio Reading (R)</Text>
          </View>
          <View style={styles.legendPill}>
            <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
            <Text style={styles.legendText}>Concept</Text>
          </View>
        </View>

        {/* Sleek Inline Tooltip Bar for Selected Day Tile */}
        {selectedCell && (
          <View style={styles.tooltipBar}>
            <View style={styles.tooltipTopRow}>
              <View style={styles.tooltipDateGroup}>
                <Text style={styles.tooltipDate}>
                  {selectedCell.dayOfWeekName}, {selectedCell.displayDate}
                  {selectedCell.isToday ? ' (Today)' : selectedCell.isFuture ? ' (Upcoming)' : ''}
                </Text>
                <View style={[styles.tooltipTag, { backgroundColor: selectedCell.color + '22' }]}>
                  <Text style={[styles.tooltipTagText, { color: selectedCell.isFuture ? colors.textMuted : selectedCell.color }]}>
                    {selectedCell.gapLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.tooltipDeltaGroup}>
                <Text style={styles.tooltipDelta}>{selectedCell.masteryDelta}</Text>
              </View>
            </View>

            <View style={styles.tooltipBottomRow}>
              <Text style={styles.tooltipCount}>
                {selectedCell.isFuture
                  ? 'Scheduled activity day'
                  : selectedCell.count === 0
                  ? 'No activity recorded'
                  : `${selectedCell.count} completed interaction${selectedCell.count === 1 ? '' : 's'}`}
              </Text>
              <Text style={styles.tooltipHash} numberOfLines={1}>
                {selectedCell.hashPreview}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer stats: DAY STREAK and THIS WEEK active minutes */}
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
  kicker: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 2,
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
  matrixContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  cellWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPressed: {
    transform: [{ scale: 0.94 }],
  },
  gridCell: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureCell: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#059669', // active dark-emerald focus ring
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCell: {
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  todayIndicatorBadge: {
    position: 'absolute',
    top: -11,
    backgroundColor: '#059669',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 10,
  },
  todayIndicatorText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  microBadgeLetter: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dayLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tooltipBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    ...shadows.subtle,
  },
  tooltipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tooltipDate: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 12,
  },
  tooltipTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tooltipTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tooltipDeltaGroup: {
    alignItems: 'flex-end',
  },
  tooltipDelta: {
    ...typography.caption,
    fontWeight: '800',
    color: '#059669',
    fontSize: 11,
  },
  tooltipBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipCount: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  tooltipHash: {
    ...typography.caption,
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.textDisabled,
    maxWidth: 150,
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
