import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

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
      <View style={styles.badge}>
        <Text style={styles.badgeText}>LET'S CHECK ONE MORE THING</Text>
      </View>

      <Text style={styles.title}>A quick follow-up to solidify your concept</Text>
      <Text style={styles.titleOr}>ଆଉ ଗୋଟିଏ ପ୍ରଶ୍ନ ଦେଖିବା</Text>

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
              <View style={[styles.badgeCircle, isSelected && styles.badgeCircleSelected]}>
                <Text style={[styles.badgeLabel, isSelected && styles.badgeLabelSelected]}>
                  {opt.label}
                </Text>
              </View>
              <Text style={[styles.optText, isSelected && styles.optTextSelected]}>
                {opt.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.continueBtn, !selectedOptionId && styles.btnDisabled]}
        disabled={!selectedOptionId}
        onPress={onContinue}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>Check Understanding ➔</Text>
      </Pressable>
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  titleOr: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  questionBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
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
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  badgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeCircleSelected: {
    backgroundColor: colors.primary,
  },
  badgeLabel: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgeLabelSelected: {
    color: '#FFFFFF',
  },
  optText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  optTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    ...typography.button,
  },
});
