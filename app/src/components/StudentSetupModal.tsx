import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import {
  MaleHumanIcon,
  FemaleHumanIcon,
  BackpackIcon,
  BookIcon,
  AudioWaveIcon,
  TrophyIcon,
  CheckIcon,
} from './AppIcons';

export type SetupStep = 'WELCOME' | 'NAME_GENDER' | 'LANGUAGE' | 'SUBJECT' | 'ALL_SET';

export interface SetupFinishData {
  name: string;
  gender: 'male' | 'female';
  language: 'odia' | 'english';
  subject: 'physics' | 'mathematics' | 'science';
}

interface StudentSetupModalProps {
  visible: boolean;
  initialProfile?: Partial<SetupFinishData>;
  onFinish: (data: SetupFinishData) => void;
  onClose?: () => void;
}

export const StudentSetupModal: React.FC<StudentSetupModalProps> = ({
  visible,
  initialProfile,
  onFinish,
  onClose,
}) => {
  const [step, setStep] = useState<SetupStep>('WELCOME');
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'female');
  const [selectedLanguage, setSelectedLanguage] = useState<'odia' | 'english'>(
    initialProfile?.language || 'odia'
  );
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'mathematics' | 'science'>(
    initialProfile?.subject || 'physics'
  );

  // When modal is reopened, reset to editing step with initialProfile loaded
  useEffect(() => {
    if (visible) {
      if (initialProfile?.name) {
        setName(initialProfile.name);
        setGender(initialProfile.gender || 'female');
        setSelectedLanguage(initialProfile.language || 'odia');
        setSelectedSubject(initialProfile.subject || 'physics');
        setStep('NAME_GENDER');
      } else {
        setStep('WELCOME');
      }
    }
  }, [visible, initialProfile]);

  if (!visible) return null;

  const displayName = name.trim() || (gender === 'male' ? 'Student' : 'Learner');

  const renderContent = () => {
    switch (step) {
      case 'WELCOME':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <BackpackIcon size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to PadhAI Pocket</Text>
            <Text style={styles.tagline}>Your offline learning companion.</Text>
            <Text style={styles.description}>
              Practice Class 9 science offline, listen in your mother tongue, and build your daily learning habit.
            </Text>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => setStep('NAME_GENDER')}
              accessibilityRole="button"
              accessibilityLabel="Get started"
            >
              <Text style={styles.primaryBtnText}>Get Started ➔</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                if (initialProfile?.name) {
                  setName(initialProfile.name);
                  setGender(initialProfile.gender || 'female');
                  setSelectedLanguage(initialProfile.language || 'odia');
                  setSelectedSubject(initialProfile.subject || 'physics');
                }
                setStep('ALL_SET');
              }}
              accessibilityRole="button"
              accessibilityLabel="I already have a profile"
            >
              <Text style={styles.secondaryBtnText}>I already have a profile</Text>
            </Pressable>
          </View>
        );

      case 'NAME_GENDER':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>Let's get to know you</Text>
            <Text style={styles.tagline}>ଆପଣଙ୍କ ବିଷୟରେ ଜଣାନ୍ତୁ</Text>

            {/* Name Input Section */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>What's your name?</Text>
              <TextInput
                nativeID="student-name-input"
                id="student-name-input"
                accessibilityLabel="Student name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="words"
              />
            </View>

            {/* Gender Selection Section */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {/* Male Card */}
                <Pressable
                  style={[
                    styles.genderCard,
                    gender === 'male' && styles.genderCardSelected,
                  ]}
                  onPress={() => setGender('male')}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === 'male' }}
                  accessibilityLabel="Male"
                >
                  <View
                    style={[
                      styles.genderIconContainer,
                      gender === 'male' && styles.genderIconContainerSelected,
                    ]}
                  >
                    <MaleHumanIcon
                      size={28}
                      color={gender === 'male' ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'male' && styles.genderTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                  {gender === 'male' && (
                    <View style={styles.checkBadge}>
                      <CheckIcon size={14} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>

                {/* Female Card */}
                <Pressable
                  style={[
                    styles.genderCard,
                    gender === 'female' && styles.genderCardSelected,
                  ]}
                  onPress={() => setGender('female')}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === 'female' }}
                  accessibilityLabel="Female"
                >
                  <View
                    style={[
                      styles.genderIconContainer,
                      gender === 'female' && styles.genderIconContainerSelected,
                    ]}
                  >
                    <FemaleHumanIcon
                      size={28}
                      color={gender === 'female' ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'female' && styles.genderTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                  {gender === 'female' && (
                    <View style={styles.checkBadge}>
                      <CheckIcon size={14} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => setStep('LANGUAGE')}
              accessibilityRole="button"
              accessibilityLabel="Continue to language selection"
            >
              <Text style={styles.primaryBtnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'LANGUAGE':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <AudioWaveIcon size={28} color={colors.secondary} />
            </View>
            <Text style={styles.title}>How would you like to learn?</Text>
            <Text style={styles.tagline}>ପଢ଼ିବା ଭାଷା ବାଛନ୍ତୁ</Text>

            <View style={styles.optionsColumn}>
              {[
                { id: 'odia' as const, label: 'ଓଡ଼ିଆ (Odia)', desc: 'Mother-tongue explanation and Odia audio guidance' },
                { id: 'english' as const, label: 'English', desc: 'Standard BSE Odisha English medium curriculum' },
              ].map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <Pressable
                    key={lang.id}
                    style={[styles.subjectOption, isSelected && styles.subjectOptionSelected]}
                    onPress={() => setSelectedLanguage(lang.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.optionContentRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subjTitle, isSelected && styles.subjTitleSelected]}>
                          {lang.label}
                        </Text>
                        <Text style={styles.subjDesc}>{lang.desc}</Text>
                      </View>
                      {isSelected && <CheckIcon size={18} color={colors.primary} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => setStep('SUBJECT')}
              accessibilityRole="button"
              accessibilityLabel="Continue to subject selection"
            >
              <Text style={styles.primaryBtnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'SUBJECT':
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconCircle}>
              <BookIcon size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>What would you like to learn?</Text>
            <Text style={styles.tagline}>କେଉଁ ବିଷୟରୁ ଆରମ୍ଭ କରିବେ?</Text>

            <View style={styles.optionsColumn}>
              {[
                { id: 'physics' as const, title: 'Physics (ଭୌତିକ ବିଜ୍ଞାନ)', desc: 'Motion, Forces, Gravitation' },
                { id: 'mathematics' as const, title: 'Mathematics (ଗଣିତ)', desc: 'Number Systems, Geometry, Algebra' },
                { id: 'science' as const, title: 'Science (ଜୀବ ବିଜ୍ଞାନ)', desc: 'Cells, Plant Tissues, Living World' },
              ].map((subj) => {
                const isSelected = selectedSubject === subj.id;
                return (
                  <Pressable
                    key={subj.id}
                    style={[styles.subjectOption, isSelected && styles.subjectOptionSelected]}
                    onPress={() => setSelectedSubject(subj.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.optionContentRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subjTitle, isSelected && styles.subjTitleSelected]}>
                          {subj.title}
                        </Text>
                        <Text style={styles.subjDesc}>{subj.desc}</Text>
                      </View>
                      {isSelected && <CheckIcon size={18} color={colors.primary} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => setStep('ALL_SET')}
              accessibilityRole="button"
              accessibilityLabel="Continue to confirmation"
            >
              <Text style={styles.primaryBtnText}>Continue ➔</Text>
            </Pressable>
          </View>
        );

      case 'ALL_SET':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.iconCircle, styles.allSetCircle]}>
              <TrophyIcon size={32} color={colors.secondary} />
            </View>
            <Text style={styles.title}>You're all set, {displayName}!</Text>
            <Text style={styles.tagline}>ଆପଣଙ୍କ ଶିକ୍ଷଣ ଯାତ୍ରା ପ୍ରସ୍ତୁତ।</Text>
            <Text style={styles.description}>
              We've configured your Class 9 study space for offline practice with voice assistance.
            </Text>

            <Pressable
              style={styles.primaryBtn}
              onPress={() =>
                onFinish({
                  name: displayName,
                  gender,
                  language: selectedLanguage,
                  subject: selectedSubject,
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Go to Home Dashboard"
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
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
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
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
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
  fieldSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  genderCard: {
    flex: 1,
    minHeight: 88,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  genderCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  genderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  genderIconContainerSelected: {
    backgroundColor: colors.primaryLight,
  },
  genderText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  genderTextSelected: {
    color: colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  subjectOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F7FF',
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.subtle,
  },
  primaryBtnText: {
    ...typography.button,
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  secondaryBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
