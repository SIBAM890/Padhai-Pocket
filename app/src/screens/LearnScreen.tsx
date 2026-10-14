import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { nextAction, createInitialState, type EngineState, type EngineContext } from '../engine';
import { computeSeed, probeOrder } from '../engine/seed';
import { insertEvent, listEvents, pendingEvents } from '../db/database';
import { syncPending } from '../sync/syncClient';
import { getHeroChunk, getHeroItem, getPackHash } from '../content/loader';
import { getDeviceId } from '../utils/device';
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
  const [deviceId, setDeviceId] = useState<string>('device_init');

  // Deterministic Engine Context & State Ref
  const profileId = 'prof_demo_01';
  const conceptId = 'distance_vs_displacement';
  const engineContextRef = useRef<EngineContext>({
    now: Date.now(),
    seed: 1806635391,
    device_id: 'device_init',
  });

  const engineStateRef = useRef<EngineState>(
    createInitialState(
      profileId,
      'sess_01',
      conceptId,
      0.42,
      1,
      forcedOffline ? 'OFFLINE' : networkMode
    )
  );

  useEffect(() => {
    getDeviceId().then((id) => {
      setDeviceId(id);
      engineContextRef.current.device_id = id;
    });
    computeSeed(profileId, conceptId, 'A').then((seed) => {
      engineContextRef.current.seed = seed;
    });
  }, []);

  // Keep engine state network mode synchronized with actual status
  useEffect(() => {
    engineStateRef.current.network_mode = forcedOffline ? 'OFFLINE' : networkMode;
  }, [networkMode, forcedOffline]);

  // When airplane mode is toggled OFF, attempt to sync pending events
  useEffect(() => {
    if (!forcedOffline && networkMode === 'ONLINE') {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      syncPending({ baseUrl, deviceId }).catch(() => {});
    }
  }, [forcedOffline, networkMode, deviceId]);

  // Helper to refresh pending queue & trigger sync if online
  const refreshPending = useCallback(async () => {
    try {
      const pending = await pendingEvents(10);
      if (pending.length > 0 && !forcedOffline && networkMode === 'ONLINE') {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        await syncPending({ baseUrl, deviceId });
      }
    } catch (e) {
      console.warn('refreshPending error', e);
    }
  }, [forcedOffline, networkMode, deviceId]);

  // 1. MCQ Option Selection -> calls nextAction & persists via insertEvent
  const handleSelectOption = async (optId: string) => {
    setSelectedOption(optId);
    const correct = optId === mockLessonQuestion.correctOptionId;

    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_MCQ',
        correct,
        misconception_tag: correct ? null : 'path_equals_displacement',
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    await refreshPending();

    if (correct) {
      setTimeout(() => setFlowStep('COMPLETION'), 700);
    } else {
      setTimeout(() => setFlowStep('PROBE_PICTURE'), 700);
    }
  };

  // 2. Picture Probe Selection -> calls nextAction (modality P)
  const handleSelectPictureProbe = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
    const correct = choiceId === mockProbes.PICTURE.correctChoiceId;

    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_PROBE_ITEM',
        modality: 'P',
        correct,
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    await refreshPending();

    setSelectedProbeChoice(null);
    setTimeout(() => setFlowStep('PROBE_AUDIO'), 700);
  };

  // 3. Audio Probe Selection -> calls nextAction (modality A)
  const handleSelectAudioProbe = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
    const correct = choiceId === mockProbes.AUDIO.correctChoiceId;

    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_PROBE_ITEM',
        modality: 'A',
        correct,
        audio_available: true,
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    await refreshPending();

    setSelectedProbeChoice(null);
    setTimeout(() => setFlowStep('PROBE_TEXT'), 700);
  };

  // 4. Text Probe Selection -> calls nextAction (modality T)
  const handleSelectTextProbe = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
    const correct = choiceId === mockProbes.TEXT.correctChoiceId;

    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_PROBE_ITEM',
        modality: 'T',
        correct,
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    await refreshPending();

    setSelectedProbeChoice(null);
    setTimeout(() => setFlowStep('CONFIRMATION'), 700);
  };

  // 5. Confirmation Selection -> calls nextAction (OBSERVE_CONFIRM_ITEM)
  const handleSelectConfirmation = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
  };

  const handleContinueConfirmation = async () => {
    if (!selectedProbeChoice) return;
    const correct = selectedProbeChoice === 'c1';

    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_CONFIRM_ITEM',
        correct,
        term_id: 'T_DISP',
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    await refreshPending();

    if (correct) {
      setFlowStep('COMPLETION');
    } else {
      setFlowStep('REMEDIATION');
    }
  };

  // 6. Remediation Completion -> advance to next item / completion
  const handleCompleteRemediation = async () => {
    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'NEXT_LESSON',
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    await refreshPending();

    setFlowStep('COMPLETION');
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

  // Derive dashboard active subject labels from student profile choice
  const activeSubjectTitle =
    profile.subject === 'mathematics'
      ? 'Mathematics · Number Systems'
      : profile.subject === 'science'
      ? 'Science · Cells & Living World'
      : 'Physics · Motion';

  const activeSubjectTitleOr =
    profile.subject === 'mathematics'
      ? 'ସଂଖ୍ୟା ପ୍ରଣାଳୀ'
      : profile.subject === 'science'
      ? 'କୋଷ ଓ ଜୀବ ଜଗତ'
      : 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with greeting and status */}
        <AppHeader
          greeting={`Good morning, ${profile.name}`}
          subgreeting="Keep learning, one step at a time."
          avatar={profile.avatar}
          gender={profile.gender}
          networkMode={networkMode}
          forcedOffline={forcedOffline}
          onAvatarPress={() => {
            setCurrentTab('Profile');
            setFlowStep('DASHBOARD');
          }}
        />

        {/* ======================================================== */}
        {/* TAB 1: HOME DASHBOARD                                    */}
        {/* ======================================================== */}
        {currentTab === 'Home' && flowStep === 'DASHBOARD' && (
          <View>
            <ContinueLearningCard
              subject={activeSubjectTitle}
              lessonNumber="Lesson 2"
              lessonTitle="Displacement and Distance"
              lessonTitleOr={activeSubjectTitleOr}
              progressPercent={80}
              onContinue={() => setFlowStep('SOUND_CHECK')}
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
              onPress={() => setFlowStep('SOUND_CHECK')}
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
        {(currentTab === 'Learn' || flowStep !== 'DASHBOARD') && currentTab !== 'Progress' && currentTab !== 'Profile' && (
          <View>
            {flowStep === 'DASHBOARD' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{activeSubjectTitle}</Text>
                  <Text style={styles.sectionSub}>Chapter 5 Lessons</Text>
                </View>
                {mockLessonsList.map((les) => (
                  <LessonBrowserCard
                    key={les.id}
                    lesson={les}
                    onPress={() => setFlowStep('SOUND_CHECK')}
                  />
                ))}
              </View>
            )}

            {flowStep === 'LESSON_LIST' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{activeSubjectTitle}</Text>
                  <Text style={styles.sectionSub}>Chapter 5 Lessons</Text>
                </View>
                {mockLessonsList.map((les) => (
                  <LessonBrowserCard
                    key={les.id}
                    lesson={les}
                    onPress={() => setFlowStep('SOUND_CHECK')}
                  />
                ))}
              </View>
            )}

            {flowStep === 'SOUND_CHECK' && (
              <SoundCheck
                onHeard={() => setFlowStep('LESSON_INTRO')}
                onCannotHear={() => setFlowStep('LESSON_INTRO')}
              />
            )}

            {flowStep === 'LESSON_INTRO' && (
              <LessonIntroCard
                title={activeSubjectTitle}
                titleOr={activeSubjectTitleOr}
                estimatedMinutes={5}
                lessonNumber="Lesson 2 of 3"
                onStart={() => setFlowStep('QUESTION_INTERACTION')}
                onBack={() => setFlowStep('DASHBOARD')}
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
                onSelect={handleSelectPictureProbe}
              />
            )}

            {flowStep === 'PROBE_AUDIO' && (
              <AudioProbe
                prompt={mockProbes.AUDIO.prompt}
                choices={mockProbes.AUDIO.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={handleSelectAudioProbe}
              />
            )}

            {flowStep === 'PROBE_TEXT' && (
              <TextProbe
                prompt={mockProbes.TEXT.prompt}
                promptOr={mockProbes.TEXT.promptOr}
                choices={mockProbes.TEXT.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={handleSelectTextProbe}
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
                onSelect={handleSelectConfirmation}
                onContinue={handleContinueConfirmation}
              />
            )}

            {flowStep === 'REMEDIATION' && (
              <RemediationCard
                explanation="Displacement is the straight-line distance between where you started and where you ended. If you walk east 3 meters and west 3 meters, you are back at 0 meters!"
                explanationOr="ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।"
                onListen={() => {}}
                onTryAgain={() => {
                  setSelectedOption(null);
                  setSelectedProbeChoice(null);
                  setFlowStep('QUESTION_INTERACTION');
                }}
                onContinue={handleCompleteRemediation}
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
                <Text style={styles.judgeBtnText}>Open Trace</Text>
              </Pressable>
              <Pressable
                style={styles.judgeBtn}
                onPress={() => navigation.navigate('RawLog')}
              >
                <Text style={styles.judgeBtnText}>Open Raw Log</Text>
              </Pressable>
              <Pressable
                style={styles.judgeBtn}
                onPress={() => setTeacherModalVisible(true)}
              >
                <Text style={styles.judgeBtnText}>Teacher Overview</Text>
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
          if (tab === 'Progress' || tab === 'Profile') setFlowStep('DASHBOARD');
        }}
        onOpenJudgeTools={() => setJudgeToolsVisible(!judgeToolsVisible)}
      />

      {/* Modals */}
      <StudentSetupModal
        visible={setupModalVisible}
        initialProfile={profile}
        onClose={() => setSetupModalVisible(false)}
        onFinish={(data) => {
          setProfile((p) => ({
            ...p,
            name: data.name,
            gender: data.gender,
            language: data.language,
            subject: data.subject,
            avatar: data.gender,
            onboardingComplete: true,
          }));
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
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  subjectsRow: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  optionsList: {
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  supportNote: {
    backgroundColor: '#F5F7FF',
    padding: spacing.md,
    borderRadius: radius.card,
    marginTop: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  supportNoteText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  progressCardTitle: {
    ...typography.body,
    fontWeight: '700',
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
    color: colors.textPrimary,
    fontWeight: '600',
  },
  topicPercent: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  topicTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  topicFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  judgeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: spacing.lg,
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
