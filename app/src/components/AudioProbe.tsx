import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import type { PictureChoice } from './PictureProbe';

interface AudioProbeProps {
  prompt: string;
  promptOr?: string;
  choices: PictureChoice[];
  selectedChoiceId?: string | null;
  onSelect: (choiceId: string) => void;
  onPlayAudio?: () => void;
}

export const AudioProbe: React.FC<AudioProbeProps> = ({
  prompt,
  promptOr,
  choices,
  selectedChoiceId,
  onSelect,
  onPlayAudio,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlayAudio?.();
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AUDIO PROBE (ଶ୍ରବଣ ଯାଞ୍ଚ)</Text>
      </View>

      <Text style={styles.prompt}>{prompt}</Text>
      {promptOr && <Text style={styles.promptOr}>{promptOr}</Text>}

      {/* Primary Audio Player Control */}
      <Pressable
        style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
        onPress={handlePlay}
        accessibilityRole="button"
        accessibilityLabel="Play audio prompt"
      >
        <Text style={styles.audioIcon}>{isPlaying ? '🔊' : '▶️'}</Text>
        <Text style={styles.audioLabel}>
          {isPlaying ? 'Playing in Odia / Kui...' : 'Listen to phrase (ଶୁଣନ୍ତୁ)'}
        </Text>
      </Pressable>

      <Text style={styles.instruction}>Select the matching picture below:</Text>

      {/* Visual icon choices only - no textual barrier */}
      <View style={styles.choicesRow}>
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <Pressable
              key={choice.id}
              style={[styles.choiceCard, isSelected && styles.choiceCardSelected]}
              onPress={() => onSelect(choice.id)}
              accessibilityRole="button"
              accessibilityLabel={choice.label ?? 'Option'}
            >
              <Text style={styles.choiceIcon}>{choice.visualIcon ?? '📦'}</Text>
              {choice.label && <Text style={styles.choiceLabel}>{choice.label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '800',
  },
  prompt: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  promptOr: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 4,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  audioButtonPlaying: {
    backgroundColor: '#064e3b',
    borderColor: colors.primaryLight,
  },
  audioIcon: {
    fontSize: 22,
  },
  audioLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  instruction: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  choicesRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 90,
  },
  choiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#0a3325',
  },
  choiceIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  choiceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
