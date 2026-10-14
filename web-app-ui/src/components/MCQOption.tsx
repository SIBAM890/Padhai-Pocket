import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export type OptionState = 'default' | 'selected' | 'correct' | 'needs-review';

interface MCQOptionProps {
  label: string; // 'A', 'B', 'C', 'D'
  text: string;
  subtext?: string;
  state?: OptionState;
  disabled?: boolean;
  onPress: () => void;
}

export const MCQOption: React.FC<MCQOptionProps> = ({
  label,
  text,
  subtext,
  state = 'default',
  disabled = false,
  onPress,
}) => {
  const isSelected = state === 'selected';
  const isCorrect = state === 'correct';
  const isNeedsReview = state === 'needs-review';

  return (
    <Pressable
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isCorrect && styles.correctContainer,
        isNeedsReview && styles.needsReviewContainer,
        disabled && styles.disabledContainer,
      ]}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Option ${label}: ${text}`}
    >
      <View
        style={[
          styles.badge,
          isSelected && styles.selectedBadge,
          isCorrect && styles.correctBadge,
          isNeedsReview && styles.needsReviewBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            (isSelected || isCorrect || isNeedsReview) && styles.badgeTextContrast,
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.textColumn}>
        <Text
          style={[
            styles.text,
            isSelected && styles.selectedText,
            isCorrect && styles.correctText,
          ]}
        >
          {text}
        </Text>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
    minHeight: 64, // Large touch targets for student comfort
    ...shadows.subtle,
  },
  selectedContainer: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  correctContainer: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  needsReviewContainer: {
    borderColor: colors.accent,
    backgroundColor: '#FFF5F4',
  },
  disabledContainer: {
    opacity: 0.85,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
  },
  correctBadge: {
    backgroundColor: colors.success,
  },
  needsReviewBadge: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  badgeTextContrast: {
    color: '#FFFFFF',
  },
  textColumn: {
    flex: 1,
  },
  text: {
    ...typography.bodyLarge,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedText: {
    color: colors.primary,
  },
  correctText: {
    color: '#15803D',
  },
  subtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
