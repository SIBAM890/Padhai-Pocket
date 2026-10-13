import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export type FriendlyStateType =
  | 'LOADING'
  | 'MIC_UNAVAILABLE'
  | 'AUDIO_UNAVAILABLE'
  | 'OFFLINE_READY'
  | 'CONTENT_UNAVAILABLE'
  | 'SKIPPED'
  | 'TEMPORARY_PROBLEM';

interface FriendlyStateProps {
  type: FriendlyStateType;
  onAction?: () => void;
  actionText?: string;
}

export const FriendlyState: React.FC<FriendlyStateProps> = ({
  type,
  onAction,
  actionText,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'AUDIO_UNAVAILABLE':
        return {
          icon: '🖼️',
          title: "Let's look at pictures first",
          titleOr: 'ଚାଲନ୍ତୁ ପ୍ରଥମେ ଚିତ୍ର ଦେଖିବା',
          desc: 'Sound is resting right now, so we will learn with illustrations.',
          btn: 'Continue with Pictures',
        };
      case 'MIC_UNAVAILABLE':
        return {
          icon: '👆',
          title: 'You can tap your answer',
          titleOr: 'ଉତ୍ତର ବାଛିବା ପାଇଁ ଟ୍ୟାପ୍ କରନ୍ତୁ',
          desc: 'Voice is optional! Select any choice directly on screen.',
          btn: 'Got it',
        };
      case 'SKIPPED':
        return {
          icon: '⏭️',
          title: 'Question skipped',
          titleOr: 'ପ୍ରଶ୍ନଟି ଛାଡ଼ିଦିଆଗଲା',
          desc: 'No problem at all! Let us move on to the next concept.',
          btn: 'Next Question',
        };
      default:
        return {
          icon: '🌱',
          title: "Let's learn together",
          titleOr: 'ଆଗକୁ ବଢ଼ିବା',
          desc: 'Everything is safe on your device.',
          btn: 'Continue',
        };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.titleOr}>{config.titleOr}</Text>
      <Text style={styles.desc}>{config.desc}</Text>

      {onAction && (
        <Pressable style={styles.button} onPress={onAction} accessibilityRole="button">
          <Text style={styles.btnText}>{actionText ?? config.btn}</Text>
        </Pressable>
      )}
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
    marginVertical: spacing.md,
    ...shadows.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 26,
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
  desc: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
  },
  btnText: {
    ...typography.button,
  },
});
