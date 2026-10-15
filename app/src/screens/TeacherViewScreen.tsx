import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import type { RootStackParamList } from '../../App';
import { listEvents, subscribeDatabase } from '../db/database';
import {
  getTeacherSnapshot,
  getOnlineSummary,
  type TeacherSnapshot,
} from '../db/queries/teacherQueries';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

type TeacherViewRouteParams = {
  profileId?: string;
};

// Compatible with RootStackParamList once Satya merges the route registration
type Props = {
  route?: { params?: TeacherViewRouteParams };
  navigation?: any;
};

const PIN_STORE_KEY = 'teacher_lockout_until';
const CORRECT_PIN = '1234';

export function TeacherViewScreen({ route, navigation }: Props) {
  const profileId = (route?.params as any)?.profileId ?? 'prof_demo_01';

  // PIN Gate State
  const [locked, setLocked] = useState(true);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);
  const [pinError, setPinError] = useState<string | null>(null);

  // Snapshot State
  const [snapshot, setSnapshot] = useState<TeacherSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverStatusMessage, setServerStatusMessage] = useState<string | null>(null);

  // Load persistent lockout on mount
  useEffect(() => {
    async function loadLockout() {
      try {
        let storedVal: string | null = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          storedVal = window.localStorage.getItem(PIN_STORE_KEY);
        } else {
          storedVal = await SecureStore.getItemAsync(PIN_STORE_KEY);
        }
        if (storedVal) {
          const until = parseInt(storedVal, 10);
          if (until > Date.now()) {
            setLockoutUntil(until);
          }
        }
      } catch {
        // Safe fallback
      }
    }
    loadLockout();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingLockSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.ceil((lockoutUntil - now) / 1000);
      if (diff <= 0) {
        setLockoutUntil(null);
        setRemainingLockSeconds(0);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(PIN_STORE_KEY);
          } else {
            SecureStore.deleteItemAsync(PIN_STORE_KEY);
          }
        } catch {}
      } else {
        setRemainingLockSeconds(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Load snapshot from local SQLite
  const reloadLocal = useCallback(async () => {
    try {
      const events = await listEvents(500);
      const snap = getTeacherSnapshot(events, profileId);
      setSnapshot(snap);
    } catch {
      // Safe fallback
    }
  }, [profileId]);

  useEffect(() => {
    if (!locked) {
      reloadLocal();
      const unsub = subscribeDatabase(() => reloadLocal());
      return unsub;
    }
  }, [locked, reloadLocal]);

  // PIN Submit Handler
  const handlePinSubmit = async () => {
    if (lockoutUntil && Date.now() < lockoutUntil) return;

    if (enteredPin === CORRECT_PIN) {
      setLocked(false);
      setPinError(null);
      setPinAttempts(0);
      return;
    }

    const nextAttempts = pinAttempts + 1;
    setPinAttempts(nextAttempts);
    setEnteredPin('');

    if (nextAttempts % 5 === 0) {
      // Cycle: 60s, 120s, 240s, 480s doubling
      const cycleIndex = Math.min(Math.floor(nextAttempts / 5) - 1, 4);
      const lockDurationMs = 60_000 * Math.pow(2, cycleIndex);
      const until = Date.now() + lockDurationMs;

      setLockoutUntil(until);
      setPinError(`Too many incorrect attempts. Locked for ${Math.round(lockDurationMs / 1000)}s.`);

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(PIN_STORE_KEY, until.toString());
        } else {
          await SecureStore.setItemAsync(PIN_STORE_KEY, until.toString());
        }
      } catch {}
    } else {
      setPinError(`Incorrect PIN. ${5 - (nextAttempts % 5)} attempts remaining before lockout.`);
    }
  };

  // Online Server Sync Refresh
  const handleServerRefresh = async () => {
    setIsRefreshing(true);
    setServerStatusMessage(null);
    try {
      let token = '';
      if (typeof window !== 'undefined' && window.localStorage) {
        token = window.localStorage.getItem('device_token') || '';
      } else {
        token = (await SecureStore.getItemAsync('device_token')) || '';
      }

      const remoteData = await getOnlineSummary(profileId, token);
      if (remoteData) {
        setSnapshot((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            perConceptMastery: remoteData.perConceptMastery?.length
              ? remoteData.perConceptMastery
              : prev.perConceptMastery,
            labelCounts: {
              ...prev.labelCounts,
              confirmed: {
                ...prev.labelCounts.confirmed,
                ...(remoteData.labelCounts?.confirmed || {}),
              },
            },
          };
        });
        setServerStatusMessage('Successfully enriched with server telemetry');
      } else {
        setServerStatusMessage('Server offline or unreachable — local SQLite telemetry active');
      }
    } catch {
      setServerStatusMessage('Server sync skipped — local SQLite telemetry active');
    } finally {
      setIsRefreshing(false);
    }
  };

  // =========================================================================
  // RENDER: Locked View (PIN Gate)
  // =========================================================================
  if (locked) {
    const isLockedOut = !!lockoutUntil && remainingLockSeconds > 0;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.pinContainer}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>TEACHER ACCESS • ଶିକ୍ଷକ ଦ୍ୱାର</Text>
          </View>

          <Text style={styles.pinTitle}>Enter Teacher PIN</Text>
          <Text style={styles.pinSubtitle}>
            Classroom diagnostics & mastery telemetry require teacher authorization.
          </Text>

          {isLockedOut ? (
            <View style={styles.lockoutBox}>
              <Text style={styles.lockoutIcon}>🔒</Text>
              <Text style={styles.lockoutTitle}>Access Locked</Text>
              <Text style={styles.lockoutTimer}>
                Try again in {remainingLockSeconds} seconds
              </Text>
            </View>
          ) : (
            <View style={styles.pinForm}>
              <TextInput
                style={styles.pinInput}
                value={enteredPin}
                onChangeText={setEnteredPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textDisabled}
                autoFocus
              />

              {pinError && <Text style={styles.errorText}>{pinError}</Text>}

              <TouchableOpacity
                style={[styles.primaryButton, enteredPin.length !== 4 && styles.buttonDisabled]}
                onPress={handlePinSubmit}
                disabled={enteredPin.length !== 4}
              >
                <Text style={styles.primaryButtonText}>Unlock View</Text>
              </TouchableOpacity>

              {__DEV__ && (
                <Text style={styles.devHint}>Demo PIN: 1234</Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Return to Learner Screen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // RENDER: Unlocked Classroom Diagnostics View
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SECTION 1 — Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>TEACHER CONSOLE</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Learner Diagnostics</Text>
            <Text style={styles.subtitle}>Profile: {profileId}</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleServerRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.refreshButtonText}>↻ Refresh Server</Text>
            )}
          </TouchableOpacity>
        </View>

        {serverStatusMessage && (
          <View style={styles.noticeBanner}>
            <Text style={styles.noticeText}>{serverStatusMessage}</Text>
          </View>
        )}

        {/* Quick-Launch: Manage Offline Subject Packs & Resources */}
        <TouchableOpacity
          style={styles.resourceManagerCard}
          onPress={() => navigation?.navigate?.('ResourceManager')}
          activeOpacity={0.8}
        >
          <View style={styles.rmCardHeader}>
            <Text style={styles.rmCardIcon}>📦</Text>
            <View style={styles.rmCardTitleCol}>
              <Text style={styles.rmCardTitle}>Manage Offline Subject Packs & Resources</Text>
              <Text style={styles.rmCardSubtitle}>
                ପାଠ୍ୟ ଉପକରଣ ଓ ଅଫଲାଇନ୍ ପ୍ୟାକ୍ · 4 REFLECT Guardrails · SHA-256 Verifier
              </Text>
            </View>
            <View style={styles.rmCardBadge}>
              <Text style={styles.rmCardBadgeText}>BSE Odisha →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* SECTION 2 — Mastery (Concept & Term) */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>MASTERY BREAKDOWN (BKT)</Text>

          <Text style={styles.subHeader}>Concepts</Text>
          {snapshot?.perConceptMastery && snapshot.perConceptMastery.length > 0 ? (
            snapshot.perConceptMastery.map((c) => (
              <View key={c.conceptId} style={styles.dataRow}>
                <Text style={styles.itemLabel}>{c.conceptId}</Text>
                <Text style={styles.itemValue}>{c.mastery.toFixed(4)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No concept updates recorded yet</Text>
          )}

          <Text style={[styles.subHeader, { marginTop: spacing.md }]}>Glossary Terms</Text>
          {snapshot?.perTermMastery && snapshot.perTermMastery.length > 0 ? (
            snapshot.perTermMastery.map((t) => (
              <View key={t.termId} style={styles.dataRow}>
                <Text style={styles.itemLabel}>{t.termId}</Text>
                <Text style={styles.itemValue}>{t.mastery.toFixed(4)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No term mastery updates recorded yet</Text>
          )}

          <Text style={styles.footnote}>
            Rule-based prototype estimate. Parameters assumed, not calibrated.
          </Text>
        </View>

        {/* SECTION 3 — Label Counts */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>DIAGNOSTIC LABEL AGGREATION</Text>

          <Text style={styles.subHeader}>Provisional (Threshold = 1)</Text>
          {snapshot?.labelCounts?.provisional &&
          Object.keys(snapshot.labelCounts.provisional).length > 0 ? (
            Object.entries(snapshot.labelCounts.provisional).map(([label, count]) => (
              <View key={label} style={styles.dataRow}>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemBadge}>{count}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Zero provisional labels</Text>
          )}

          <Text style={[styles.subHeader, { marginTop: spacing.md }]}>
            Confirmed (Threshold = 2)
          </Text>
          {snapshot?.labelCounts?.confirmed &&
          Object.keys(snapshot.labelCounts.confirmed).length > 0 ? (
            Object.entries(snapshot.labelCounts.confirmed).map(([label, count]) => (
              <View key={label} style={styles.dataRow}>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemBadgeSuccess}>{count}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Zero confirmed labels</Text>
          )}

          <View style={[styles.dataRow, { marginTop: spacing.md, borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.sm }]}>
            <Text style={styles.itemLabelBold}>Abstentions (INCONSISTENT)</Text>
            <Text style={styles.itemValueBold}>{snapshot?.labelCounts?.abstained ?? 0}</Text>
          </View>
        </View>

        {/* SECTION 4 — Sync Status */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>EDGE SYNC QUEUE</Text>
          <View style={styles.syncGrid}>
            <View style={styles.syncCol}>
              <Text style={styles.syncCount}>{snapshot?.syncStatus?.PENDING ?? 0}</Text>
              <Text style={styles.syncLabel}>PENDING</Text>
            </View>
            <View style={styles.syncCol}>
              <Text style={[styles.syncCount, { color: colors.secondary }]}>
                {snapshot?.syncStatus?.ACKED ?? 0}
              </Text>
              <Text style={styles.syncLabel}>ACKED</Text>
            </View>
            <View style={styles.syncCol}>
              <Text style={[styles.syncCount, { color: colors.attention }]}>
                {snapshot?.syncStatus?.ERROR ?? 0}
              </Text>
              <Text style={styles.syncLabel}>ERROR</Text>
            </View>
            <View style={styles.syncCol}>
              <Text style={[styles.syncCount, { color: colors.textDisabled }]}>
                {snapshot?.syncStatus?.REJECTED ?? 0}
              </Text>
              <Text style={styles.syncLabel}>REJECTED</Text>
            </View>
          </View>
        </View>

        {/* SECTION 5 — Honest Disclosure (Adjustment 1) */}
        <View style={styles.disclosureCard}>
          <Text style={styles.disclosureTitle}>System Architecture Disclosure</Text>
          <Text style={styles.disclosureBody}>
            Additional state (reading_load, audio_first, teacher flags) is tracked in engine memory only in this build. Full persistence lands post-pilot.
          </Text>
        </View>

        {/* SECTION 6 — Metadata */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>METADATA & EXECUTION PROVENANCE</Text>
          <View style={styles.dataRow}>
            <Text style={styles.itemLabel}>Total Events Recorded</Text>
            <Text style={styles.itemValue}>{snapshot?.totalEvents ?? 0}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.itemLabel}>Distinct Diagnostic Episodes</Text>
            <Text style={styles.itemValue}>{snapshot?.totalEpisodes ?? 0}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.itemLabel}>Active Pack Hash</Text>
            <Text style={styles.itemMono}>
              {snapshot?.packHash ? snapshot.packHash.slice(0, 12) : 'e3b0c44298fc'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.itemLabel}>Engine Version</Text>
            <Text style={styles.itemMono}>{snapshot?.engineVersion ?? '1.0.0'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default TeacherViewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pinContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerBadgeText: {
    color: colors.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pinTitle: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  pinSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  pinForm: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  pinInput: {
    width: '100%',
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.bodySmall.fontSize,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    ...shadows.subtle,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  devHint: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontStyle: 'italic',
  },
  lockoutBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  lockoutIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  lockoutTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  lockoutTimer: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  backButton: {
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backLink: {
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    ...shadows.subtle,
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  noticeBanner: {
    backgroundColor: colors.surfaceSubtle,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radius.xs,
    marginBottom: spacing.md,
  },
  noticeText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  resourceManagerCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  rmCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rmCardIcon: {
    fontSize: 26,
    marginRight: spacing.sm,
  },
  rmCardTitleCol: {
    flex: 1,
  },
  rmCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  rmCardSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  rmCardBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginLeft: spacing.xs,
  },
  rmCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  subHeader: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  itemLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  itemLabelBold: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  itemValueBold: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  itemBadgeSuccess: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: colors.secondary,
  },
  itemMono: {
    fontFamily: typography.mono.fontFamily,
    fontSize: typography.mono.fontSize,
    color: colors.textMuted,
  },
  footnote: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  syncGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
  },
  syncCol: {
    alignItems: 'center',
  },
  syncCount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  syncLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  disclosureCard: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  disclosureTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  disclosureBody: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textDisabled,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
});
