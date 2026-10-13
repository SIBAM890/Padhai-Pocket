import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import type { TraceEventMock } from '../mock/mockData';

interface TraceTimelineProps {
  episodeId?: string;
  summaryTitle?: string;
  events: TraceEventMock[];
}

export const TraceTimeline: React.FC<TraceTimelineProps> = ({
  episodeId = 'Episode #001 (Deterministic Seed: 1806635391)',
  summaryTitle = 'Diagnostic State Machine Sequence',
  events,
}) => {
  const getNodeColor = (node: string) => {
    switch (node) {
      case 'OBSERVE':
        return '#38bdf8';
      case 'MASTERY':
        return '#34d399';
      case 'PROBE':
        return '#fbbf24';
      case 'REFLECT':
        return '#a78bfa';
      case 'ACT':
        return '#f43f5e';
      default:
        return '#94a3b8';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.episodeHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DEMO / JUDGE VIEW</Text>
        </View>
        <Text style={styles.episodeId}>{episodeId}</Text>
        <Text style={styles.summaryTitle}>{summaryTitle}</Text>
      </View>

      <View style={styles.timeline}>
        {events.map((ev, index) => {
          const isLast = index === events.length - 1;
          const nodeColor = getNodeColor(ev.node);

          return (
            <View key={ev.id} style={styles.eventRow}>
              {/* Left timeline line & indicator */}
              <View style={styles.markerColumn}>
                <View style={[styles.dot, { backgroundColor: nodeColor }]} />
                {!isLast && <View style={styles.verticalLine} />}
              </View>

              {/* Event card */}
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={[styles.nodePill, { backgroundColor: `${nodeColor}22` }]}>
                    <Text style={[styles.nodeText, { color: nodeColor }]}>{ev.node}</Text>
                  </View>
                  <Text style={styles.timestamp}>{ev.timestamp}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      ev.status === 'ACKED'
                        ? styles.statusAcked
                        : ev.status === 'ERROR'
                        ? styles.statusError
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        ev.status === 'ACKED'
                          ? styles.statusTextAcked
                          : ev.status === 'ERROR'
                          ? styles.statusTextError
                          : styles.statusTextPending,
                      ]}
                    >
                      {ev.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.actionTitle}>{ev.action}</Text>
                <Text style={styles.description}>{ev.description}</Text>

                <View style={styles.payloadBox}>
                  <Text style={styles.payloadText}>{JSON.stringify(ev.payload, null, 2)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  episodeHeader: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#172554',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  badgeText: {
    ...typography.caption,
    color: '#60a5fa',
    fontWeight: '800',
  },
  episodeId: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  summaryTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  markerColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  nodePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  nodeText: {
    fontWeight: '800',
    fontSize: 11,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusAcked: {
    backgroundColor: '#064e3b',
  },
  statusPending: {
    backgroundColor: '#78350f',
  },
  statusError: {
    backgroundColor: '#7f1d1d',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextAcked: {
    color: colors.primaryLight,
  },
  statusTextPending: {
    color: colors.attentionLight,
  },
  statusTextError: {
    color: '#f87171',
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  payloadBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  payloadText: {
    ...typography.mono,
    color: '#93c5fd',
    fontSize: 11,
  },
});
