import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
  useWindowDimensions,
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
import { JudgeTelemetryPanel } from '../components/JudgeTelemetryPanel';
import {
  mockProfile,
  mockStreakGrid,
  mockSubjects,
  mockLessonsList,
} from '../mock/mockData';
import { useNetworkStatus } from '../network/network';
import {
  nextAction,
  createInitialState,
  type EngineState,
  type EngineContext,
} from '../engine';
import { computeSeed, probeOrder } from '../engine/seed';
import { insertEvent, listEvents, pendingEvents, subscribeDatabase } from '../db/database';
import { syncPending } from '../sync/syncClient';
import { getDeviceId } from '../utils/device';
import {
  getTimeOfDayGreeting,
  computeStreakData,
  type StreakComputationResult,
} from '../utils/streakHelper';
import { useFocusEffect } from '@react-navigation/native';
import {
  getHeroChunk,
  getHeroItem,
  getProbeItems,
  getConfirmItem,
  getKuiGlossary,
  getPackHash,
} from '../content/loader';
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
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 1024;

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
  const [setupModalVisible, setSetupModalVisible] = useState(true);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [judgeToolsVisible, setJudgeToolsVisible] = useState(false);

  // Profile data in local state
  const [profile, setProfile] = useState(mockProfile);

  // Dynamic time-of-day greeting (UI layer only, preserves FR-21 engine purity)
  const [greeting, setGreeting] = useState<string>(() =>
    getTimeOfDayGreeting(mockProfile.name)
  );

  // Dynamic 4-week diagnostic mastery matrix & streak stats
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [streakState, setStreakState] = useState<StreakComputationResult>(() =>
    computeStreakData([], false)
  );

  const loadStreakAndStats = useCallback(async () => {
    try {
      const allEvents = await listEvents(200);
      const computed = computeStreakData(allEvents || [], demoMode);
      setStreakState(computed);
    } catch (e) {
      console.warn('Failed to compute streak from database events', e);
    }
  }, [demoMode]);

  // Keep greeting synchronized with profile
  useEffect(() => {
    setGreeting(getTimeOfDayGreeting(profile.name));
  }, [profile.name]);

  // Update greeting and streak on screen focus
  useFocusEffect(
    useCallback(() => {
      setGreeting(getTimeOfDayGreeting(profile.name));
      loadStreakAndStats();
    }, [profile.name, loadStreakAndStats])
  );

  // Listen to database mutations and custom event 'padhai-event-updated'
  useEffect(() => {
    loadStreakAndStats();
    const unsub = subscribeDatabase(() => {
      loadStreakAndStats();
    });

    const handleCustomEvent = () => {
      loadStreakAndStats();
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('padhai-event-updated', handleCustomEvent);
    }

    return () => {
      unsub();
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('padhai-event-updated', handleCustomEvent);
      }
    };
  }, [loadStreakAndStats]);

  // Re-render trigger for live telemetry synchronization
  const [, setTelemetryTick] = useState(0);
  const triggerTelemetryUpdate = useCallback(() => setTelemetryTick((t) => t + 1), []);

  // Content pack loader hooks
  const heroChunk = getHeroChunk();
  const heroItem = getHeroItem();
  const probeItems = getProbeItems();
  const confirmItem = getConfirmItem();
  const kuiGlossary = getKuiGlossary();
  const packHash = getPackHash();

  // Derived real question object from content pack
  const question = {
    titleOr: heroChunk?.title ?? 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନର ସଂଜ୍ଞା',
    storyOr: heroChunk?.odiaText ?? '',
    promptOr: heroItem?.stem ?? 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ ମଧ୍ୟରେ ମୁଖ୍ୟ ପାର୍ଥକ୍ୟ କ’ଣ?',
    options: (heroItem?.options ?? [
      'ଦୂରତା ଏକ ଅଦିଶ ରାଶି ଏବଂ ବିସ୍ଥାପନ ଏକ ସଦିଶ ରାଶି ଅଟେ',
      'ଦୂରତା ସର୍ବଦା ବିସ୍ଥାପନ ଠାରୁ କମ୍ ହୋଇଥାଏ',
      'ବିସ୍ଥାପନର କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଦିଗ ନଥାଏ',
      'ଉଭୟ ଦୂରତା ଓ ବିସ୍ଥାପନ କେବଳ ମୂଳବିନ୍ଦୁ ଉପରେ ନିର୍ଭର କରନ୍ତି',
    ]).map((opt: string, i: number) => ({
      id: `opt_${i}`,
      label: String.fromCharCode(65 + i),
      text: opt,
      subtext: i === 0 ? 'ସଠିକ୍ ସଂଜ୍ଞା' : undefined,
    })),
    correctOptionId: `opt_${heroItem?.correct ?? 0}`,
  };

  // Real probe objects from content pack
  const pictureProbe = {
    prompt: probeItems?.P?.stem ?? 'ନିମ୍ନ ଚିତ୍ରରେ ଏକ ବସ୍ତୁର ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁରୁ ଅନ୍ତିମ ବିନ୍ଦୁ ପର୍ଯ୍ୟନ୍ତ ଗତି ଦର୍ଶାଯାଇଛି । ଏଥିରେ ବସ୍ତୁର ବିସ୍ଥାପନ କେଉଁ ଚିତ୍ରଟି ସଠିକ୍ ଭାବରେ ଦର୍ଶାଉଛି?',
    titleOr: 'ଚିତ୍ର ଯାଞ୍ଚ: ବିସ୍ଥାପନ କେଉଁ ଚିତ୍ରଟି ସଠିକ୍?',
    choices: [
      { id: 'p_0', icon: '🚩', label: 'At the Flag', desc: 'Zero distance from start' },
      { id: 'p_1', icon: '➡️', label: '3m East', desc: 'Still along the path' },
      { id: 'p_2', icon: '⬅️', label: '6m West', desc: 'Far away from origin' },
    ],
    correctChoiceId: `p_${probeItems?.P?.correct ?? 0}`,
  };

  const audioProbe = {
    prompt: probeItems?.A?.stem ?? 'ଶୁଣନ୍ତୁ ଏବଂ କୁହନ୍ତୁ: ଗୋଟିଏ ବସ୍ତୁ O ବିନ୍ଦୁରୁ ବାହାରି A ବିନ୍ଦୁକୁ ଗଲା ଏବଂ ପୁଣି O ବିନ୍ଦୁକୁ ଫେରିଆସିଲା । ଏହି କ୍ଷେତ୍ରରେ ବସ୍ତୁର ବିସ୍ଥାପନ କେତେ ହେବ?',
    titleOr: 'ଓଡ଼ିଆ ଉଚ୍ଚାରଣ ଶୁଣନ୍ତୁ',
    choices: [
      { id: 'a_0', icon: '📍', label: 'Original Spot (ଆରମ୍ଭ ସ୍ଥାନ)' },
      { id: 'a_1', icon: '📏', label: 'Straight Path (ଦୂରତା)' },
      { id: 'a_2', icon: '🔄', label: 'Round Trip (ଚକ୍ର)' },
    ],
    correctChoiceId: `a_${probeItems?.A?.correct ?? 0}`,
  };

  const textProbe = {
    prompt: probeItems?.T?.stem ?? 'ଦୂରତା (distance) ଏବଂ ବିସ୍ଥାପନ (displacement) ମଧ୍ୟରେ ମୁଖ୍ୟ ପାର୍ଥକ୍ୟ କ’ଣ?',
    promptOr: probeItems?.T?.stem ?? 'ଦୂରତା (distance) ଏବଂ ବିସ୍ଥାପନ (displacement) ମଧ୍ୟରେ ମୁଖ୍ୟ ପାର୍ଥକ୍ୟ କ’ଣ?',
    choices: (probeItems?.T?.options ?? [
      'ଦୂରତା ଏକ ଅଦିଶ ରାଶି ଏବଂ ବିସ୍ଥାପନ ଏକ ସଦିଶ ରାଶି ଅଟେ',
      'ଦୂରତା ସର୍ବଦା ବିସ୍ଥାପନ ଠାରୁ କମ୍ ହୋଇଥାଏ',
      'ବିସ୍ଥାପନର କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଦିଗ ନଥାଏ',
      'ଉଭୟ ଦୂରତା ଓ ବିସ୍ଥାପନ କେବଳ ମୂଳବିନ୍ଦୁ ଉପରେ ନିର୍ଭର କରନ୍ତି',
    ]).map((opt: string, i: number) => ({
      id: `t_${i}`,
      label: String.fromCharCode(65 + i),
      text: opt,
    })),
    correctChoiceId: `t_${probeItems?.T?.correct ?? 0}`,
  };

  // Seeded probe sequence state (PRD §4.9)
  const [probeSequence, setProbeSequence] = useState<Array<'P' | 'A' | 'T'>>(['T', 'A', 'P']);
  const [probeIndex, setProbeIndex] = useState(0);

  // Deterministic Engine Context & State Ref
  const profileId = 'prof_demo_01';
  const conceptId = 'distance_vs_displacement';
  const engineContextRef = useRef<EngineContext>({
    now: Date.now(),
    seed: 1806635391, // Golden seed for (prof_demo_01, distance_vs_displacement, A)
    device_id: 'dev_tab_01',
  });

  const engineStateRef = useRef<EngineState>(
    createInitialState(
      profileId,
      'sess_01',
      conceptId,
      0.42,
      1,
      forcedOffline ? 'OFFLINE' : networkMode,
      packHash && packHash !== 'unbuilt' ? packHash.slice(0, 12) : 'e3b0c44298fc'
    )
  );

  // Keep engine state network mode synchronized with actual status
  useEffect(() => {
    engineStateRef.current.network_mode = forcedOffline ? 'OFFLINE' : networkMode;
    triggerTelemetryUpdate();
  }, [networkMode, forcedOffline, triggerTelemetryUpdate]);

  // Load stable device ID and compute seed on mount
  useEffect(() => {
    getDeviceId()
      .then((id) => {
        if (engineContextRef.current) {
          engineContextRef.current.device_id = id;
          triggerTelemetryUpdate();
        }
      })
      .catch(() => {});

    computeSeed(profileId, conceptId, 'A')
      .then((computed) => {
        if (engineContextRef.current) {
          engineContextRef.current.seed = computed;
          triggerTelemetryUpdate();
        }
        const order = probeOrder(computed);
        setProbeSequence(order);
      })
      .catch(() => {});
  }, [profileId, conceptId, triggerTelemetryUpdate]);

  // Advance to next probe in deterministic sequence or to confirmation
  const advanceProbe = (currentStepModality: 'P' | 'A' | 'T') => {
    const nextIdx = probeIndex + 1;
    setProbeIndex(nextIdx);
    if (nextIdx >= probeSequence.length) {
      setTimeout(() => setFlowStep('CONFIRMATION'), 700);
      return;
    }
    const nextMod = probeSequence[nextIdx];
    if (nextMod === 'P') setTimeout(() => setFlowStep('PROBE_PICTURE'), 700);
    else if (nextMod === 'A') setTimeout(() => setFlowStep('PROBE_AUDIO'), 700);
    else setTimeout(() => setFlowStep('PROBE_TEXT'), 700);
  };

  // Listen to database changes for real-time telemetry updates
  useEffect(() => {
    const unsub = subscribeDatabase(() => {
      triggerTelemetryUpdate();
    });
    return unsub;
  }, [triggerTelemetryUpdate]);

  // Request pedagogical plan from backend LangGraph agent workflow when online
  useEffect(() => {
    if (forcedOffline || networkMode !== 'ONLINE') return;
    const callAgent = async () => {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        const resp = await fetch(`${baseUrl}/v1/agent/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_concept_ids: ['distance_vs_displacement'],
            mastery_bucket: 'low',
            tier_history: [],
          }),
        });
        const plan = await resp.json();
        console.log('[AGENT PLAN]', plan);
      } catch (e) {
        console.warn('[AGENT PLAN FAILED]', e);
      }
    };
    callAgent();
  }, [forcedOffline, networkMode]);

  // When airplane mode is toggled OFF or network becomes ONLINE, attempt to sync pending events
  useEffect(() => {
    if (!forcedOffline && networkMode === 'ONLINE') {
      syncPending().catch(() => {});
    }
  }, [forcedOffline, networkMode]);

  // Helper to refresh pending queue & trigger sync if online
  const refreshPending = useCallback(async () => {
    try {
      const pending = await pendingEvents(10);
      if (pending.length > 0 && !forcedOffline && networkMode === 'ONLINE') {
        await syncPending();
      }
      triggerTelemetryUpdate();
    } catch (e) {
      console.warn('refreshPending error', e);
    }
  }, [forcedOffline, networkMode, triggerTelemetryUpdate]);

  // Active question & options resolution from pack loader
  const questionTitle = heroChunk?.title || 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନର ସଂଜ୍ଞା';
  const questionStory = heroChunk?.odiaText || '';
  const questionPrompt = heroItem?.stem || 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ ମଧ୍ୟରେ ମୁଖ୍ୟ ପାର୍ଥକ୍ୟ କ’ଣ?';

  // 1. MCQ Option Selection -> calls pure nextAction & persists via insertEvent
  const handleSelectOption = async (optId: string) => {
    setSelectedOption(optId);
    const isCorrect = optId === question.correctOptionId;

    engineContextRef.current.now = Date.now();
    const result = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_MCQ',
        correct: isCorrect,
        misconception_tag: isCorrect ? null : 'path_equals_displacement',
      },
      engineContextRef.current
    );

    for (const event of result.events) {
      await insertEvent(event as any);
    }
    engineStateRef.current = result.state;
    triggerTelemetryUpdate();
    await refreshPending();
    loadStreakAndStats();

    if (isCorrect) {
      setTimeout(() => setFlowStep('COMPLETION'), 700);
    } else {
      setProbeIndex(0);
      const firstMod = probeSequence[0] || 'T';
      if (firstMod === 'P') setTimeout(() => setFlowStep('PROBE_PICTURE'), 700);
      else if (firstMod === 'A') setTimeout(() => setFlowStep('PROBE_AUDIO'), 700);
      else setTimeout(() => setFlowStep('PROBE_TEXT'), 700);
    }
  };

  // 2. Picture Probe Selection -> calls nextAction (modality P)
  const handleSelectPictureProbe = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
    const correct = choiceId === pictureProbe.correctChoiceId;

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
    triggerTelemetryUpdate();
    await refreshPending();
    loadStreakAndStats();

    setSelectedProbeChoice(null);
    advanceProbe('P');
  };

  // 3. Audio Probe Selection -> calls nextAction (modality A)
  const handleSelectAudioProbe = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
    const correct = choiceId === audioProbe.correctChoiceId;

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
    triggerTelemetryUpdate();
    await refreshPending();
    loadStreakAndStats();

    setSelectedProbeChoice(null);
    advanceProbe('A');
  };

  // 4. Text Probe Selection -> calls nextAction (modality T)
  const handleSelectTextProbe = async (choiceId: string) => {
    setSelectedProbeChoice(choiceId);
    const correct = choiceId === textProbe.correctChoiceId;

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
    triggerTelemetryUpdate();
    await refreshPending();
    loadStreakAndStats();

    setSelectedProbeChoice(null);
    if (result.state.step === 'CONFIRM_ACTIVE') {
      setTimeout(() => setFlowStep('CONFIRMATION'), 700);
    } else if (result.state.step === 'EPISODE_DONE') {
      setTimeout(() => setFlowStep('COMPLETION'), 700);
    } else {
      advanceProbe('T');
    }
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
    triggerTelemetryUpdate();
    await refreshPending();
    loadStreakAndStats();

    if (result.state.step === 'REMEDIATION_ACTIVE' || !correct) {
      setFlowStep('REMEDIATION');
    } else {
      setFlowStep('COMPLETION');
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
    triggerTelemetryUpdate();
    await refreshPending();
    loadStreakAndStats();

    setFlowStep('COMPLETION');
  };

  const handleMicPress = () => {
    if (voiceState === 'Ready') {
      setVoiceState('Listening');
      setTimeout(() => {
        setVoiceState('Thinking');
        setTimeout(() => {
          setVoiceState('Ready');
          handleSelectOption(question.correctOptionId);
        }, 1200);
      }, 1500);
    }
  };

  const getOptionState = (optId: string): OptionState => {
    if (!selectedOption) return 'default';
    if (selectedOption === optId) {
      return optId === question.correctOptionId ? 'correct' : 'needs-review';
    }
    return optId === question.correctOptionId ? 'correct' : 'default';
  };

  const activeSubjectTitle = profile.subject === 'physics'
    ? 'Physics · Motion & Mechanics (ପଦାର୍ଥ ବିଜ୍ଞାନ)'
    : profile.subject === 'mathematics'
    ? 'Mathematics (ଗଣିତ)'
    : 'Science (ବିଜ୍ଞାନ)';

  const activeSubjectTitleOr = profile.subject === 'physics'
    ? 'ପଦାର୍ଥ ବିଜ୍ଞାନ'
    : profile.subject === 'mathematics'
    ? 'ଗଣିତ'
    : 'ବିଜ୍ଞାନ';

  // Kui Glossary term lookup for displacement
  const kuiTerm = kuiGlossary?.find((t: any) => t.term_id === 'T_DISP');
  const remediationKuiText = kuiTerm?.kui?.description || 'ବସ୍ତୁ କେଉଁଠାରୁ ଆରମ୍ଭ କରି ଯେଉଁଠାରେ ପହଞ୍ଚେ, ସେହି ସର୍ବନିମ୍ନ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।';
  const remediationOdiaText = kuiTerm?.odia_from_textbook || 'ବିସ୍ଥାପନ';

  // The complete, 100% preserved visual UI of PadhAI Pocket
  const studentUI = (
    <SafeAreaView style={styles.safe}>
      {/* Branded Header */}
      <AppHeader
        greeting={greeting}
        subgreeting="Keep learning, one step at a time."
        gender={profile.gender}
        networkMode={networkMode}
        forcedOffline={forcedOffline}
        onAvatarPress={() => setCurrentTab('Profile')}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* TAB 1: HOME DASHBOARD                                    */}
        {/* ======================================================== */}
        {currentTab === 'Home' && flowStep === 'DASHBOARD' && (
          <View>
            <ContinueLearningCard
              subject={activeSubjectTitle}
              lessonTitle="Displacement vs Distance (ବିସ୍ଥାପନ)"
              lessonTitleOr="ଦୂରତା ଏବଂ ବିସ୍ଥାପନ"
              lessonNumber="Lesson 2 of 3"
              progressPercent={65}
              onContinue={() => setFlowStep('SOUND_CHECK')}
            />

            <StreakGrid
              streakDays={streakState.streakDays}
              minutesThisWeek={streakState.minutesThisWeek}
              gridData={streakState.gridData}
              defaultSelectedCell={streakState.todayCell}
            />

            <GoalCard
              goalTitle="Complete 1 lesson today"
              activitiesDone={streakState.todayActivitiesDone}
              totalActivities={streakState.totalGoalActivities}
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
                  conceptTitle={questionTitle}
                  conceptTitleOr={question.titleOr}
                  story={questionStory}
                  storyOr={question.storyOr}
                  prompt={questionPrompt}
                  promptOr={question.promptOr}
                />

                <View style={styles.optionsList}>
                  {question.options.map((opt) => (
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

                {selectedOption && selectedOption !== question.correctOptionId && (
                  <View style={styles.supportNote}>
                    <Text style={styles.supportNoteText}>
                      Let{"'"}s look at this together · ଚାଲନ୍ତୁ ଏହାକୁ ବୁଝିବା
                    </Text>
                  </View>
                )}
              </View>
            )}

            {flowStep === 'PROBE_PICTURE' && (
              <PictureProbe
                prompt={pictureProbe.prompt}
                titleOr={pictureProbe.titleOr}
                choices={pictureProbe.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={handleSelectPictureProbe}
              />
            )}

            {flowStep === 'PROBE_AUDIO' && (
              <AudioProbe
                prompt={audioProbe.prompt}
                titleOr={audioProbe.titleOr}
                choices={audioProbe.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={handleSelectAudioProbe}
              />
            )}

            {flowStep === 'PROBE_TEXT' && (
              <TextProbe
                prompt={textProbe.prompt}
                promptOr={textProbe.promptOr}
                choices={textProbe.choices}
                selectedChoiceId={selectedProbeChoice}
                onSelect={handleSelectTextProbe}
              />
            )}

            {flowStep === 'CONFIRMATION' && (
              <ConfirmationCard
                question={confirmItem?.stem || "If you start at point A, run 100 meters, and return to point A, what is your displacement?"}
                questionOr="ଯଦି ଆପଣ A ବିନ୍ଦୁରୁ ଦୌଡ଼ି ପୁଣି A କୁ ଫେରିଆସନ୍ତି, ତେବେ ବିସ୍ଥାପନ କେତେ?"
                options={[
                  { id: 'c1', label: 'A', text: '0 m (Zero displacement / ଶୂନ ବିସ୍ଥାପନ)' },
                  { id: 'c2', label: 'B', text: '100 m' },
                  { id: 'c3', label: 'C', text: '200 m' },
                ]}
                selectedOptionId={selectedProbeChoice}
                onSelect={handleSelectConfirmation}
                onContinue={handleContinueConfirmation}
              />
            )}

            {flowStep === 'REMEDIATION' && (() => {
              const matched = engineStateRef.current?.last_resource_match?.selected;
              return (
                <RemediationCard
                  conceptTitle={matched?.title_en ? `${matched.title_en}` : 'Understanding Displacement (ବିସ୍ଥାପନ)'}
                  explanation={remediationKuiText}
                  explanationOr={matched?.title_or ? `${matched.title_or} — ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ${remediationOdiaText} କୁହାଯାଏ।` : `ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁ ଏବଂ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ଥିବା ସର୍ବନିମ୍ନ ଦୂରତାକୁ ${remediationOdiaText} କୁହାଯାଏ।`}
                  resourceId={matched?.resource_id}
                  resourceModality={matched?.modality}
                  resourceReasons={matched?.reasons}
                  matchScore={matched?.score}
                  onListen={() => {}}
                  onTryAgain={() => {
                    setSelectedOption(null);
                    setSelectedProbeChoice(null);
                    setFlowStep('QUESTION_INTERACTION');
                  }}
                  onContinue={handleCompleteRemediation}
                />
              );
            })()}

            {flowStep === 'COMPLETION' && (
              <CompletionCard
                studentName={profile.name}
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
              streakDays={streakState.streakDays}
              minutesThisWeek={streakState.minutesThisWeek}
              gridData={streakState.gridData}
              defaultSelectedCell={streakState.todayCell}
            />

            <View style={styles.progressCard}>
              <Text style={styles.progressCardTitle}>Topics Explored</Text>

              <View style={styles.topicRow}>
                <View style={styles.topicMeta}>
                  <Text style={styles.topicName}>Motion & Mechanics</Text>
                  <Text style={styles.topicPercent}>
                    {Math.round(engineStateRef.current.concept_mastery * 100)}%
                  </Text>
                </View>
                <View style={styles.topicTrack}>
                  <View
                    style={[
                      styles.topicFill,
                      {
                        width: `${Math.round(engineStateRef.current.concept_mastery * 100)}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.topicRow}>
                <View style={styles.topicMeta}>
                  <Text style={styles.topicName}>Term Bridge (Displacement / {remediationOdiaText})</Text>
                  <Text style={styles.topicPercent}>
                    {Math.round((engineStateRef.current.term_masteries?.['T_DISP'] ?? 0.4) * 100)}%
                  </Text>
                </View>
                <View style={styles.topicTrack}>
                  <View
                    style={[
                      styles.topicFill,
                      {
                        width: `${Math.round((engineStateRef.current.term_masteries?.['T_DISP'] ?? 0.4) * 100)}%`,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  />
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
        {/* JUDGE & DEMO CONTROLS (Discreet section on mobile)       */}
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

            <View style={styles.demoToggleRow}>
              <View>
                <Text style={styles.demoToggleLabel}>Demo Streak Matrix</Text>
                <Text style={styles.demoToggleSub}>Simulate 4-week diagnostic activity history</Text>
              </View>
              <Switch value={demoMode} onValueChange={setDemoMode} />
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

  // Desktop Judge Mode Split-Screen View (≥1024px)
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.phoneFrame}>
          {studentUI}
        </View>
        <View style={styles.telemetryPane}>
          <JudgeTelemetryPanel
            engineState={engineStateRef.current}
            engineContext={engineContextRef.current}
            networkMode={networkMode}
            forcedOffline={forcedOffline}
            onToggleForcedOffline={setForcedOffline}
            onRefreshParent={refreshPending}
          />
        </View>
      </View>
    );
  }

  return studentUI;
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    width: '100%',
    height: '100%',
  },
  phoneFrame: {
    width: 440,
    maxWidth: 480,
    height: '100%',
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    overflow: 'hidden',
  },
  telemetryPane: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
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
