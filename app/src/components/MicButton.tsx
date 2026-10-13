import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'VOICE_UNAVAILABLE' | 'TAP_FALLBACK';

interface MicButtonProps {
  state: VoiceState;
  onPress: () => void;
  onFallbackPress?: () => void;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  onPress,
  onFallbackPress,
}) => {
  const isListening = state === 'LISTENING';
  const isProcessing = state === 'PROCESSING';
  const isUnavailable = state === 'VOICE_UNAVAILABLE' || state === 'TAP_FALLBACK';

  const getStatusLabel = () => {
    switch (state) {
      case 'LISTENING':
        return 'Listening... Speak your answer';
      case 'PROCESSING':
        return 'Thinking...';
      case 'VOICE_UNAVAILABLE':
        return 'Microphone unavailable';
      case 'TAP_FALLBACK':
        return 'Tap options above instead';
      default:
        return 'Tap to speak your answer';
    }
  };

  const getIcon = () => {
    if (isProcessing) return '⏳';
    if (isListening) return '🎙️';
    if (isUnavailable) return '🔇';
    return '🎤';
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          isListening && styles.listeningButton,
          isProcessing && styles.processingButton,
          isUnavailable && styles.unavailableButton,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={getStatusLabel()}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
      </Pressable>

      <Text style={styles.statusText}>{getStatusLabel()}</Text>

      {onFallbackPress && !isUnavailable && (
        <Pressable onPress={onFallbackPress} style={styles.secondaryAction}>
          <Text style={styles.secondaryText}>Tap answer instead</Text>
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
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  listeningButton: {
    backgroundColor: '#047857',
    borderColor: colors.primaryLight,
    transform: [{ scale: 1.05 }],
  },
  processingButton: {
    backgroundColor: '#1e3a8a',
    borderColor: colors.info,
  },
  unavailableButton: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    opacity: 0.7,
  },
  icon: {
    fontSize: 32,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  secondaryAction: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  secondaryText: {
    ...typography.caption,
    color: colors.primaryLight,
    textDecorationLine: 'underline',
  },
});
