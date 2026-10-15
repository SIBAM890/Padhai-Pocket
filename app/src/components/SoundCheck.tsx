import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { playOdiaVoice, stopOdiaAudio } from '../audio/odiaAudio';

interface SoundCheckProps {
  onHeard: () => void;
  onCannotHear: () => void;
}

export const SoundCheck: React.FC<SoundCheckProps> = ({ onHeard, onCannotHear }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVoice = () => {
    playOdiaVoice({
      key: 'sound_check',
      text: 'ନମସ୍କାର! ପଢାଇ ପକେଟ୍ କୁ ସ୍ୱାଗତ। ତୁମେ ଏହି ଶବ୍ଦଟି ସ୍ପଷ୍ଟ ଭାବରେ ଶୁଣିପାରୁଛ କି?',
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  useEffect(() => {
    // Automatically play pure Odia greeting on mount
    handlePlayVoice();
    return () => {
      stopOdiaAudio();
    };
  }, []);

  return (
    <View style={styles.card}>
      <Pressable style={[styles.iconCircle, isPlaying && styles.iconCirclePlaying]} onPress={handlePlayVoice}>
        <Text style={styles.icon}>{isPlaying ? '🔊' : '▶️'}</Text>
      </Pressable>

      <Text style={styles.title}>Can you hear this?</Text>
      <Text style={styles.titleOr}>ତୁମେ ଏହି ଶବ୍ଦଟି ଶୁଣିପାରୁଛ କି?</Text>

      {/* Audio Play Trigger Button */}
      <Pressable
        style={[styles.audioPlayBtn, isPlaying && styles.audioPlayBtnActive]}
        onPress={handlePlayVoice}
        accessibilityRole="button"
      >
        <Text style={styles.audioPlayBtnText}>
          {isPlaying ? '🔊 ଶୁଣୁଛନ୍ତି... (Playing Odia Dialect)' : '▶ ଶୁଣିବା ପାଇଁ ଦବାନ୍ତୁ (Tap to Play Voice)'}
        </Text>
      </Pressable>

      <Text style={styles.description}>
        Testing your tablet audio so we can read lessons aloud whenever you want.
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.btn, styles.primaryBtn]}
          onPress={() => {
            stopOdiaAudio();
            onHeard();
          }}
          accessibilityRole="button"
          accessibilityLabel="I can hear it"
        >
          <Text style={styles.primaryBtnText}>I can hear it · ଶୁଣିପାରୁଛି</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.secondaryBtn]}
          onPress={() => {
            stopOdiaAudio();
            onCannotHear();
          }}
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
  iconCirclePlaying: {
    backgroundColor: '#DCFCE7',
    transform: [{ scale: 1.08 }],
  },
  audioPlayBtn: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    marginVertical: spacing.sm,
  },
  audioPlayBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  audioPlayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
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
    paddingHorizontal: spacing.sm,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
  },
  secondaryBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
