import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

interface RemediationCardProps {
  conceptTitle: string;
  explanation: string;
  explanationOr?: string;
  visualSummary?: string;
  onListen: () => void;
  onTryAgain: () => void;
  onContinue: () => void;
}

export const RemediationCard: React.FC<RemediationCardProps> = ({
  conceptTitle,
  explanation,
  explanationOr,
  visualSummary = '🚶‍♂️ 3m East  ➔  🚩 Turn  ➔  🚶‍♂️ 3m West  =  0m Difference from start!',
  onListen,
  onTryAgain,
  onContinue,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>LET'S LEARN THIS TOGETHER</Text>
        <Text style={styles.starIcon}>💡</Text>
      </View>

      <Text style={styles.title}>{conceptTitle}</Text>

      {/* Visual illustration of concept */}
      <View style={styles.visualBox}>
        <Text style={styles.visualText}>{visualSummary}</Text>
      </View>

      <Text style={styles.explanation}>{explanation}</Text>
      {explanationOr && <Text style={styles.explanationOr}>{explanationOr}</Text>}

      {/* Primary Actions */}
      <View style={styles.actionsColumn}>
        <Pressable style={styles.listenButton} onPress={onListen}>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kicker: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  starIcon: {
    fontSize: 20,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  visualBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  visualText: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  explanation: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 24,
  },
  explanationOr: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  actionsColumn: {
    marginTop: spacing.lg,
    gap: spacing.sm + 2,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064e3b',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  listenIcon: {
    fontSize: 18,
  },
  listenText: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 15,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  tryAgainBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tryAgainText: {
    ...typography.button,
    color: colors.textSecondary,
    fontSize: 14,
  },
  continueBtn: {
    backgroundColor: colors.primary,
  },
  continueText: {
    ...typography.button,
    color: '#07111f',
    fontSize: 14,
  },
});
