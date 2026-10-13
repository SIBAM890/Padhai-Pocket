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
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { AppHeader } from '../components/AppHeader';
import { ContinueLearningCard } from '../components/ContinueLearningCard';
import { StreakGrid } from '../components/StreakGrid';
import { GoalCard } from '../components/GoalCard';
import { SubjectCard } from '../components/SubjectCard';
import { LessonBrowserCard } from '../components/LessonBrowserCard';
import { LessonIntroCard } from '../components/LessonIntroCard';
import { LessonContentCard } from '../components/LessonContentCard';
import { MCQOption, type OptionState } from '../components/MCQOption';
import { MicButton, type VoiceState } from '../components/MicButton';
import { SoundCheck } from '../components/SoundCheck';
import { PictureProbe } from '../components/PictureProbe';
import { AudioProbe } from '../components/AudioProbe';
import { TextProbe } from '../components/TextProbe';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { RemediationCard } from '../components/RemediationCard';
import { CompletionCard } from '../components/CompletionCard';
import { LearnerProfileCard } from '../components/LearnerProfileCard';
import { FriendlyState } from '../components/FriendlyState';
import { BottomNavigation, type MainNavTab } from '../components/BottomNavigation';
import { StudentSetupModal } from '../components/StudentSetupModal';
import { TeacherDashboardModal } from '../components/TeacherDashboardModal';
import {
  mockProfile,
  mockStreakGrid,
  mockSubjects,
  mockLessonsList,
  mockLessonQuestion,
  mockProbes,
} from '../mock/mockData';
import { useNetworkStatus } from '../network/network';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

export type LessonFlowStep =
  | 'DASHBOARD'
  | 'LESSON_LIST'
  | 'LESSON_INTRO'
  | 'SOUND_CHECK'
  | 'QUESTION_INTERACTION'
  | 'PROBE_PICTURE'
  | 'PROBE_AUDIO'
  | 'PROBE_TEXT'
  | 'CONFIRMATION'
  | 'REMEDIATION'
  | 'COMPLETION';

export default function LearnScreen({ navigation }: Props) {
  const { networkMode, forcedOffline, setForcedOffline } = useNetworkStatus();

  // Navigation tab state (Home, Learn, Progress, Profile)
  const [currentTab, setCurrentTab] = useState<MainNavTab>('Home');

  // Progressive student lesson flow
  const [flowStep, setFlowStep] = useState<LessonFlowStep>('DASHBOARD');

  // Interactive Question & Probe states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('Ready');
  const [selectedProbeChoice, setSelectedProbeChoice] = useState<string | null>(null);

  // Modals (isolated from student navigation)
  // Launches on first open to guide student through Welcome -> Name -> Language -> Subject -> "You're all set!" -> Home
  const [setupModalVisible, setSetupModalVisible] = useState(true);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [judgeToolsVisible, setJudgeToolsVisible] = useState(false);

  // Profile data in local state
  const [profile, setProfile] = useState(mockProfile);

  // Handlers
  const handleSelectOption = (optId: string) => {
    setSelectedOption(optId);
    if (optId === mockLessonQuestion.correctOptionId) {
      setTimeout(() => setFlowStep('COMPLETION'), 700);
    } else {
      // Natural transition to probe exploration
      setTimeout(() => setFlowStep('PROBE_PICTURE'), 700);
    }
  };

  const handleMicPress = () => {
    if (voiceState === 'Ready') {
      setVoiceState('Listening');
      setTimeout(() => {
        setVoiceState('Thinking');
        setTimeout(() => {
          setVoiceState('Ready');
          handleSelectOption(mockLessonQuestion.correctOptionId);
        }, 1200);
      }, 1500);
    } else if (voiceState === 'Listening') {
      setVoiceState('Thinking');
      setTimeout(() => setVoiceState('Ready'), 1000);
    }
  };

  const getOptionState = (optId: string): OptionState => {
    if (!selectedOption) return 'default';
    if (optId === selectedOption) {
      return optId === mockLessonQuestion.correctOptionId ? 'correct' : 'needs-review';
    }
    return 'default';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with greeting and status */}
        <AppHeader
          greeting={`Good morning, ${profile.name}`}
          subgreeting="Keep learning, one step at a time."
          avatar={profile.avatar}
          networkMode={networkMode}
          forcedOffline={forcedOffline}
          onAvatarPress={() => setCurrentTab('Profile')}
        />

        {/* ======================================================== */}
        {/* TAB 1: HOME DASHBOARD                                    */}
        {/* ======================================================== */}
        {currentTab === 'Home' && flowStep === 'DASHBOARD' && (
          <View>
            <ContinueLearningCard
              subject="Physics · Motion"
              lessonNumber="Lesson 2"
              lessonTitle="Displacement and Distance"
              lessonTitleOr="ଦୂରତା ଏବଂ ବିସ୍ଥାପନ"
              progressPercent={80}
              onContinue={() => setFlowStep('LESSON_INTRO')}
            />

            <StreakGrid
              streakDays={profile.streakDays}
              minutesThisWeek={profile.minutesThisWeek}
              gridData={mockStreakGrid}
            />

            <GoalCard
              goalTitle="Complete 1 lesson today"
              activitiesDone={1}
              totalActivities={3}
              onPress={() => setFlowStep('LESSON_INTRO')}
            />

            {/* Subject Modules */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your learning subjects</Text>
              <Text style={styles.sectionSub}>BSE Odisha Class 9</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectsRow}>
              {mockSubjects.map((sub) => (
                <SubjectCard
                  key={sub.id}
                  module={sub}
                  onPress={() => {
                    setCurrentTab('Learn');
                    setFlowStep('LESSON_LIST');
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2 / LESSON FLOW: BROWSER & LESSON EXPERIENCE        */}
        {/* ======================================================== */}
        {(currentTab === 'Learn' || flowStep !== 'DASHBOARD') && (
          <View>
            {flowStep === 'DASHBOARD' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Physics · Motion</Text>
                  <Text style={styles.sectionSub}>Chapter 5 Lessons</Text>
                </View>
                {mockLessonsList.map((les) => (
                  <LessonBrowserCard
                    key={les.id}
                    lesson={les}
                    onPress={() => setFlowStep('LESSON_INTRO')}
                  />
                ))}
              </View>
            )}

            {flowStep === 'LESSON_LIST' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Physics · Motion</Text>
                  <Text style={styles.sectionSub}>Chapter 5 Lessons</Text>
                </View>
                {mockLessonsList.map((les) => (
                  <LessonBrowserCard
                    key={les.id}
                    lesson={les}
                    onPress={() => setFlowStep('LESSON_INTRO')}
                  />
                ))}
              </View>
            )}

            {flowStep === 'LESSON_INTRO' && (
              <LessonIntroCard
                title="Motion & Mechanics"
                titleOr="ଦୂରତା ଏବଂ ବିସ୍ଥାପନ"
                estimatedMinutes={5}
                lessonNumber="Lesson 2 of 3"
                onStart={() => setFlowStep('QUESTION_INTERACTION')}
                onBack={() => setFlowStep('DASHBOARD')}
              />
            )}

            {flowStep === 'SOUND_CHECK' && (
              <SoundCheck
                onHeard={() => setFlowStep('QUESTION_INTERACTION')}
                onCannotHear={() => setFlowStep('PROBE_PICTURE')}
              />
            )}

            {flowStep === 'QUESTION_INTERACTION' && (
              <View>
                <LessonContentCard
                  conceptTitle={mockLessonQuestion.title}
                  conceptTitleOr={mockLessonQuestion.titleOr}
                  story={mockLessonQuestion.storyContext}
                  storyOr={mockLessonQuestion.storyContextOr}
                  prompt={mockLessonQuestion.prompt}
                  promptOr={mockLessonQuestion.promptOr}
                />

                <View style={styles.optionsList}>
                  {mockLessonQuestion.options.map((opt) => (
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
                  onFallbackPress={() => setVoiceState('Tap instead')}
                />

                {selectedOption && selectedOption !== mockLessonQuestion.correctOptionId && (
                  <View style={styles.supportNote}>
                    <Text style={styles.supportNoteText}>
                      Let's look at this together · ଚାଲନ୍ତୁ ଏହାକୁ ବୁଝିବା
                    </Text>
                  </View>
                )}
              </View>
            )}

            {flowStep === 'PROBE_PICTURE' && (
              <PictureProbe
                prompt={mockProbes.PICTURE.prompt}
                titleOr={mockProbes.PICTURE.titleOr}
                choices={mockProbes.PICTURE.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={(id) => {
                  setSelectedProbeChoice(id);
                  setTimeout(() => setFlowStep('CONFIRMATION'), 700);
                }}
              />
            )}

            {flowStep === 'PROBE_AUDIO' && (
              <AudioProbe
                prompt={mockProbes.AUDIO.prompt}
                choices={mockProbes.AUDIO.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={(id) => {
                  setSelectedProbeChoice(id);
                  setTimeout(() => setFlowStep('CONFIRMATION'), 700);
                }}
              />
            )}

            {flowStep === 'PROBE_TEXT' && (
              <TextProbe
                prompt={mockProbes.TEXT.prompt}
                promptOr={mockProbes.TEXT.promptOr}
                choices={mockProbes.TEXT.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={(id) => {
                  setSelectedProbeChoice(id);
                  setTimeout(() => setFlowStep('CONFIRMATION'), 700);
                }}
              />
            )}

            {flowStep === 'CONFIRMATION' && (
              <ConfirmationCard
                question="If you start at point A, run 100 meters, and return to point A, what is your displacement?"
                questionOr="ଯଦି ଆପଣ A ବିନ୍ଦୁରୁ ଦୌଡ଼ି ପୁଣି A କୁ ଫେରିଆସନ୍ତି, ତେବେ ବିସ୍ଥାପନ କେତେ?"
                options={[
                  { id: 'c1', label: 'A', text: '0 m (Zero displacement)' },
                  { id: 'c2', label: 'B', text: '100 m' },
                  { id: 'c3', label: 'C', text: '200 m' },
                ]}
                selectedOptionId={selectedProbeChoice}
                onSelect={setSelectedProbeChoice}
                onContinue={() => setFlowStep('COMPLETION')}
              />
            )}

            {flowStep === 'REMEDIATION' && (
              <RemediationCard
                explanation="Displacement is the straight-line distance between where you started and where you ended. If you walk east 3 meters and west 3 meters, you are back at 0 meters!"
                explanationOr="ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।"
                onListen={() => {}}
                onTryAgain={() => {
                  setSelectedOption(null);
                  setFlowStep('QUESTION_INTERACTION');
                }}
                onContinue={() => setFlowStep('COMPLETION')}
              />
            )}

            {flowStep === 'COMPLETION' && (
              <CompletionCard
                lessonTitle="Displacement & Distance"
                pointsEarned={10}
                streakDays={profile.streakDays}
                onContinue={() => {
                  setSelectedOption(null);
                  setSelectedProbeChoice(null);
                  setFlowStep('DASHBOARD');
                  setCurrentTab('Home');
                }}
                onBackToDashboard={() => {
                  setSelectedOption(null);
                  setSelectedProbeChoice(null);
                  setFlowStep('DASHBOARD');
                  setCurrentTab('Home');
                }}
              />
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROGRESS TAB                                      */}
        {/* ======================================================== */}
        {currentTab === 'Progress' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your learning progress</Text>
              <Text style={styles.sectionSub}>Consistent habits create big milestones</Text>
            </View>

            <StreakGrid
              streakDays={profile.streakDays}
              minutesThisWeek={profile.minutesThisWeek}
              gridData={mockStreakGrid}
            />

            <View style={styles.progressCard}>
              <Text style={styles.progressCardTitle}>Topics Explored</Text>

              <View style={styles.topicRow}>
                <View style={styles.topicMeta}>
                  <Text style={styles.topicName}>Motion & Mechanics</Text>
                  <Text style={styles.topicPercent}>80%</Text>
                </View>
                <View style={styles.topicTrack}>
                  <View style={[styles.topicFill, { width: '80%', backgroundColor: colors.primary }]} />
                </View>
              </View>

              <View style={styles.topicRow}>
                <View style={styles.topicMeta}>
                  <Text style={styles.topicName}>Laws of Motion</Text>
                  <Text style={styles.topicPercent}>40%</Text>
                </View>
                <View style={styles.topicTrack}>
                  <View style={[styles.topicFill, { width: '40%', backgroundColor: colors.secondary }]} />
                </View>
              </View>

              <View style={styles.topicRow}>
                <View style={styles.topicMeta}>
                  <Text style={styles.topicName}>Gravitation</Text>
                  <Text style={styles.topicPercent}>10%</Text>
                </View>
                <View style={styles.topicTrack}>
                  <View style={[styles.topicFill, { width: '10%', backgroundColor: colors.accent }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PROFILE TAB                                       */}
        {/* ======================================================== */}
        {currentTab === 'Profile' && (
          <View>
            <LearnerProfileCard
              profile={profile}
              onEdit={() => setSetupModalVisible(true)}
              onOpenTeacherPin={() => setTeacherModalVisible(true)}
            />

            {/* Offline learning confidence notice */}
            <FriendlyState
              type="OFFLINE_READY"
              onAction={() => {
                setCurrentTab('Learn');
                setFlowStep('LESSON_LIST');
              }}
              actionText="Review Saved Lessons"
            />
          </View>
        )}

        {/* ======================================================== */}
        {/* JUDGE & DEMO CONTROLS (Discreet bottom section)          */}
        {/* ======================================================== */}
        {judgeToolsVisible && (
          <View style={styles.judgeSection}>
            <View style={styles.judgeTop}>
              <Text style={styles.judgeTitle}>HACKATHON / JUDGE CONTROLS</Text>
              <Pressable onPress={() => setJudgeToolsVisible(false)}>
                <Text style={styles.judgeClose}>✕ Hide</Text>
              </Pressable>
            </View>

            <View style={styles.demoToggleRow}>
              <View>
                <Text style={styles.demoToggleLabel}>Airplane-mode demo</Text>
                <Text style={styles.demoToggleSub}>Simulate offline behavior on stage</Text>
              </View>
              <Switch value={forcedOffline} onValueChange={setForcedOffline} />
            </View>

            <View style={styles.judgeButtonsRow}>
              <Pressable
                style={styles.judgeBtn}
                onPress={() => navigation.navigate('Trace')}
              >
                <Text style={styles.judgeBtnText}>🔍 Open Trace</Text>
              </Pressable>
              <Pressable
                style={styles.judgeBtn}
                onPress={() => navigation.navigate('RawLog')}
              >
                <Text style={styles.judgeBtnText}>📋 Open Raw Log</Text>
              </Pressable>
              <Pressable
                style={styles.judgeBtn}
                onPress={() => setTeacherModalVisible(true)}
              >
                <Text style={styles.judgeBtnText}>👩🏽‍🏫 Teacher Dashboard</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Main Student Navigation: Home, Learn, Progress, Profile */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'Home') setFlowStep('DASHBOARD');
        }}
        onOpenJudgeTools={() => setJudgeToolsVisible(!judgeToolsVisible)}
      />

      {/* Modals */}
      <StudentSetupModal
        visible={setupModalVisible}
        onClose={() => setSetupModalVisible(false)}
        onFinish={(name, language, subject) => {
          setProfile((p) => ({ ...p, name, language, subject }));
          setSetupModalVisible(false);
        }}
      />

      <TeacherDashboardModal
        visible={teacherModalVisible}
        onClose={() => setTeacherModalVisible(false)}
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
    padding: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sectionSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  subjectsRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  optionsList: {
    marginVertical: spacing.sm,
  },
  supportNote: {
    backgroundColor: '#F5F7FF',
    padding: spacing.md,
    borderRadius: radius.card,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: spacing.xs,
  },
  supportNoteText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  progressCardTitle: {
    ...typography.cardHeading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  topicRow: {
    marginBottom: spacing.md,
  },
  topicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  topicName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  topicPercent: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  topicTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  topicFill: {
    height: '100%',
    borderRadius: 4,
  },
  judgeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xl,
    ...shadows.subtle,
  },
  judgeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  judgeTitle: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  judgeClose: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  demoToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm + 4,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  demoToggleLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoToggleSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  judgeButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  judgeBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  judgeBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
