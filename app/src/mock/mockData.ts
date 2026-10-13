/**
 * Clean Mock Data Layer for PadhAI Pocket UI
 * Structured to seamlessly map to content packs, engine state, and SQLite events.
 */

export interface LessonMock {
  chapter: string;
  lessonIndex: number;
  totalLessons: number;
  conceptId: string;
  title: string;
  titleOr: string;
  prompt: string;
  promptOr: string;
  illustrationType: 'motion_east_west' | 'straight_line';
  options: Array<{
    id: string;
    label: string;
    text: string;
    subtext?: string;
  }>;
  correctOptionId: string;
}

export const mockLesson: LessonMock = {
  chapter: 'Motion (ଗତି)',
  lessonIndex: 1,
  totalLessons: 3,
  conceptId: 'distance_vs_displacement',
  title: 'Distance & Displacement',
  titleOr: 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
  prompt: 'A student walks 3 m east and then 3 m west. What is the displacement?',
  promptOr: 'ଜଣେ ଛାତ୍ର ୩ ମିଟର ପୂର୍ବକୁ ଏବଂ ତା’ପରେ ୩ ମିଟର ପଶ୍ଚିମକୁ ଯାଉଛି। ତାର ବିସ୍ଥାପନ କେତେ?',
  illustrationType: 'motion_east_west',
  options: [
    { id: 'opt_a', label: 'A', text: '0 m (ଶୂନ ମିଟର)', subtext: 'Back to start position' },
    { id: 'opt_b', label: 'B', text: '3 m (୩ ମିଟର)' },
    { id: 'opt_c', label: 'C', text: '6 m (୬ ମିଟର)', subtext: 'Total distance traveled' },
    { id: 'opt_d', label: 'D', text: '9 m (୯ ମିଟର)' },
  ],
  correctOptionId: 'opt_a',
};

export interface ProbeMock {
  type: 'PICTURE' | 'AUDIO' | 'TEXT';
  title: string;
  prompt: string;
  promptOr: string;
  choices: Array<{
    id: string;
    label?: string;
    text?: string;
    visualIcon?: string;
    description?: string;
  }>;
  correctChoiceId: string;
}

export const mockProbes: Record<'PICTURE' | 'AUDIO' | 'TEXT', ProbeMock> = {
  PICTURE: {
    type: 'PICTURE',
    title: 'Visual Journey (ଚିତ୍ର ଦେଖି କୁହ)',
    prompt: 'Where is the student right now relative to the flag post?',
    promptOr: 'ଛାତ୍ରଟି ବର୍ତ୍ତମାନ ପତାକା ଖୁଣ୍ଟ ତୁଳନାରେ କେଉଁଠାରେ ଅଛି?',
    choices: [
      { id: 'p_1', visualIcon: '🏁', label: 'At the flag', text: 'ପତାକା ପାଖରେ (At starting flag)' },
      { id: 'p_2', visualIcon: '➡️', label: '3m Away', text: '୩ ମିଟର ଦୂରରେ (3m away east)' },
      { id: 'p_3', visualIcon: '⬅️', label: '6m Away', text: '୬ ମିଟର ଦୂରରେ (6m away west)' },
    ],
    correctChoiceId: 'p_1',
  },
  AUDIO: {
    type: 'AUDIO',
    title: 'Listen & Choose (ଶୁଣି ବାଛ)',
    prompt: 'Tap the audio button to hear the phrase, then select the matching visual.',
    promptOr: 'ଶୁଣିବା ପାଇଁ ବଟନ୍ ଦବାନ୍ତୁ ଏବଂ ଉତ୍ତର ବାଛନ୍ତୁ।',
    choices: [
      { id: 'a_1', visualIcon: '📍', label: 'Same Spot', text: 'ସେହି ସ୍ଥାନ (Original origin)' },
      { id: 'a_2', visualIcon: '📏', label: 'Straight Line', text: 'ସରଳରେଖା (Continuous path)' },
      { id: 'a_3', visualIcon: '🔄', label: 'Round Trip', text: 'ଗୋଲାକାର (Circular loop)' },
    ],
    correctChoiceId: 'a_1',
  },
  TEXT: {
    type: 'TEXT',
    title: 'Term Concept Check (ସଂଜ୍ଞା ଯାଞ୍ଚ)',
    prompt: 'Displacement is the shortest distance between starting point and final point.',
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
  status: 'PENDING' | 'ACKED' | 'ERROR';
  seq: number;
  payload: Record<string, any>;
}

export const mockTraceEvents: TraceEventMock[] = [
  {
    id: 'evt-001',
    node: 'OBSERVE',
    action: 'MCQ_ANSWER',
    description: 'Student selected choice A for displacement problem',
    timestamp: '10:42:12 AM',
    status: 'ACKED',
    seq: 1,
    payload: { concept_id: 'distance_vs_displacement', correct: false, misconception: 'path_equals_displacement' },
  },
  {
    id: 'evt-002',
    node: 'MASTERY',
    action: 'CONCEPT_UPDATE',
    description: 'BKT concept mastery updated: 0.4200 → 0.2248',
    timestamp: '10:42:13 AM',
    status: 'ACKED',
    seq: 2,
    payload: { concept_id: 'distance_vs_displacement', before: 0.42, after: 0.2248 },
  },
  {
    id: 'evt-003',
    node: 'PROBE',
    action: 'TRIGGER_EVAL',
    description: 'Diagnostic probe episode triggered (Rule B: mastery < 0.50)',
    timestamp: '10:42:13 AM',
    status: 'ACKED',
    seq: 3,
    payload: { episode_id: 'ep-1806635391', rule: 'B', set: 'A' },
  },
  {
    id: 'evt-004',
    node: 'PROBE',
    action: 'SOUND_CHECK',
    description: 'Speaker check passed on student tablet',
    timestamp: '10:42:14 AM',
    status: 'ACKED',
    seq: 4,
    payload: { status: 'PASS' },
  },
  {
    id: 'evt-005',
    node: 'PROBE',
    action: 'START_PROBE_SET',
    description: '3-way multimodal probe ordered by seed: [T, A, P]',
    timestamp: '10:42:15 AM',
    status: 'PENDING',
    seq: 5,
    payload: { order: ['T', 'A', 'P'], seed: 1806635391 },
  },
  {
    id: 'evt-006',
    node: 'REFLECT',
    action: 'PROBE_CANDIDATE',
    description: 'Evaluating candidate label agreement across modalities',
    timestamp: '10:42:20 AM',
    status: 'PENDING',
    seq: 6,
    payload: { candidate: 'TERM_GAP_CANDIDATE' },
  },
  {
    id: 'evt-007',
    node: 'ACT',
    action: 'REMEDIATION_READY',
    description: 'Targeted Odia-Kui scaffolding prepared for student',
    timestamp: '10:42:22 AM',
    status: 'PENDING',
    seq: 7,
    payload: { chosen_tier: 1, audio_first: true },
  },
];

export interface TeacherMock {
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

export const mockTeacherData: TeacherMock = {
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
