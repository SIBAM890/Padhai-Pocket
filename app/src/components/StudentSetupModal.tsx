import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export type SetupStep = 'WELCOME' | 'NAME' | 'LANGUAGE' | 'SUBJECT' | 'ALL_SET';

interface StudentSetupModalProps {
  visible: boolean;
  onFinish: (name: string, language: string, subject: string) => void;
  onClose?: () => void;
}

export const StudentSetupModal: React.FC<StudentSetupModalProps> = ({
  visible,
  onFinish,
  onClose,
}) => {
  const [step, setStep] = useState<SetupStep>('WELCOME');
  const [name, setName] = useState('Sunita');
  const [selectedLanguage, setSelectedLanguage] = useState('ଓଡ଼ିଆ');
  const [selectedSubject, setSelectedSubject] = useState('Physical Science');

  if (!visible) return null;

  const renderContent = () => {
    switch (step) {
      case 'WELCOME':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🎒</Text>
            </View>
            <Text style={styles.title}>Welcome to PadhAI Pocket</Text>
            <Text style={styles.tagline}>Your learning journey, your way.</Text>
            <Text style={styles.description}>
              Practice Class 9 science offline, listen in your mother tongue, and build your daily learning habit.
            </Text>

            <Pressable style={styles.primaryBtn} onPress={() => setStep('NAME')}>
              <Text style={styles.primaryBtnText}>Get Started ➔</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={() => setStep('ALL_SET')}>
              <Text style={styles.secondaryBtnText}>I already have a profile</Text>
            </Pressable>
          </View>
        );

      case 'NAME':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>👧🏽</Text>
            </View>
            <Text style={styles.title}>Enter your name</Text>
            <Text style={styles.tagline}>ଆପଣଙ୍କ ନାମ କ’ଣ?</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sunita"
              placeholderTextColor={colors.textDisabled}
            />

            <Pressable style={styles.primaryBtn} onPress={() => setStep('LANGUAGE')}>
              <Text style={styles.primaryBtnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'LANGUAGE':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🗣️</Text>
            </View>
            <Text style={styles.title}>Choose language</Text>
            <Text style={styles.tagline}>ପଢ଼ିବା ଭାଷା ବାଛନ୍ତୁ</Text>

            <View style={styles.optionsRow}>
              {['ଓଡ଼ିଆ', 'English', 'କୂଇଁ (Kui)'].map((lang) => {
                const isSelected = selectedLanguage === lang;
                return (
                  <Pressable
                    key={lang}
                    style={[styles.choicePill, isSelected && styles.choicePillSelected]}
                    onPress={() => setSelectedLanguage(lang)}
                  >
                    <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                      {lang}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => setStep('SUBJECT')}>
              <Text style={styles.primaryBtnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'SUBJECT':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📚</Text>
            </View>
            <Text style={styles.title}>Choose learning preference</Text>
            <Text style={styles.tagline}>କେଉଁ ବିଷୟରୁ ଆରମ୍ଭ କରିବେ?</Text>

            <View style={styles.optionsColumn}>
              {[
                { title: 'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)', desc: 'Motion, Forces, Gravitation' },
                { title: 'Life Science (ଜୀବ ବିଜ୍ଞାନ)', desc: 'Cells, Plant Tissues' },
                { title: 'Mathematics (ଗଣିତ)', desc: 'Number Systems, Geometry' },
              ].map((subj) => {
                const isSelected = selectedSubject === subj.title;
                return (
                  <Pressable
                    key={subj.title}
                    style={[styles.subjectOption, isSelected && styles.subjectOptionSelected]}
                    onPress={() => setSelectedSubject(subj.title)}
                  >
                    <Text style={[styles.subjTitle, isSelected && styles.subjTitleSelected]}>
                      {subj.title}
                    </Text>
                    <Text style={styles.subjDesc}>{subj.desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => setStep('ALL_SET')}>
              <Text style={styles.primaryBtnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'ALL_SET':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.iconCircle, styles.allSetCircle]}>
              <Text style={styles.icon}>🎉</Text>
            </View>
            <Text style={styles.title}>You're all set, {name}!</Text>
            <Text style={styles.tagline}>ଆପଣଙ୍କ ଶିକ୍ଷଣ ଯାତ୍ରା ପ୍ରସ୍ତୁତ।</Text>
            <Text style={styles.description}>
              We've prepared your Class 9 Physical Science study room with offline saving and voice help.
            </Text>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => onFinish(name, selectedLanguage, selectedSubject)}
            >
              <Text style={styles.primaryBtnText}>Go to Home Dashboard ➔</Text>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.modalCard}>
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>PadhAI Pocket · Student Setup</Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          )}
        </View>

        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
  },
  stepContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  allSetCircle: {
    backgroundColor: colors.secondaryLight,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  choicePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choicePillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  choiceText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  choiceTextSelected: {
    color: colors.primary,
  },
  optionsColumn: {
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  subjectOption: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  subjectOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  subjTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subjTitleSelected: {
    color: colors.primary,
  },
  subjDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.subtle,
  },
  primaryBtnText: {
    ...typography.button,
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  secondaryBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
