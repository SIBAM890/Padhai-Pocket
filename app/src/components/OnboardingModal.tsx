import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

export type OnboardingStep =
  | 'WELCOME'
  | 'CONSENT'
  | 'PROFILE'
  | 'TEACHER_PIN'
  | 'SOUND_CHECK'
  | 'FIRST_LESSON_READY';

interface OnboardingModalProps {
  visible: boolean;
  onFinish: () => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onFinish,
  onClose,
}) => {
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [learnerName, setLearnerName] = useState('Sunita');
  const [pin, setPin] = useState('');

  if (!visible) return null;

  const renderContent = () => {
    switch (step) {
      case 'WELCOME':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.icon}>🎒</Text>
            <Text style={styles.title}>Welcome to PadhAI Pocket</Text>
            <Text style={styles.titleOr}>ପଢ଼ାଇ ପକେଟ୍‌କୁ ସ୍ୱାଗତ</Text>
            <Text style={styles.description}>
              Your voice-first, offline learning companion. Practice Class 9 Physical Science anytime, anywhere.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => setStep('CONSENT')}>
              <Text style={styles.btnText}>Get Started ➔</Text>
            </Pressable>
          </View>
        );

      case 'CONSENT':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.icon}>🤝</Text>
            <Text style={styles.title}>Safe & Private Learning</Text>
            <Text style={styles.titleOr}>ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା ସମ୍ମତି</Text>
            <Text style={styles.description}>
              All learning progress is stored locally on this tablet first. No voice recordings or student names are sent to public servers.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => setStep('PROFILE')}>
              <Text style={styles.btnText}>I Agree / ଆଗକୁ ବଢ଼ନ୍ତୁ</Text>
            </Pressable>
          </View>
        );

      case 'PROFILE':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.icon}>👧🏽</Text>
            <Text style={styles.title}>Learner Profile</Text>
            <Text style={styles.titleOr}>ଛାତ୍ରୀଙ୍କ ନାମ</Text>
            <TextInput
              style={styles.input}
              value={learnerName}
              onChangeText={setLearnerName}
              placeholder="Enter name"
              placeholderTextColor={colors.textDisabled}
            />
            <Text style={styles.caption}>Standard: Class 9 Physical Science (BSE Odisha)</Text>
            <Pressable style={styles.primaryBtn} onPress={() => setStep('SOUND_CHECK')}>
              <Text style={styles.btnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'SOUND_CHECK':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.icon}>🔊</Text>
            <Text style={styles.title}>Quick Sound Check</Text>
            <Text style={styles.titleOr}>ଶବ୍ଦ ଶୁଣିବା ଯାଞ୍ଚ</Text>
            <Text style={styles.description}>
              Can you hear the voice clearly on this tablet?
            </Text>
            <View style={styles.row}>
              <Pressable style={[styles.btnHalf, styles.primaryBtn]} onPress={() => setStep('FIRST_LESSON_READY')}>
                <Text style={styles.btnText}>Yes, I hear it</Text>
              </Pressable>
              <Pressable style={[styles.btnHalf, styles.secondaryBtn]} onPress={() => setStep('FIRST_LESSON_READY')}>
                <Text style={styles.secondaryBtnText}>Pictures Only</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'FIRST_LESSON_READY':
      default:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.icon}>🚀</Text>
            <Text style={styles.title}>You are all set, {learnerName}!</Text>
            <Text style={styles.titleOr}>ଚାଲନ୍ତୁ ପ୍ରଥମ ପାଠ ଆରମ୍ଭ କରିବା</Text>
            <Text style={styles.description}>
              Today's exploration: Distance and Displacement (ଦୂରତା ଓ ବିସ୍ଥାପନ).
            </Text>
            <Pressable style={styles.primaryBtn} onPress={onFinish}>
              <Text style={styles.btnText}>Start Learning ➔</Text>
            </Pressable>
          </View>
        );
    }
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.modalCard}>
        <View style={styles.topBar}>
          <Text style={styles.brandBadge}>PadhAI Pocket Setup</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 17, 31, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandBadge: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '800',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
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
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    ...typography.button,
    color: '#07111f',
  },
  btnHalf: {
    flex: 1,
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
