import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { playOdiaVoice, stopOdiaAudio } from '../audio/odiaAudio';

interface RemediationCardProps {
  conceptTitle?: string;
  explanation: string;
  explanationOr?: string;
  visualSummary?: string;
  resourceId?: string;
  resourceModality?: string;
  resourceReasons?: string[];
  matchScore?: number;
  onListen?: () => void;
  onTryAgain: () => void;
  onContinue: () => void;
}

export const RemediationCard: React.FC<RemediationCardProps> = ({
  conceptTitle = 'Understanding Displacement (ବିସ୍ଥାପନ)',
  explanation = 'Displacement is the straight-line distance between where you started and where you ended. If you walk 3 meters forward and 3 meters backward, you end up right at the starting line: 0 meters!',
  explanationOr = 'ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।',
  visualSummary = '🚶‍♂️ 3m East  ➔  🚩 Turn  ➔  🚶‍♂️ 3m West  =  0m Difference from start!',
  resourceId,
  resourceModality,
  resourceReasons,
  matchScore,
  onListen,
  onTryAgain,
  onContinue,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      stopOdiaAudio();
    };
  }, []);

  const handleListen = () => {
    if (isPlaying) {
      stopOdiaAudio();
      setIsPlaying(false);
      return;
    }
    if (onListen) {
      onListen();
    }
    setIsPlaying(true);
    playOdiaVoice({
      key: 'remediation',
      text: explanationOr || explanation,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LET'S LEARN THIS TOGETHER</Text>
        </View>
        {resourceId && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>
              🎯 {resourceModality ? resourceModality.toUpperCase().replace('_', ' ') : 'MATCH'} • {resourceId} ({matchScore ?? 100} pts)
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{conceptTitle}</Text>

      {resourceReasons && resourceReasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsLabel}>Why this lesson was selected:</Text>
          <View style={styles.reasonsRow}>
            {resourceReasons.map((r, idx) => (
              <View key={idx} style={styles.reasonPill}>
                <Text style={styles.reasonText}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Visual illustration box */}
      <View style={styles.visualBox}>
        <Text style={styles.visualText}>{visualSummary}</Text>
      </View>

      <Text style={styles.explanation}>{explanation}</Text>
      {explanationOr && <Text style={styles.explanationOr}>{explanationOr}</Text>}

      <View style={styles.actionsColumn}>
        <Pressable
          style={[styles.listenBtn, isPlaying && styles.listenBtnPlaying]}
          onPress={handleListen}
          accessibilityRole="button"
          accessibilityLabel="Listen in Pure Odia Dialect"
        >
          <Text style={styles.listenIcon}>{isPlaying ? '🔊' : '▶️'}</Text>
          <Text style={[styles.listenText, isPlaying && styles.listenTextPlaying]}>
            {isPlaying ? 'ଶୁଣୁଛନ୍ତି... (Playing Pure Odia)' : 'Listen in Odia (ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ)'}
          </Text>
        </Pressable>

        <View style={styles.rowButtons}>
          <Pressable
            style={[styles.btn, styles.tryAgainBtn]}
            onPress={() => {
              stopOdiaAudio();
              onTryAgain();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.tryAgainText}>Try Another Question</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.continueBtn]}
            onPress={() => {
              stopOdiaAudio();
              onContinue();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
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
    marginBottom: spacing.md,
    ...shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  matchBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  reasonsContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reasonPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reasonText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: '#B45309',
    fontWeight: '800',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  visualBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  visualText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  explanation: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 25,
  },
  explanationOr: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 22,
  },
  actionsColumn: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.button,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listenBtnPlaying: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  listenIcon: {
    fontSize: 18,
  },
  listenText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.secondary,
  },
  listenTextPlaying: {
    color: '#15803D',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryAgainBtn: {
    backgroundColor: '#F1F5F9',
  },
  tryAgainText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 14,
  },
  continueBtn: {
    backgroundColor: colors.primary,
  },
  continueText: {
    ...typography.button,
    fontSize: 14,
  },
});
