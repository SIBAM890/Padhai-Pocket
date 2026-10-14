import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { listEvents, subscribeDatabase, pendingEvents } from '../db/database';
import {
  syncPending,
  getTeacherSummary,
  purgeProfileOnServer,
  getDeviceCredentials,
  DEFAULT_API_BASE_URL,
  type SyncResult,
  type TeacherSummaryResult,
} from '../sync/syncClient';
import type { StoredEvent } from '../types/events';
import type { EngineState, EngineContext } from '../engine';

interface JudgeTelemetryPanelProps {
  engineState: EngineState;
  engineContext: EngineContext;
  networkMode: 'ONLINE' | 'WEAK' | 'OFFLINE';
  forcedOffline: boolean;
  onToggleForcedOffline: (val: boolean) => void;
  onRefreshParent?: () => void;
}

export const JudgeTelemetryPanel: React.FC<JudgeTelemetryPanelProps> = ({
  engineState,
  engineContext,
  networkMode,
  forcedOffline,
  onToggleForcedOffline,
  onRefreshParent,
}) => {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'TRACE' | 'JSON' | 'SUMMARY'>('TRACE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [summaryData, setSummaryData] = useState<TeacherSummaryResult | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const all = await listEvents(100);
      setEvents(all);
      const pending = await pendingEvents(200);
      setPendingCount(pending.length);
    } catch (e) {
      console.warn('JudgeTelemetry loadData error', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = subscribeDatabase(() => {
      loadData();
    });
    return unsub;
  }, [loadData]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPending();
      setLastSyncResult(res);
      await loadData();
      if (onRefreshParent) onRefreshParent();
      if (res.skipped) {
        showNotice('Sync skipped (offline or queue empty)');
      } else {
        showNotice(`Sync complete: ${res.acked} acked, ${res.duplicates} dups`);
      }
    } catch (err: any) {
      showNotice(`Sync failed: ${err?.message || 'Error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchSummary = async () => {
    try {
      const res = await getTeacherSummary();
      setSummaryData(res);
      setActiveTab('SUMMARY');
      if (res.ok) {
        showNotice('Summary fetched from FastAPI backend');
      } else {
        showNotice(`Summary error: ${res.error}`);
      }
    } catch (err: any) {
      showNotice(`Summary fetch failed: ${err?.message || 'Error'}`);
    }
  };

  const handleResetProfile = async () => {
    try {
      const res = await purgeProfileOnServer(engineState.profile_id);
      await loadData();
      if (onRefreshParent) onRefreshParent();
      showNotice(`Purged ${res.purgedEventsCount} events for profile`);
    } catch (err: any) {
      showNotice(`Purge failed: ${err?.message || 'Error'}`);
    }
  };

  const ackedCount = events.filter((e) => e.sync_status === 'ACKED').length;
  const errorCount = events.filter((e) => e.sync_status === 'ERROR').length;
  const creds = getDeviceCredentials();

  // Pattern formatting
  const pat = engineState.current_probe_pattern || [null, null, null];
  const formatBit = (b: number | null) => (b === 1 ? '✓ (1)' : b === 0 ? '✗ (0)' : '—');

  return (
    <View style={styles.container}>
      {/* Panel Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.kicker}>DESKTOP JUDGE MODE · 1024PX+</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>REAL RUNTIME</Text>
            </View>
          </View>
          <Text style={styles.title}>Deterministic Engine Telemetry</Text>
        </View>

        {actionNotice && (
          <View style={styles.noticePill}>
            <Text style={styles.noticeText}>{actionNotice}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Runtime State Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Runtime Parameters & Context</Text>
          <View style={styles.gridRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PRD §4.9 Seed</Text>
              <Text style={styles.metricValueMono}>{engineContext.seed}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Device ID</Text>
              <Text style={styles.metricValueMono} numberOfLines={1}>{engineContext.device_id || creds.deviceId}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Concept ID</Text>
              <Text style={styles.metricValue} numberOfLines={1}>{engineState.concept_id}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Engine Step</Text>
              <Text style={styles.metricValueHighlight}>{engineState.step}</Text>
            </View>
          </View>
        </View>

        {/* 2. 3-Way Battery & Diagnosis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3-Way Probe Battery & Hypothesis</Text>
          <View style={styles.probeRow}>
            <View style={[styles.probePill, pat[0] === 1 ? styles.probePillPassed : pat[0] === 0 ? styles.probePillFailed : null]}>
              <Text style={styles.probePillKey}>P (Picture)</Text>
              <Text style={styles.probePillVal}>{formatBit(pat[0])}</Text>
            </View>
            <View style={[styles.probePill, pat[1] === 1 ? styles.probePillPassed : pat[1] === 0 ? styles.probePillFailed : null]}>
              <Text style={styles.probePillKey}>A (Audio)</Text>
              <Text style={styles.probePillVal}>{formatBit(pat[1])}</Text>
            </View>
            <View style={[styles.probePill, pat[2] === 1 ? styles.probePillPassed : pat[2] === 0 ? styles.probePillFailed : null]}>
              <Text style={styles.probePillKey}>T (Text)</Text>
              <Text style={styles.probePillVal}>{formatBit(pat[2])}</Text>
            </View>
          </View>

          <View style={styles.diagnosisDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Candidate Hypothesis:</Text>
              <Text style={styles.detailValue}>
                {engineState.current_candidate || 'INITIAL_MCQ_EVAL'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Final Verdict Label:</Text>
              <Text style={[styles.detailValue, engineState.verdict.done ? styles.verdictDone : null]}>
                {engineState.verdict.done ? engineState.verdict.label : 'PENDING_RESOLUTION'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Agreement Status:</Text>
              <Text style={styles.detailValue}>
                {engineState.verdict.done ? `${engineState.verdict.agreement} (${engineState.verdict.status})` : 'EVALUATING'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Real-time BKT Mastery */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bayesian Knowledge Tracing (BKT)</Text>
          <View style={styles.bktRow}>
            <View style={styles.bktCard}>
              <Text style={styles.bktLabel}>Concept Mastery (Distance vs Displacement)</Text>
              <Text style={styles.bktPercent}>{Math.round(engineState.concept_mastery * 100)}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.round(engineState.concept_mastery * 100))}%` }]} />
              </View>
              <Text style={styles.bktRaw}>Raw: {engineState.concept_mastery.toFixed(4)}</Text>
            </View>

            <View style={styles.bktCard}>
              <Text style={styles.bktLabel}>Term Mastery (T_DISP / ବିସ୍ଥାପନ)</Text>
              <Text style={styles.bktPercent}>{Math.round((engineState.term_masteries?.['T_DISP'] ?? 0.4) * 100)}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.round((engineState.term_masteries?.['T_DISP'] ?? 0.4) * 100))}%`, backgroundColor: colors.accent }]} />
              </View>
              <Text style={styles.bktRaw}>Raw: {(engineState.term_masteries?.['T_DISP'] ?? 0.4).toFixed(4)}</Text>
            </View>
          </View>
        </View>

        {/* 4. Network & Persistence Telemetry */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Local SQLite / Storage & Sync Queue</Text>
            <View style={styles.airplaneToggle}>
              <Text style={styles.airplaneText}>Airplane Mode Demo:</Text>
              <Switch value={forcedOffline} onValueChange={onToggleForcedOffline} />
            </View>
          </View>

          <View style={styles.queueStatsRow}>
            <View style={styles.queueStatItem}>
              <Text style={styles.queueStatNum}>{events.length}</Text>
              <Text style={styles.queueStatLabel}>Total Events</Text>
            </View>
            <View style={styles.queueStatItem}>
              <Text style={[styles.queueStatNum, { color: colors.warning }]}>{pendingCount}</Text>
              <Text style={styles.queueStatLabel}>Pending</Text>
            </View>
            <View style={styles.queueStatItem}>
              <Text style={[styles.queueStatNum, { color: colors.success }]}>{ackedCount}</Text>
              <Text style={styles.queueStatLabel}>Synced (ACK)</Text>
            </View>
            <View style={styles.queueStatItem}>
              <Text style={[styles.queueStatNum, { color: colors.error }]}>{errorCount}</Text>
              <Text style={styles.queueStatLabel}>Retry Queue</Text>
            </View>
          </View>

          <View style={styles.backendRow}>
            <Text style={styles.backendUrl} numberOfLines={1}>
              Backend: {DEFAULT_API_BASE_URL} ({forcedOffline ? 'FORCED_OFFLINE' : networkMode})
            </Text>
          </View>

          {/* Action Trigger Buttons */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={[styles.actionBtn, isSyncing ? styles.actionBtnDisabled : null]}
              onPress={handleManualSync}
              disabled={isSyncing}
            >
              <Text style={styles.actionBtnText}>{isSyncing ? 'Syncing...' : '⚡ Sync Events Now'}</Text>
            </Pressable>

            <Pressable style={styles.actionBtnSecondary} onPress={handleFetchSummary}>
              <Text style={styles.actionBtnSecondaryText}>📊 Fetch Summary</Text>
            </Pressable>

            <Pressable style={styles.actionBtnDanger} onPress={handleResetProfile}>
              <Text style={styles.actionBtnDangerText}>🗑️ Reset Profile</Text>
            </Pressable>
          </View>
        </View>

        {/* 5. Live Event Stream View */}
        <View style={styles.card}>
          <View style={styles.streamHeaderRow}>
            <View style={styles.tabsRow}>
              <Pressable
                style={[styles.tabBtn, activeTab === 'TRACE' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('TRACE')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'TRACE' ? styles.tabBtnTextActive : null]}>
                  Live Trace ({events.length})
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tabBtn, activeTab === 'JSON' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('JSON')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'JSON' ? styles.tabBtnTextActive : null]}>
                  OpenAPI JSON
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tabBtn, activeTab === 'SUMMARY' ? styles.tabBtnActive : null]}
                onPress={() => setActiveTab('SUMMARY')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'SUMMARY' ? styles.tabBtnTextActive : null]}>
                  Server Summary
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={loadData} style={styles.refreshIconBtn}>
              <Text style={styles.refreshIconText}>🔄</Text>
            </Pressable>
          </View>

          {activeTab === 'TRACE' && (
            <View style={styles.streamContainer}>
              {events.length === 0 ? (
                <Text style={styles.emptyStreamText}>
                  No events recorded yet. Answer an MCQ or probe on the student screen to observe real-time events.
                </Text>
              ) : (
                events.map((ev) => (
                  <View key={ev.event_id} style={styles.eventRow}>
                    <View style={styles.eventHeader}>
                      <View style={styles.badgeNode}>
                        <Text style={styles.badgeNodeText}>{ev.node}</Text>
                      </View>
                      <Text style={styles.eventAction}>{ev.action}</Text>
                      <Text style={styles.eventSeq}>seq {ev.seq}</Text>
                      <View style={[styles.statusPill, ev.sync_status === 'ACKED' ? styles.statusAcked : styles.statusPending]}>
                        <Text style={styles.statusPillText}>{ev.sync_status}</Text>
                      </View>
                    </View>
                    <View style={styles.eventMeta}>
                      <Text style={styles.metaHash}>hash: {ev.input_hash}</Text>
                      {ev.mastery_after !== undefined && (
                        <Text style={styles.metaMastery}>
                          mastery: {Math.round(ev.mastery_after * 100)}%
                        </Text>
                      )}
                      <Text style={styles.metaTime}>
                        {new Date(ev.ts).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'JSON' && (
            <ScrollView style={styles.jsonContainer} horizontal>
              <Text selectable style={styles.jsonText}>
                {JSON.stringify(events, null, 2)}
              </Text>
            </ScrollView>
          )}

          {activeTab === 'SUMMARY' && (
            <View style={styles.summaryContainer}>
              {summaryData ? (
                <ScrollView horizontal>
                  <Text selectable style={styles.jsonText}>
                    {JSON.stringify(summaryData, null, 2)}
                  </Text>
                </ScrollView>
              ) : (
                <Text style={styles.emptyStreamText}>
                  Tap {"'"}Fetch Summary{"'"} above to query /v1/summary from FastAPI backend.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kicker: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  title: {
    ...typography.h3,
    fontSize: 19,
    color: colors.textPrimary,
  },
  noticePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricItem: {
    flex: 1,
    minWidth: 110,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricValueMono: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricValueHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  probeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  probePill: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  probePillPassed: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  probePillFailed: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  probePillKey: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  probePillVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  diagnosisDetails: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  verdictDone: {
    color: colors.primary,
    fontWeight: '800',
  },
  bktRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bktCard: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  bktLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  bktPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  bktRaw: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  airplaneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  airplaneText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  queueStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  queueStatItem: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  queueStatNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  queueStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  backendRow: {
    marginBottom: spacing.sm,
  },
  backendUrl: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionBtnDanger: {
    flex: 0.9,
    backgroundColor: colors.errorLight,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  actionBtnDangerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.error,
  },
  streamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  tabBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  refreshIconBtn: {
    padding: 4,
  },
  refreshIconText: {
    fontSize: 14,
  },
  streamContainer: {
    maxHeight: 280,
    gap: 6,
  },
  emptyStreamText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  eventRow: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badgeNode: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeNodeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  eventAction: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  eventSeq: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  statusAcked: {
    backgroundColor: colors.successLight,
  },
  statusPending: {
    backgroundColor: colors.warningLight,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaHash: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: colors.textMuted,
  },
  metaMastery: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  metaTime: {
    fontSize: 9,
    color: colors.textMuted,
  },
  jsonContainer: {
    maxHeight: 280,
    backgroundColor: '#0F172A',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38BDF8',
  },
  summaryContainer: {
    maxHeight: 280,
    backgroundColor: '#0F172A',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
});
