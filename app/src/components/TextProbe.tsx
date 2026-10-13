import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { MCQOption, type OptionState } from './MCQOption';

export interface TextChoice {
  id: string;
  label: string;
  text: string;
}

interface TextProbeProps {
  prompt: string;
  promptOr?: string;
  choices: TextChoice[];
  selectedChoiceId?: string | null;
  onSelect: (choiceId: string) => void;
}

export const TextProbe: React.FC<TextProbeProps> = ({
  prompt,
  promptOr,
  choices,
  selectedChoiceId,
  onSelect,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>TEXT PROBE (ପାଠ ଯାଞ୍ଚ)</Text>
      </View>

      <Text style={styles.prompt}>{prompt}</Text>
      {promptOr && <Text style={styles.promptOr}>{promptOr}</Text>}

      <View style={styles.choicesList}>
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const optionState: OptionState = isSelected ? 'SELECTED' : 'DEFAULT';
          return (
            <MCQOption
              key={choice.id}
              label={choice.label}
              text={choice.text}
              state={optionState}
              onPress={() => onSelect(choice.id)}
            />
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
    backgroundColor: '#312e81',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: '#a5b4fc',
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
  choicesList: {
    marginTop: spacing.xs,
  },
});
