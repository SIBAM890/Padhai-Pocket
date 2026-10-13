import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface RemediationCardProps {
  conceptTitle?: string;
  explanation: string;
  explanationOr?: string;
  visualSummary?: string;
  onListen: () => void;
  onTryAgain: () => void;
  onContinue: () => void;
}

export const RemediationCard: React.FC<RemediationCardProps> = ({
  conceptTitle = 'Understanding Displacement (ବିସ୍ଥାପନ)',
  explanation = 'Displacement is the straight-line distance between where you started and where you ended. If you walk 3 meters forward and 3 meters backward, you end up right at the starting line: 0 meters!',
  explanationOr = 'ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।',
  visualSummary = '🚶‍♂️ 3m East  ➔  🚩 Turn  ➔  🚶‍♂️ 3m West  =  0m Difference from start!',
  onListen,
  onTryAgain,
  onContinue,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>LET'S LEARN THIS TOGETHER</Text>
      </View>

      <Text style={styles.title}>{conceptTitle}</Text>

      {/* Visual illustration box */}
      <View style={styles.visualBox}>
        <Text style={styles.visualText}>{visualSummary}</Text>
      </View>

      <Text style={styles.explanation}>{explanation}</Text>
      {explanationOr && <Text style={styles.explanationOr}>{explanationOr}</Text>}

      <View style={styles.actionsColumn}>
        <Pressable style={styles.listenBtn} onPress={onListen}>
          <Text style={styles.listenIcon}>🔊</Text>
          <Text style={styles.listenText}>Listen in Odia (ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ)</Text>
        </Pressable>

        <View style={styles.rowButtons}>
          <Pressable style={[styles.btn, styles.tryAgainBtn]} onPress={onTryAgain}>
            <Text style={styles.tryAgainText}>Try Another Question</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.continueBtn]} onPress={onContinue}>
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
  },
  listenIcon: {
    fontSize: 18,
  },
  listenText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.secondary,
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
