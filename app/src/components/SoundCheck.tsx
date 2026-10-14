import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface SoundCheckProps {
  onHeard: () => void;
  onCannotHear: () => void;
}

export const SoundCheck: React.FC<SoundCheckProps> = ({ onHeard, onCannotHear }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🔊</Text>
      </View>

      <Text style={styles.title}>Can you hear this?</Text>
      <Text style={styles.titleOr}>ତୁମେ ଏହି ଶବ୍ଦଟି ଶୁଣିପାରୁଛ କି?</Text>
      <Text style={styles.description}>
        Testing your tablet audio so we can read lessons aloud whenever you want.
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.btn, styles.primaryBtn]}
          onPress={onHeard}
          accessibilityRole="button"
          accessibilityLabel="I can hear it"
        >
          <Text style={styles.primaryBtnText}>I can hear it</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.secondaryBtn]}
          onPress={onCannotHear}
          accessibilityRole="button"
          accessibilityLabel="Try another way"
        >
          <Text style={styles.secondaryBtnText}>Try another way</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleOr: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    ...typography.button,
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
  },
  secondaryBtnText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
