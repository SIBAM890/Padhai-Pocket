import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

export interface PictureChoice {
  id: string;
  visualIcon?: string;
  label?: string;
  text?: string;
}

interface PictureProbeProps {
  prompt: string;
  promptOr?: string;
  choices: PictureChoice[];
  selectedChoiceId?: string | null;
  onSelect: (choiceId: string) => void;
}

export const PictureProbe: React.FC<PictureProbeProps> = ({
  prompt,
  promptOr,
  choices,
  selectedChoiceId,
  onSelect,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>PICTURE PROBE (ଚିତ୍ର ଯାଞ୍ଚ)</Text>
      </View>

      <Text style={styles.prompt}>{prompt}</Text>
      {promptOr && <Text style={styles.promptOr}>{promptOr}</Text>}

      <View style={styles.choicesGrid}>
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <Pressable
              key={choice.id}
              style={[styles.choiceCard, isSelected && styles.choiceCardSelected]}
              onPress={() => onSelect(choice.id)}
              accessibilityRole="button"
              accessibilityLabel={`${choice.label ?? ''} ${choice.text ?? ''}`}
            >
              {choice.visualIcon && (
                <Text style={styles.visualIcon}>{choice.visualIcon}</Text>
              )}
              {choice.label && <Text style={styles.choiceLabel}>{choice.label}</Text>}
              {choice.text && <Text style={styles.choiceText}>{choice.text}</Text>}
            </Pressable>
          );
        })}
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#064e3b',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '800',
  },
  prompt: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  promptOr: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 4,
    marginTop: spacing.xs,
  },
  choiceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 110,
  },
  choiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#0a3325',
  },
  visualIcon: {
    fontSize: 34,
    marginBottom: spacing.xs,
  },
  choiceLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  choiceText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
