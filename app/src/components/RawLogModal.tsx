import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StoredEvent } from '../types/events';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export interface RawLogModalProps {
  visible: boolean;
  onClose: () => void;
  events: StoredEvent[];
  profileId: string;
}

/**
 * Filters events by profileId and sorts by seq ASC.
 * Exported for testability.
 */
export function filterEventsForProfile(
  events: StoredEvent[],
  profileId: string
): StoredEvent[] {
  if (!Array.isArray(events) || !profileId) return [];
  return events
    .filter((e) => e && e.profile_id === profileId)
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
}

/**
 * Preview helper for payload - truncates to first 60 chars.
 */
function previewPayload(payload: unknown): string {
  try {
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
    return str.length > 60 ? str.slice(0, 60) + '…' : str;
  } catch {
    return '{}';
  }
}

/**
 * Format timestamp for display.
 */
function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    return isNaN(date.getTime()) ? ts : date.toLocaleString();
  } catch {
    return ts;
  }
}

/**
 * Modal component displaying raw event log for a profile.
 * Renders columns: seq · ts · node · action · origin · sync_status · input_hash · payload
 */
export function RawLogModal({
  visible,
  onClose,
  events,
  profileId,
}: RawLogModalProps) {
  const filteredEvents = filterEventsForProfile(events, profileId);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Raw Event Log</Text>
              <Text style={styles.modalSubtitle}>
                Profile: {profileId} · {filteredEvents.length} events
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No events for this profile.</Text>
            </View>
          ) : (
            <ScrollView style={styles.rowsList}>
              {filteredEvents.map((event) => (
                <View key={event.event_id || `seq_${event.seq}`} style={styles.rowCard}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.seqBadge}>seq {event.seq}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        event.sync_status === 'ACKED' && styles.badgeAcked,
                        event.sync_status === 'PENDING' && styles.badgePending,
                        event.sync_status === 'ERROR' && styles.badgeError,
                        event.sync_status === 'REJECTED' && styles.badgeRejected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          event.sync_status === 'ACKED' && styles.textAcked,
                          event.sync_status === 'PENDING' && styles.textPending,
                          event.sync_status === 'ERROR' && styles.textError,
                          event.sync_status === 'REJECTED' && styles.textRejected,
                        ]}
                      >
                        {event.sync_status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowFields}>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>ts</Text>
                      <Text style={styles.fieldValue}>{formatTimestamp(event.ts)}</Text>
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>node</Text>
                      <Text style={styles.fieldValue}>{event.node}</Text>
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>action</Text>
                      <Text style={styles.fieldValue}>{event.action}</Text>
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>origin</Text>
                      <Text style={styles.fieldValue}>{event.origin}</Text>
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>input_hash</Text>
                      <Text style={[styles.fieldValue, styles.mono]}>
                        {(event.input_hash || '').slice(0, 8)}
                      </Text>
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>payload</Text>
                      <Text style={[styles.fieldValue, styles.mono]}>
                        {previewPayload(event.output)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.hover,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  rowsList: {
    maxHeight: 480,
  },
  rowCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  seqBadge: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  badgeAcked: {
    backgroundColor: colors.secondaryLight,
  },
  badgePending: {
    backgroundColor: colors.warningLight,
  },
  badgeError: {
    backgroundColor: colors.errorLight,
  },
  badgeRejected: {
    backgroundColor: colors.surfaceSubtle,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textAcked: {
    color: colors.secondary,
  },
  textPending: {
    color: colors.warning,
  },
  textError: {
    color: colors.error,
  },
  textRejected: {
    color: colors.textMuted,
  },
  rowFields: {
    gap: spacing.xs,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.textMuted,
  },
  fieldValue: {
    fontSize: typography.caption.fontSize,
    color: colors.textPrimary,
  },
  mono: {
    fontFamily: typography.mono.fontFamily,
    fontSize: typography.mono.fontSize,
    lineHeight: typography.mono.lineHeight,
  },
});