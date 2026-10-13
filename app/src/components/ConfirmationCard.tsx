import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

interface ConfirmationCardProps {
  question: string;
  questionOr?: string;
  options: Array<{ id: string; label: string; text: string }>;
  selectedOptionId?: string | null;
  onSelect: (optionId: string) => void;
  onContinue: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  question,
  questionOr,
  options,
  selectedOptionId,
  onSelect,
  onContinue,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>ONE QUICK CHECK</Text>
        <Text style={styles.icon}>🎯</Text>
      </View>

      <Text style={styles.heading}>Let's check one more thing together</Text>
      <Text style={styles.subheading}>ଆଉ ଗୋଟିଏ ପ୍ରଶ୍ନ ଦେଖିବା</Text>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{question}</Text>
        {questionOr && <Text style={styles.questionOrText}>{questionOr}</Text>}
      </View>

      <View style={styles.optionsList}>
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <Pressable
              key={opt.id}
              style={[styles.optionItem, isSelected && styles.optionItemSelected]}
              onPress={() => onSelect(opt.id)}
              accessibilityRole="button"
            >
              <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                <Text style={styles.badgeText}>{opt.label}</Text>
              </View>
              <Text style={styles.optText}>{opt.text}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.continueButton, !selectedOptionId && styles.buttonDisabled]}
        disabled={!selectedOptionId}
        onPress={onContinue}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Check My Understanding</Text>
      </Pressable>
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
  },
  kicker: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  icon: {
    fontSize: 20,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  questionBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  questionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  questionOrText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#0a3325',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeSelected: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  optText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    color: '#07111f',
  },
});
