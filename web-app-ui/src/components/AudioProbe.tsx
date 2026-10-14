import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

interface AudioChoice {
  id: string;
  icon?: string;
  label?: string;
}

interface AudioProbeProps {
  title?: string;
  titleOr?: string;
  prompt: string;
  choices: AudioChoice[];
  selectedChoiceId?: string | null;
  onSelect: (choiceId: string) => void;
  onPlayAudio?: () => void;
}

export const AudioProbe: React.FC<AudioProbeProps> = ({
  title = 'Listen to the Odia / Kui pronunciation',
  titleOr = 'ଓଡ଼ିଆ ଉଚ୍ଚାରଣ ଶୁଣନ୍ତୁ',
  prompt,
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
        <Text style={styles.badgeText}>AUDIO FIRST ACTIVITY</Text>
      </View>
      <Text style={styles.fallbackNotice}>[Audio simulated — native Odia TTS pending]</Text>

      <Text style={styles.title}>{title}</Text>
      {titleOr && <Text style={styles.titleOr}>{titleOr}</Text>}

      {/* Audio Trigger button */}
      <Pressable
        style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
        onPress={handlePlay}
        accessibilityRole="button"
        accessibilityLabel="Play audio prompt"
      >
        <Text style={styles.audioIcon}>{isPlaying ? '🔊' : '▶️'}</Text>
        <Text style={styles.audioLabel}>
          {isPlaying ? 'Playing in Odia / Kui...' : 'Tap to Listen (ଶୁଣନ୍ତୁ)'}
        </Text>
      </Pressable>

      <Text style={styles.prompt}>{prompt}</Text>

      {/* Visual choices row without text barriers */}
      <View style={styles.choicesRow}>
        {choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <Pressable
              key={choice.id}
              style={[styles.choiceCard, isSelected && styles.choiceCardSelected]}
              onPress={() => onSelect(choice.id)}
              accessibilityRole="button"
            >
              <Text style={styles.choiceIcon}>{choice.icon ?? '📦'}</Text>
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  fallbackNotice: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
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
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.card,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  audioButtonPlaying: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  audioIcon: {
    fontSize: 22,
  },
  audioLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  prompt: {
    ...typography.caption,
    color: colors.textMuted,
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
    minHeight: 90,
    ...shadows.subtle,
  },
  choiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  choiceIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  choiceLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
