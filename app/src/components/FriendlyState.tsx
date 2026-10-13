import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

export type FriendlyStateType =
  | 'LOADING'
  | 'MIC_UNAVAILABLE'
  | 'AUDIO_UNAVAILABLE'
  | 'OFFLINE_READY'
  | 'CONTENT_UNAVAILABLE'
  | 'STORAGE_SAFE'
  | 'TEMPORARY_PROBLEM'
  | 'SKIPPED'
  | 'RECOVERY';

interface FriendlyStateProps {
  type: FriendlyStateType;
  customMessage?: string;
  customMessageOr?: string;
  actionText?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
}

export const FriendlyState: React.FC<FriendlyStateProps> = ({
  type,
  customMessage,
  customMessageOr,
  actionText,
  onAction,
  onSecondaryAction,
  secondaryActionText,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'LOADING':
        return {
          icon: '⏳',
          title: 'Preparing your lesson...',
          titleOr: 'ପାଠ ପ୍ରସ୍ତୁତ ହେଉଛି...',
          description: 'Taking a quick moment to get everything ready for you.',
          defaultAction: null,
        };
      case 'MIC_UNAVAILABLE':
        return {
          icon: '🎤',
          title: 'Microphone is resting',
          titleOr: 'ମାଇକ୍ରୋଫୋନ କାମ କରୁନାହିଁ',
          description: "No worries! You can tap any answer option on the screen instead.",
          defaultAction: 'Tap to Answer',
        };
      case 'AUDIO_UNAVAILABLE':
        return {
          icon: '🖼️',
          title: "Let's look at pictures first",
          titleOr: 'ଚାଲନ୍ତୁ ପ୍ରଥମେ ଚିତ୍ର ଦେଖିବା',
          description: 'Sound is resting right now, so we will learn with illustrations.',
          defaultAction: 'Continue with Pictures',
        };
      case 'OFFLINE_READY':
        return {
          icon: '💾',
          title: 'Learning saved safely on this device',
          titleOr: 'ଆପଣଙ୍କ ପାଠ ଏହି ଫୋନରେ ସୁରକ୍ଷିତ ଅଛି',
          description: 'You can practice anytime without internet.',
          defaultAction: 'Continue Learning',
        };
      case 'CONTENT_UNAVAILABLE':
        return {
          icon: '📚',
          title: 'Next lesson is loading',
          titleOr: 'ପରବର୍ତ୍ତୀ ପାଠ ଲୋଡ୍ ହେଉଛି',
          description: 'Let us review the concepts we just explored.',
          defaultAction: 'Review Practice',
        };
      case 'SKIPPED':
        return {
          icon: '⏭️',
          title: 'Question skipped',
          titleOr: 'ପ୍ରଶ୍ନଟି ଛାଡ଼ିଦିଆଗଲା',
          description: 'No problem at all! Let us move on to the next concept.',
          defaultAction: 'Next Question',
        };
      case 'TEMPORARY_PROBLEM':
      case 'RECOVERY':
      default:
        return {
          icon: '🌱',
          title: "Let's take a quick breath",
          titleOr: 'କିଛି ସମୟ ଅପେକ୍ଷା କରନ୍ତୁ',
          description: 'We are ready to pick right back up where we left off.',
          defaultAction: 'Try Again',
        };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{config.icon}</Text>
      </View>

      <Text style={styles.title}>{customMessage ?? config.title}</Text>
      <Text style={styles.titleOr}>{customMessageOr ?? config.titleOr}</Text>
      <Text style={styles.description}>{config.description}</Text>

      {(actionText || config.defaultAction) && onAction && (
        <Pressable style={styles.actionBtn} onPress={onAction} accessibilityRole="button">
          <Text style={styles.actionText}>{actionText ?? config.defaultAction}</Text>
        </Pressable>
      )}

      {secondaryActionText && onSecondaryAction && (
        <Pressable style={styles.secondaryBtn} onPress={onSecondaryAction}>
          <Text style={styles.secondaryText}>{secondaryActionText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleOr: {
    ...typography.body,
    color: colors.primaryLight,
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.lg,
    maxWidth: 300,
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    minWidth: 180,
    alignItems: 'center',
  },
  actionText: {
    ...typography.button,
    color: '#07111f',
  },
  secondaryBtn: {
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  secondaryText: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
