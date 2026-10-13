import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

export type OptionState = 'DEFAULT' | 'SELECTED' | 'CORRECT' | 'NEUTRAL';

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
  state = 'DEFAULT',
  disabled = false,
  onPress,
}) => {
  const isSelected = state === 'SELECTED';
  const isCorrect = state === 'CORRECT';
  const isNeutral = state === 'NEUTRAL';

  const containerStyle = [
    styles.container,
    isSelected && styles.selectedContainer,
    isCorrect && styles.correctContainer,
    isNeutral && styles.neutralContainer,
    disabled && styles.disabledContainer,
  ];

  const badgeStyle = [
    styles.labelBadge,
    isSelected && styles.selectedBadge,
    isCorrect && styles.correctBadge,
  ];

  return (
    <Pressable
      style={containerStyle}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Option ${label}: ${text}`}
    >
      <View style={badgeStyle}>
        <Text style={[styles.labelText, isCorrect && styles.correctText]}>{label}</Text>
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.text, isSelected && styles.selectedText]}>{text}</Text>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md + 2,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm + 2,
    minHeight: 64, // Large touch target for students
  },
  selectedContainer: {
    borderColor: colors.borderHighlight,
    backgroundColor: '#172e4c',
  },
  correctContainer: {
    borderColor: colors.borderSuccess,
    backgroundColor: '#0a3325',
  },
  neutralContainer: {
    borderColor: colors.border,
    opacity: 0.7,
  },
  disabledContainer: {
    opacity: 0.8,
  },
  labelBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectedBadge: {
    backgroundColor: colors.borderHighlight,
  },
  correctBadge: {
    backgroundColor: colors.primary,
  },
  labelText: {
    ...typography.h3,
    color: colors.textSecondary,
    fontSize: 16,
  },
  correctText: {
    color: '#07111f',
  },
  textWrapper: {
    flex: 1,
  },
  text: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectedText: {
    color: '#ffffff',
  },
  subtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
