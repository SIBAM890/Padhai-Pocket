import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

interface SoundCheckProps {
  onHeard: () => void;
  onCannotHear: () => void;
  onSkip?: () => void;
}

export const SoundCheck: React.FC<SoundCheckProps> = ({
  onHeard,
  onCannotHear,
  onSkip,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.speakerIcon}>🔊</Text>
      </View>

      <Text style={styles.title}>Can you hear this sound?</Text>
      <Text style={styles.titleOr}>ତୁମେ ଏହି ଶବ୍ଦଟି ଶୁଣିପାରୁଛ କି?</Text>
      <Text style={styles.subtitle}>
        Tap below so we know whether to read questions aloud for you.
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={onHeard}
          accessibilityRole="button"
          accessibilityLabel="I can hear it"
        >
          <Text style={styles.primaryButtonText}>Yes, I hear it</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={onCannotHear}
          accessibilityRole="button"
          accessibilityLabel="I cannot hear it"
        >
          <Text style={styles.secondaryButtonText}>I can't hear it</Text>
        </Pressable>
      </View>

      {onSkip && (
        <Pressable onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Let's look at pictures first</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  speakerIcon: {
    fontSize: 32,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleOr: {
    ...typography.body,
    color: colors.primaryLight,
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    ...typography.button,
    color: '#07111f',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  skipButton: {
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  skipText: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
