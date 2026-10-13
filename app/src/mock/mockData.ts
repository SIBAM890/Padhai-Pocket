/**
 * Comprehensive Mock Data Layer for PadhAI Pocket
 * Powers: Learner profile, Dashboard, Streak Grid, Lessons, Multimodal Probes, Traces, Teacher Overview
 */

export interface LearnerProfile {
  name: string;
  avatar: string;
  language: string;
  standard: string;
  subject: string;
  streakDays: number;
  minutesThisWeek: number;
  completedLessons: number;
  totalPoints: number;
}

export const mockProfile: LearnerProfile = {
  name: 'Sunita',
  avatar: '👧🏽',
  language: 'ଓଡ଼ିଆ (Odia)',
  standard: 'Class 9 (BSE Odisha)',
  subject: 'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)',
  streakDays: 7,
  minutesThisWeek: 42,
  completedLessons: 12,
  totalPoints: 240,
};

export interface StreakDay {
  dayName: string;
  levels: number[]; // 4 weeks of intensity (0: none, 1: low, 2: medium, 3: high)
}

export const mockStreakGrid: StreakDay[] = [
  { dayName: 'Mon', levels: [1, 2, 3, 3] },
  { dayName: 'Tue', levels: [2, 1, 2, 3] },
  { dayName: 'Wed', levels: [0, 2, 3, 2] },
  { dayName: 'Thu', levels: [1, 3, 2, 3] },
  { dayName: 'Fri', levels: [2, 2, 3, 3] },
  { dayName: 'Sat', levels: [3, 1, 2, 3] },
  { dayName: 'Sun', levels: [1, 2, 3, 3] },
];

export interface SubjectModule {
  id: string;
  title: string;
  titleOr: string;
  icon: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  color: string;
}

export const mockSubjects: SubjectModule[] = [
  {
    id: 'sub_motion',
    title: 'Motion & Mechanics',
    titleOr: 'ଗତି ଏବଂ ବଳ',
    icon: '⚡',
    progressPercent: 80,
    completedLessons: 4,
    totalLessons: 5,
    color: '#304FFE',
  },
  {
    id: 'sub_force',
    title: 'Laws of Motion',
    titleOr: 'ଗତିର ନିୟମ',
    icon: '🚀',
    progressPercent: 40,
    completedLessons: 2,
    totalLessons: 5,
    color: '#0F9D8A',
  },
  {
    id: 'sub_gravitation',
    title: 'Gravitation',
    titleOr: 'ମାଧ୍ୟାକର୍ଷଣ',
    icon: '🌍',
    progressPercent: 10,
    completedLessons: 1,
    totalLessons: 4,
    color: '#FF6B5F',
  },
];

export interface LessonItem {
  id: string;
  number: string;
  title: string;
  titleOr: string;
  durationMin: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  summary: string;
}

export const mockLessonsList: LessonItem[] = [
  {
    id: 'les_01',
    number: '01',
    title: 'Describing Motion & Straight Lines',
    titleOr: 'ସରଳରେଖାରେ ଗତି',
    durationMin: 5,
    status: 'COMPLETED',
    summary: 'Understanding origin points, scalar paths, and movement.',
  },
  {
    id: 'les_02',
    number: '02',
    title: 'Distance and Displacement',
    titleOr: 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
    durationMin: 6,
    status: 'IN_PROGRESS',
    summary: 'The crucial difference between path length and straight-line vector.',
  },
  {
    id: 'les_03',
    number: '03',
    title: 'Uniform and Non-Uniform Speed',
    titleOr: 'ସୁଷମ ଓ ଅସୁଷମ ବେଗ',
    durationMin: 7,
    status: 'LOCKED',
    summary: 'Exploring rate of motion and time intervals.',
  },
];

export interface QuestionData {
  title: string;
  titleOr: string;
  conceptId: string;
  storyContext: string;
  storyContextOr: string;
  prompt: string;
  promptOr: string;
  options: Array<{
    id: string;
    label: string;
    text: string;
    subtext?: string;
  }>;
  correctOptionId: string;
}

export const mockLessonQuestion: QuestionData = {
  title: 'Displacement vs Distance',
  titleOr: 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
  conceptId: 'distance_vs_displacement',
  storyContext: 'A student walks 3 meters East from the school flag, stops, and then walks 3 meters West.',
  storyContextOr: 'ଜଣେ ଛାତ୍ର ବିଦ୍ୟାଳୟ ପତାକା ଠାରୁ ୩ ମିଟର ପୂର୍ବକୁ ଯାଇ ପୁଣି ୩ ମିଟର ପଶ୍ଚିମକୁ ଫେରିଆସିଲେ।',
  prompt: 'What is the total displacement of the student from the starting point?',
  promptOr: 'ଆରମ୍ଭ ବିନ୍ଦୁରୁ ଛାତ୍ରଙ୍କର ମୋଟ ବିସ୍ଥାପନ କେତେ?',
  options: [
    { id: 'opt_a', label: 'A', text: '0 m (ଶୂନ ମିଟର)', subtext: 'Back at the exact starting flag' },
    { id: 'opt_b', label: 'B', text: '3 m (୩ ମିଟର)', subtext: 'Distance of single leg' },
    { id: 'opt_c', label: 'C', text: '6 m (୬ ମିଟର)', subtext: 'Total path walked (distance)' },
    { id: 'opt_d', label: 'D', text: '9 m (୯ ମିଟର)' },
  ],
  correctOptionId: 'opt_a',
};

export const mockProbes = {
  PICTURE: {
    title: 'Visual Check: Where did the student end up?',
    titleOr: 'ଚିତ୍ର ଯାଞ୍ଚ: ଛାତ୍ରଟି ବର୍ତ୍ତମାନ କେଉଁଠାରେ ଅଛନ୍ତି?',
    prompt: 'Tap the card showing the final resting point relative to the starting flag:',
    choices: [
      { id: 'p_1', icon: '🚩', label: 'At the Flag', desc: 'Zero distance from start' },
      { id: 'p_2', icon: '➡️', label: '3m East', desc: 'Still along the path' },
      { id: 'p_3', icon: '⬅️', label: '6m West', desc: 'Far away from origin' },
    ],
    correctChoiceId: 'p_1',
  },
  AUDIO: {
    title: 'Listen to the Odia / Kui pronunciation',
    titleOr: 'ଓଡ଼ିଆ ଉଚ୍ଚାରଣ ଶୁଣନ୍ତୁ',
    prompt: 'Tap the audio button to hear the phrase, then select the matching visual.',
    choices: [
      { id: 'a_1', icon: '📍', label: 'Original Spot (ଆରମ୍ଭ ସ୍ଥାନ)' },
      { id: 'a_2', icon: '📏', label: 'Straight Path (ଦୂରତା)' },
      { id: 'a_3', icon: '🔄', label: 'Round Trip (ଚକ୍ର)' },
    ],
    correctChoiceId: 'a_1',
  },
  TEXT: {
    title: 'Definition Check',
    titleOr: 'ସଂଜ୍ଞା ଯାଞ୍ଚ',
    prompt: 'What do we call the shortest distance between starting point and destination?',
    promptOr: 'ପ୍ରାରମ୍ଭିକ ବିନ୍ଦୁରୁ ଅନ୍ତିମ ବିନ୍ଦୁ ମଧ୍ୟରେ ସର୍ବନିମ୍ନ ଦୂରତାକୁ କ’ଣ କୁହାଯାଏ?',
    choices: [
      { id: 't_1', label: 'A', text: 'ବିସ୍ଥାପନ (Displacement)' },
      { id: 't_2', label: 'B', text: 'ଦୂରତା (Distance)' },
      { id: 't_3', label: 'C', text: 'ଦ୍ରୁତି (Speed)' },
      { id: 't_4', label: 'D', text: 'ବେଗ (Velocity)' },
    ],
    correctChoiceId: 't_1',
  },
};

export interface TraceEventMock {
  id: string;
  node: string;
  action: string;
  description: string;
  timestamp: string;
  status: 'ACKED' | 'PENDING' | 'ERROR';
  seq: number;
  payload: Record<string, any>;
}

export const mockTraceEvents: TraceEventMock[] = [
  {
    id: 'evt-101',
    node: 'OBSERVE',
    action: 'MCQ_ANSWER',
    description: 'Student evaluated motion problem (Selected Choice A)',
    timestamp: '10:14:02 AM',
    status: 'ACKED',
    seq: 1,
    payload: { concept_id: 'distance_vs_displacement', correct: false },
  },
  {
    id: 'evt-102',
    node: 'MASTERY',
    action: 'BKT_UPDATE',
    description: 'BKT concept mastery transition: 0.4200 → 0.2248',
    timestamp: '10:14:03 AM',
    status: 'ACKED',
    seq: 2,
    payload: { before: 0.42, after: 0.2248, gain: -0.1952 },
  },
  {
    id: 'evt-103',
    node: 'PROBE',
    action: 'PICTURE_TRIGGER',
    description: 'Triggered multimodal picture probe (BSE9-PHYS-MOTION-S02-P)',
    timestamp: '10:14:04 AM',
    status: 'ACKED',
    seq: 3,
    payload: { modality: 'P', seed: 1806635391 },
  },
  {
    id: 'evt-104',
    node: 'REFLECT',
    action: 'CANDIDATE_RESOLVE',
    description: 'Candidate gap resolved: Path length conflation with vector displacement',
    timestamp: '10:14:10 AM',
    status: 'PENDING',
    seq: 4,
    payload: { resolved: true, rule: 'Agreement' },
  },
  {
    id: 'evt-105',
    node: 'ACT',
    action: 'SCAFFOLD_PREPARE',
    description: 'Supportive bilingual remediation card generated',
    timestamp: '10:14:12 AM',
    status: 'PENDING',
    seq: 5,
    payload: { audio_first: true, language: 'Odia' },
  },
];

export interface TeacherDataMock {
  overview: {
    activeLearners: number;
    syncedEpisodes: number;
    offlineDevices: number;
    flaggedAssistance: number;
  };
  learners: Array<{
    id: string;
    name: string;
    avatar: string;
    conceptMastery: number;
    termMastery: number;
    confirmedGaps: string[];
    provisionalFlags: string[];
    lastActive: string;
  }>;
}

export const mockTeacherData: TeacherDataMock = {
  overview: {
    activeLearners: 18,
    syncedEpisodes: 42,
    offlineDevices: 12,
    flaggedAssistance: 3,
  },
  learners: [
    {
      id: 'L01',
      name: 'Sunita Majhi',
      avatar: '👧🏽',
      conceptMastery: 0.76,
      termMastery: 0.48,
      confirmedGaps: ['Displacement (ବିସ୍ଥାପନ)'],
      provisionalFlags: ['Audio-first preferred'],
      lastActive: '10 mins ago',
    },
    {
      id: 'L02',
      name: 'Rohan Naik',
      avatar: '👦🏽',
      conceptMastery: 0.88,
      termMastery: 0.82,
      confirmedGaps: [],
      provisionalFlags: [],
      lastActive: '25 mins ago',
    },
    {
      id: 'L03',
      name: 'Puja Mallick',
      avatar: '👧🏽',
      conceptMastery: 0.34,
      termMastery: 0.28,
      confirmedGaps: ['Reading speed', 'Scalar vs Vector'],
      provisionalFlags: ['Teacher check requested'],
      lastActive: '1 hr ago',
    },
  ],
};
