import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface PictureChoice {
  id: string;
  icon?: string;
  label?: string;
  desc?: string;
}

interface PictureProbeProps {
  title?: string;
  titleOr?: string;
  prompt: string;
  choices: PictureChoice[];
  selectedChoiceId?: string | null;
  onSelect: (choiceId: string) => void;
}

export const PictureProbe: React.FC<PictureProbeProps> = ({
  title = 'Visual Exploration',
  titleOr = 'ଚିତ୍ର ଦେଖି ବାଛନ୍ତୁ',
  prompt,
  choices,
  selectedChoiceId,
  onSelect,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>PICTURE ACTIVITY</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      {titleOr && <Text style={styles.titleOr}>{titleOr}</Text>}

      <Text style={styles.prompt}>{prompt}</Text>

      {/* Balanced 3-column card row without giant empty vertical space */}
      <View style={styles.choicesRow}>
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <Pressable
              key={choice.id}
              style={[styles.choiceCard, isSelected && styles.choiceCardSelected]}
              onPress={() => onSelect(choice.id)}
              accessibilityRole="button"
              accessibilityLabel={`${choice.label ?? ''}: ${choice.desc ?? ''}`}
            >
              {choice.icon && <Text style={styles.icon}>{choice.icon}</Text>}
              {choice.label && <Text style={styles.label}>{choice.label}</Text>}
              {choice.desc && <Text style={styles.desc}>{choice.desc}</Text>}
            </Pressable>
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
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.secondary,
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
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  choicesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 120, // Balanced height
    ...shadows.subtle,
  },
  choiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  desc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
