import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export type VoiceState = 'Ready' | 'Listening' | 'Thinking' | 'Tap instead';

interface MicButtonProps {
  state: VoiceState;
  onPress: () => void;
  onFallbackPress?: () => void;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state = 'Ready',
  onPress,
  onFallbackPress,
}) => {
  const isListening = state === 'Listening';
  const isThinking = state === 'Thinking';

  const getLabel = () => {
    switch (state) {
      case 'Listening':
        return 'Listening... Speak your answer';
      case 'Thinking':
        return 'Processing speech...';
      case 'Tap instead':
        return 'Tap options above';
      default:
        return 'Tap to speak your answer';
    }
  };

  const getIcon = () => {
    if (isThinking) return '⏳';
    if (isListening) return '🎙️';
    return '🎤';
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          isListening && styles.listeningBtn,
          isThinking && styles.thinkingBtn,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={getLabel()}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
      </Pressable>

      <Text style={styles.statusLabel}>{getLabel()}</Text>

      {onFallbackPress && (
        <Pressable onPress={onFallbackPress} style={styles.fallbackAction}>
          <Text style={styles.fallbackText}>Tap answer instead</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  button: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  listeningBtn: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    transform: [{ scale: 1.05 }],
  },
  thinkingBtn: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  icon: {
    fontSize: 28,
  },
  statusLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  fallbackAction: {
    marginTop: 4,
    padding: spacing.xs,
  },
  fallbackText: {
    ...typography.caption,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
