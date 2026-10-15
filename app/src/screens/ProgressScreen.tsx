import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

import { listEvents, subscribeDatabase } from '../db/database';
import { computeStreakData } from '../utils/streakHelper';
import {
  getProgressSnapshot,
  phaseFromMastery,
  ProgressSnapshot,
  Phase,
} from '../db/queries/progressQueries';
import { StreakGrid } from '../components/StreakGrid';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { t } from '../utils/stringsLoader';
import { computeStudentProgress, type StudentProgressSnapshot } from '../engine';
import { BktTrajectoryChart } from '../components/BktTrajectoryChart';
import { TermMasteryBarChart } from '../components/TermMasteryBarChart';
import { ModalityRadarChart } from '../components/ModalityRadarChart';

/**
 * ProgressScreen — child-safe progress & pace dashboard.
 *
 * FR-13: never renders "wrong", "gap", "diagnosis", English stack traces, or red banners.
 * FR-30: derives mastery from events.
 * Offline-safe: reads exclusively from local SQLite.
 */

const COPY = {
  title_or: 'ମୋର ଶିକ୍ଷା',
  title_en: 'My Learning',
  back_or: '← ପଛକୁ',
  current_label_or: 'ଏବେ ଶିଖୁଛ',
  current_topic_or: 'Motion — Distance vs. Displacement',
  phase_label_or: 'ପର୍ଯ୍ୟାୟ',
  streak_label_or: 'ଧାରା',
  days_one: 'ଦିନ',
  days_many: 'ଦିନ ଧରି',
  best_label_or: 'ତୁମର ସର୍ବୋତ୍ତମ',
  best_suffix_or: '% ଆଗେଇଛ',
  next_cta_or: 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ →',
  next_cta_en: 'Continue learning',
  next_cta_harder_or: 'ଅଧିକ ପ୍ରଶ୍ନ ଚେଷ୍ଟା କର →',
  next_cta_harder_en: 'Try a harder question',
  empty_or: 'ଆରମ୍ଭ କରିବା ପାଇଁ ଗୋଟିଏ ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଅ।',
} as const;

const PHASES: Record<Phase, { or: string; en: string; icon: string }> = {
  exploring:  { or: 'ଆରମ୍ଭ କରୁଛୁ',  en: 'Just started',       icon: '🌱' },
  learning:   { or: 'ଶିଖୁଛୁ',        en: 'Learning',           icon: '📖' },
  practising: { or: 'ଅଭ୍ୟାସ କରୁଛୁ',   en: 'Practising',         icon: '✏️' },
  confident:  { or: 'ଆତ୍ମବିଶ୍ୱାସୀ',  en: 'Getting confident',  icon: '⭐' },
};

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

export function ProgressScreen({ route, navigation }: Props) {
  const profileId = route?.params?.profileId ?? 'prof_demo_01';
  const onBack = () => navigation.goBack();
  const onNext = () => (navigation as any).navigate('Learn', { profileId });

  const [snap, setSnap] = useState<ProgressSnapshot | null>(null);
  const [gridData, setGridData] = useState<any[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [minutesThisWeek, setMinutesThisWeek] = useState(0);
  const [studentProgress, setStudentProgress] = useState<StudentProgressSnapshot | null>(null);

  const reload = useCallback(async () => {
    try {
      const events = await listEvents(500);
      setSnap(getProgressSnapshot(events, profileId));
      try {
        setStudentProgress(computeStudentProgress(profileId, events));
      } catch {
        setStudentProgress(null);
      }

      // Profile-specific streak computation: filter only this profile's events
      try {
        const mine = events.filter((e) => e.profile_id === profileId);
        const sc = computeStreakData(mine);
        setGridData(sc?.gridData ?? []);
        setStreakDays(sc?.streakDays ?? 0);
        setMinutesThisWeek(sc?.minutesThisWeek ?? 0);
      } catch {
        setGridData([]);
        setStreakDays(0);
        setMinutesThisWeek(0);
      }
    } catch {
      setSnap({
        highWaterMastery: 0,
        currentMastery: 0,
        totalEvents: 0,
        masteryEventCount: 0,
        firstEventISO: null,
        lastEventISO: null,
        uniqueDays: 0,
      });
      setGridData([]);
      setStreakDays(0);
      setMinutesThisWeek(0);
    }
  }, [profileId]);

  useEffect(() => {
    reload();
    const unsub = subscribeDatabase(() => reload());
    return unsub;
  }, [reload]);

  if (!snap) {
    return (
      <View style={styles.root}>
        <Text style={styles.loadingText}>{COPY.title_or}</Text>
      </View>
    );
  }

  const phase = phaseFromMastery(snap.highWaterMastery);
  const phaseInfo = PHASES[phase];
  const masteryPct = Math.round(snap.highWaterMastery * 100);
  const hasActivity = snap.totalEvents > 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backTxt}>{COPY.back_or}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.h1}>{t('progress_title', COPY.title_or)}</Text>
      <Text style={styles.sub}>{COPY.title_en}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{COPY.current_label_or}</Text>
        <Text style={styles.cardTitle}>{COPY.current_topic_or}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>{COPY.phase_label_or}</Text>
          <Text style={styles.phaseIcon}>{phaseInfo.icon}</Text>
          <Text style={styles.phaseTxt}>{phaseInfo.or}</Text>
          <Text style={styles.phaseSub}>{phaseInfo.en}</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>{COPY.streak_label_or}</Text>
          <Text style={styles.streakNum}>{streakDays}</Text>
          <Text style={styles.phaseSub}>
            {streakDays === 1 ? COPY.days_one : COPY.days_many}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{COPY.best_label_or}</Text>
        <View style={styles.barOuter}>
          <View style={[styles.barInner, { width: `${masteryPct}%` }]} />
        </View>
        <Text style={styles.barCaption}>
          {masteryPct}{COPY.best_suffix_or}
        </Text>
      </View>

      {/* StreakGrid rendered directly without outer card wrapper to prevent double-card nesting */}
      {gridData.length > 0 && (
        <StreakGrid
          streakDays={streakDays}
          minutesThisWeek={minutesThisWeek}
          gridData={gridData}
        />
      )}

      {/* High Quality Graphs */}
      {studentProgress && (
        <View style={styles.chartsContainer}>
          <BktTrajectoryChart
            history={studentProgress.concepts[0]?.history || [0.42]}
            conceptTitle={studentProgress.concepts[0]?.title_en}
            conceptTitleOr={studentProgress.concepts[0]?.title_or}
          />
          <TermMasteryBarChart terms={studentProgress.terms} />
          <ModalityRadarChart modalities={studentProgress.modalities} />
        </View>
      )}

      <TouchableOpacity
        onPress={onNext}
        style={styles.cta}
        disabled={!onNext}
      >
        <Text style={styles.ctaTxt}>
          {phase === 'confident' ? COPY.next_cta_harder_or : COPY.next_cta_or}
        </Text>
        <Text style={styles.ctaSub}>
          {phase === 'confident' ? COPY.next_cta_harder_en : COPY.next_cta_en}
        </Text>
      </TouchableOpacity>

      {!hasActivity && (
        <Text style={styles.emptyHint}>{COPY.empty_or}</Text>
      )}
    </ScrollView>
  );
}

export default ProgressScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pad: {
    padding: spacing.md + spacing.xs,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  loadingText: {
    padding: spacing.lg,
    fontSize: typography.bodyLarge.fontSize,
    color: colors.textPrimary,
  },
  backBtn: {
    marginBottom: spacing.sm + spacing.xs,
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },
  backTxt: {
    fontSize: typography.body.fontSize,
    color: colors.primary,
    fontWeight: '600',
  },
  h1: {
    fontSize: typography.appTitle.fontSize,
    fontWeight: typography.appTitle.fontWeight,
    color: colors.textPrimary,
    lineHeight: typography.appTitle.lineHeight,
  },
  sub: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm + spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  half: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  cardLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.xs + 2,
    letterSpacing: typography.caption.letterSpacing,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: typography.cardHeading.fontSize,
    fontWeight: typography.cardHeading.fontWeight,
    color: colors.textPrimary,
  },
  phaseIcon: {
    fontSize: 32,
    marginVertical: spacing.xs,
  },
  phaseTxt: {
    fontSize: typography.cardHeading.fontSize,
    fontWeight: typography.cardHeading.fontWeight,
    color: colors.textPrimary,
  },
  phaseSub: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  streakNum: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.accent,
    lineHeight: 44,
  },
  barOuter: {
    height: 14,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xs + 1,
    overflow: 'hidden',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  barInner: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.xs + 1,
  },
  barCaption: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.button,
    marginTop: spacing.sm,
    alignItems: 'center',
    ...shadows.subtle,
  },
  ctaTxt: {
    color: colors.textOnPrimary,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  ctaSub: {
    color: colors.primaryLight,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  emptyHint: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
    fontSize: typography.bodySmall.fontSize,
  },
  chartsContainer: {
    gap: spacing.md,
    marginVertical: spacing.md,
  },
});
