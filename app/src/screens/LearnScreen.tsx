import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius } from '../theme/theme';
import { AppHeader } from '../components/AppHeader';
import { LessonCard } from '../components/LessonCard';
import { MCQOption, type OptionState } from '../components/MCQOption';
import { MicButton, type VoiceState } from '../components/MicButton';
import { SoundCheck } from '../components/SoundCheck';
import { PictureProbe } from '../components/PictureProbe';
import { AudioProbe } from '../components/AudioProbe';
import { TextProbe } from '../components/TextProbe';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { RemediationCard } from '../components/RemediationCard';
import { SuccessCard } from '../components/SuccessCard';
import { FriendlyState } from '../components/FriendlyState';
import { BottomNavigation } from '../components/BottomNavigation';
import { OnboardingModal } from '../components/OnboardingModal';
import { TeacherDashboardModal } from '../components/TeacherDashboardModal';
import { mockLesson, mockProbes } from '../mock/mockData';
import { useNetworkStatus } from '../network/network';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

export type LearnStep =
  | 'SOUND_CHECK'
  | 'LESSON_MCQ'
  | 'PICTURE_PROBE'
  | 'AUDIO_PROBE'
  | 'TEXT_PROBE'
  | 'CONFIRMATION'
  | 'REMEDIATION'
  | 'SUCCESS'
  | 'FRIENDLY_ERROR';

export default function LearnScreen({ navigation }: Props) {
  const { networkMode, forcedOffline, setForcedOffline } = useNetworkStatus();

  // Screen workflow state (defaults to sound check then lesson MCQ)
  const [currentStep, setCurrentStep] = useState<LearnStep>('LESSON_MCQ');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [selectedProbeChoice, setSelectedProbeChoice] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(1);

  // Modals (isolated from student navigation)
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);

  // MCQ answer selection with gentle student feedback
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    if (optionId === mockLesson.correctOptionId) {
      setTimeout(() => setCurrentStep('SUCCESS'), 800);
    } else {
      // Transition smoothly into supportive probe/remediation
      setTimeout(() => setCurrentStep('REMEDIATION'), 800);
    }
  };

  // Mock Voice interaction state transition
  const handleMicPress = () => {
    if (voiceState === 'IDLE') {
      setVoiceState('LISTENING');
      setTimeout(() => {
        setVoiceState('PROCESSING');
        setTimeout(() => {
          setVoiceState('IDLE');
          handleSelectOption(mockLesson.correctOptionId);
        }, 1200);
      }, 1500);
    } else if (voiceState === 'LISTENING') {
      setVoiceState('PROCESSING');
      setTimeout(() => setVoiceState('IDLE'), 1000);
    }
  };

  const getOptionState = (optionId: string): OptionState => {
    if (!selectedOption) return 'DEFAULT';
    if (optionId === selectedOption) {
      return optionId === mockLesson.correctOptionId ? 'CORRECT' : 'SELECTED';
    }
    return 'NEUTRAL';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader
          networkMode={networkMode}
          forcedOffline={forcedOffline}
          onHelpPress={() => setOnboardingOpen(true)}
        />

        {/* Demo Mode / Judge Fast-Switch Banner */}
        <View style={styles.demoBar}>
          <View style={styles.demoBarLeft}>
            <Text style={styles.demoTitle}>Airplane-mode demo</Text>
            <Text style={styles.demoSubtitle}>Force offline mode for stage testing</Text>
          </View>
          <Switch
            value={forcedOffline}
            onValueChange={setForcedOffline}
            trackColor={{ false: '#334155', true: colors.primary }}
          />
        </View>

        {/* Dynamic Workflow View based on currentStep */}
        {currentStep === 'SOUND_CHECK' && (
          <SoundCheck
            onHeard={() => setCurrentStep('LESSON_MCQ')}
            onCannotHear={() => setCurrentStep('PICTURE_PROBE')}
            onSkip={() => setCurrentStep('LESSON_MCQ')}
          />
        )}

        {currentStep === 'LESSON_MCQ' && (
          <View>
            <LessonCard
              chapter={mockLesson.chapter}
              lessonIndex={mockLesson.lessonIndex}
              totalLessons={mockLesson.totalLessons}
              title={mockLesson.title}
              prompt={mockLesson.prompt}
              promptOr={mockLesson.promptOr}
            />

            <View style={styles.optionsContainer}>
              {mockLesson.options.map((opt) => (
                <MCQOption
                  key={opt.id}
                  label={opt.label}
                  text={opt.text}
                  subtext={opt.subtext}
                  state={getOptionState(opt.id)}
                  onPress={() => handleSelectOption(opt.id)}
                />
              ))}
            </View>

            <MicButton
              state={voiceState}
              onPress={handleMicPress}
              onFallbackPress={() => setVoiceState('TAP_FALLBACK')}
            />

            {selectedOption && selectedOption !== mockLesson.correctOptionId && (
              <View style={styles.supportNotice}>
                <Text style={styles.supportText}>Not quite. Let's look at it together.</Text>
                <Text style={styles.supportSub}>ପ୍ରଶ୍ନଟି ଆଉ ଥରେ ବୁଝିବା।</Text>
              </View>
            )}
          </View>
        )}

        {currentStep === 'PICTURE_PROBE' && (
          <PictureProbe
            prompt={mockProbes.PICTURE.prompt}
            promptOr={mockProbes.PICTURE.promptOr}
            choices={mockProbes.PICTURE.choices}
            selectedChoiceId={selectedProbeChoice}
            onSelect={(id) => {
              setSelectedProbeChoice(id);
              setTimeout(() => setCurrentStep('CONFIRMATION'), 800);
            }}
          />
        )}

        {currentStep === 'AUDIO_PROBE' && (
          <AudioProbe
            prompt={mockProbes.AUDIO.prompt}
            promptOr={mockProbes.AUDIO.promptOr}
            choices={mockProbes.AUDIO.choices}
            selectedChoiceId={selectedProbeChoice}
            onSelect={(id) => {
              setSelectedProbeChoice(id);
              setTimeout(() => setCurrentStep('CONFIRMATION'), 800);
            }}
          />
        )}

        {currentStep === 'TEXT_PROBE' && (
          <TextProbe
            prompt={mockProbes.TEXT.prompt}
            promptOr={mockProbes.TEXT.promptOr}
            choices={mockProbes.TEXT.choices as any}
            selectedChoiceId={selectedProbeChoice}
            onSelect={(id) => {
              setSelectedProbeChoice(id);
              setTimeout(() => setCurrentStep('CONFIRMATION'), 800);
            }}
          />
        )}

        {currentStep === 'CONFIRMATION' && (
          <ConfirmationCard
            question="If a cyclist returns to the origin point after 10 km, what is displacement?"
            questionOr="ଯଦି ସାଇକେଲ ଆରୋହୀ ୧୦ କିଲୋମିଟର ପରେ ପୁନର୍ବାର ଆରମ୍ଭ ବିନ୍ଦୁକୁ ଫେରିଆସନ୍ତି, ତେବେ ବିସ୍ଥାପନ କେତେ?"
            options={[
              { id: 'c1', label: 'A', text: '0 km (Zero displacement)' },
              { id: 'c2', label: 'B', text: '10 km' },
              { id: 'c3', label: 'C', text: '20 km' },
            ]}
            selectedOptionId={selectedProbeChoice}
            onSelect={setSelectedProbeChoice}
            onContinue={() => setCurrentStep('SUCCESS')}
          />
        )}

        {currentStep === 'REMEDIATION' && (
          <RemediationCard
            conceptTitle="Understanding Displacement (ବିସ୍ଥାପନ)"
            explanation="Displacement is the straight-line distance between where you started and where you ended. If you walk east 3 meters and walk west 3 meters, you end up right where you began: 0 meters!"
            explanationOr="ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।"
            onListen={() => {}}
            onTryAgain={() => {
              setSelectedOption(null);
              setCurrentStep('PICTURE_PROBE');
            }}
            onContinue={() => setCurrentStep('SUCCESS')}
          />
        )}

        {currentStep === 'SUCCESS' && (
          <SuccessCard
            conceptMastery={0.76}
            onContinue={() => {
              setSelectedOption(null);
              setSelectedProbeChoice(null);
              setCurrentStep('LESSON_MCQ');
            }}
          />
        )}

        {currentStep === 'FRIENDLY_ERROR' && (
          <FriendlyState
            type="AUDIO_UNAVAILABLE"
            onAction={() => setCurrentStep('PICTURE_PROBE')}
          />
        )}

        {/* Flow Switcher for Judges / Review */}
        <View style={styles.judgeBar}>
          <Text style={styles.judgeLabel}>PROBE & STATE PREVIEW:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.judgePills}>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('SOUND_CHECK')}>
              <Text style={styles.pillText}>Sound Check</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('LESSON_MCQ')}>
              <Text style={styles.pillText}>Lesson MCQ</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('PICTURE_PROBE')}>
              <Text style={styles.pillText}>Picture Probe</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('AUDIO_PROBE')}>
              <Text style={styles.pillText}>Audio Probe</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('TEXT_PROBE')}>
              <Text style={styles.pillText}>Text Probe</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('CONFIRMATION')}>
              <Text style={styles.pillText}>Confirmation</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('REMEDIATION')}>
              <Text style={styles.pillText}>Remediation</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('SUCCESS')}>
              <Text style={styles.pillText}>Success</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setCurrentStep('FRIENDLY_ERROR')}>
              <Text style={styles.pillText}>Friendly State</Text>
            </Pressable>
            <Pressable style={[styles.pill, styles.pillHighlight]} onPress={() => setTeacherOpen(true)}>
              <Text style={styles.pillHighlightText}>Teacher Dashboard (PIN)</Text>
            </Pressable>
            <Pressable style={styles.pill} onPress={() => setOnboardingOpen(true)}>
              <Text style={styles.pillText}>Onboarding</Text>
            </Pressable>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Child Bottom Navigation: Exactly Learn, Trace, RawLog */}
      <BottomNavigation
        currentTab="Learn"
        onSelectTab={(tab) => {
          if (tab === 'Trace') navigation.navigate('Trace');
          if (tab === 'RawLog') navigation.navigate('RawLog');
        }}
        pendingCount={pendingSyncCount}
      />

      {/* Isolated Modals */}
      <OnboardingModal
        visible={onboardingOpen}
        onFinish={() => setOnboardingOpen(false)}
        onClose={() => setOnboardingOpen(false)}
      />

      <TeacherDashboardModal
        visible={teacherOpen}
        onClose={() => setTeacherOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md + 2,
    paddingBottom: spacing.xxl,
  },
  optionsContainer: {
    marginBottom: spacing.xs,
  },
  demoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  demoBarLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  demoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  supportNotice: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
    marginTop: spacing.sm,
  },
  supportText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  supportSub: {
    ...typography.caption,
    color: colors.primaryLight,
    marginTop: 2,
  },
  judgeBar: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  judgeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  judgePills: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingBottom: spacing.sm,
  },
  pill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillHighlight: {
    backgroundColor: '#1e3a8a',
    borderColor: colors.borderHighlight,
  },
  pillHighlightText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '800',
  },
});
