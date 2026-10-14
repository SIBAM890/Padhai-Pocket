import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { MCQOption } from './MCQOption';

interface TextChoice {
  id: string;
  label: string;
  text: string;
}

interface TextProbeProps {
  title?: string;
  titleOr?: string;
  prompt: string;
  promptOr?: string;
  choices: TextChoice[];
  selectedChoiceId?: string | null;
  onSelect: (choiceId: string) => void;
}

export const TextProbe: React.FC<TextProbeProps> = ({
  title = 'Definition Concept Check',
  titleOr = 'ସଂଜ୍ଞା ଯାଞ୍ଚ',
  prompt,
  promptOr,
  choices,
  selectedChoiceId,
  onSelect,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>CONCEPT CHECK</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      {titleOr && <Text style={styles.titleOr}>{titleOr}</Text>}

      <Text style={styles.prompt}>{prompt}</Text>
      {promptOr && <Text style={styles.promptOr}>{promptOr}</Text>}

      <View style={styles.choicesList}>
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <MCQOption
              key={choice.id}
              label={choice.label}
              text={choice.text}
              state={isSelected ? 'selected' : 'default'}
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
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  titleOr: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  prompt: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  promptOr: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  choicesList: {
    marginTop: spacing.xs,
  },
});
