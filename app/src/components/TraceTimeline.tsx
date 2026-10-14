import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import type { TraceEventMock } from '../mock/mockData';

interface TraceTimelineProps {
  episodeId?: string;
  summaryTitle?: string;
  events: any[];
}

export const TraceTimeline: React.FC<TraceTimelineProps> = ({
  episodeId = 'Episode #001 · BSE9-PHYS-MOTION-S02',
  summaryTitle = 'Diagnostic State Machine: OBSERVE ➔ MASTERY ➔ PROBE ➔ REFLECT ➔ ACT',
  events,
}) => {
  const getNodeColor = (node: string) => {
    switch (node) {
      case 'OBSERVE':
        return '#0284C7';
      case 'MASTERY':
        return '#059669';
      case 'PROBE':
        return '#D97706';
      case 'REFLECT':
        return '#7C3AED';
      case 'ACT':
        return '#E11D48';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>JUDGE / DEMO ARCHITECTURE</Text>
        </View>
        <Text style={styles.episodeId}>{episodeId}</Text>
        <Text style={styles.summaryTitle}>{summaryTitle}</Text>
      </View>

      <View style={styles.timeline}>
        {events.map((ev, index) => {
          const isLast = index === events.length - 1;
          const nodeColor = getNodeColor(ev.node);

          return (
            <View key={ev.id ?? index} style={styles.row}>
              <View style={styles.markerCol}>
                <View style={[styles.dot, { backgroundColor: nodeColor }]} />
                {!isLast && <View style={styles.line} />}
              </View>

              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.nodeTag, { backgroundColor: `${nodeColor}15` }]}>
                    <Text style={[styles.nodeText, { color: nodeColor }]}>{ev.node}</Text>
                  </View>
                  <Text style={styles.time}>{ev.timestamp}</Text>
                  <View
                    style={[
                      styles.statusTag,
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

                <Text style={styles.action}>{ev.action}</Text>
                <Text style={styles.desc}>{ev.description}</Text>

                {ev.payload && (
                  <View style={styles.payloadBox}>
                    <Text style={styles.payloadText}>{JSON.stringify(ev.payload, null, 2)}</Text>
                  </View>
                )}
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
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginBottom: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
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
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  markerCol: {
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
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
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
  nodeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  nodeText: {
    fontWeight: '800',
    fontSize: 11,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusAcked: {
    backgroundColor: colors.successLight,
  },
  statusPending: {
    backgroundColor: colors.warningLight,
  },
  statusError: {
    backgroundColor: colors.errorLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextAcked: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextError: {
    color: colors.error,
  },
  action: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  desc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  payloadBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  payloadText: {
    ...typography.mono,
    color: '#0284C7',
    fontSize: 11,
  },
});
