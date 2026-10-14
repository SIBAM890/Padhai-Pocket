/**
 * PadhAI Pocket — BSE Odisha Unified Subject Tree
 * Master PRD v3.1 (Merge 2)
 *
 * Models Class 9 curriculum for 4 core BSE subjects:
 * 1. Physics (ଭୌତିକ ବିଜ୍ଞାନ)
 * 2. Chemistry (ରସାୟନ ବିଜ୍ଞାନ)
 * 3. Biology (ଜୀବ ବିଜ୍ଞାନ)
 * 4. Maths (ଗଣିତ)
 *
 * Safely loads pack files with graceful fallbacks.
 */

// Safely load motion pack and gravitation pack
let motionPack: any = null;
let gravitationPack: any = null;

try {
  // @ts-ignore
  motionPack = require('../../../content/motion_pack.json');
} catch {
  motionPack = null;
}

try {
  // @ts-ignore
  gravitationPack = require('../../../content/gravitation_pack.json');
} catch {
  gravitationPack = null;
}

// Dynamic/future pack loads with graceful fallback stubs
let physicsPack: any = null;
let chemistryPack: any = null;
let biologyPack: any = null;
let mathsPack: any = null;

try {
  // @ts-ignore
  physicsPack = require('../../../content/packs/physics.json');
} catch {
  physicsPack = motionPack;
}

try {
  // @ts-ignore
  chemistryPack = require('../../../content/packs/chemistry.json');
} catch {
  chemistryPack = null;
}

try {
  // @ts-ignore
  biologyPack = require('../../../content/packs/biology.json');
} catch {
  biologyPack = null;
}

try {
  // @ts-ignore
  mathsPack = require('../../../content/packs/maths.json');
} catch {
  mathsPack = null;
}

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'maths';

export type TopicStatus =
  | 'Full lesson ready'
  | 'Preview'
  | 'Structure ready'
  | 'Pack pending';

export interface BseTopic {
  id: string;
  title: string;
  titleOr: string;
  status: TopicStatus;
  statusOr: string;
  ready: boolean;
  estimatedMins: number;
  chunkId?: string;
  conceptId?: string;
}

export interface BseChapter {
  id: string;
  chapterNumber: number;
  title: string;
  titleOr: string;
  topics: BseTopic[];
}

export interface BseSubject {
  id: SubjectId;
  title: string;
  titleOr: string;
  icon: string;
  accentColor: string;
  chapters: BseChapter[];
  totalTopics: number;
  readyTopics: number;
  status: TopicStatus;
  statusOr: string;
}

export function computeTopicStatus(
  subjectId: SubjectId,
  topicId: string
): { status: TopicStatus; statusOr: string; ready: boolean } {
  if (subjectId === 'physics' && topicId === 'distance_vs_displacement') {
    return {
      status: 'Full lesson ready',
      statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
      ready: true,
    };
  }

  if (subjectId === 'physics' && topicId === 'mass_and_weight') {
    const isApproved =
      gravitationPack?.status === 'demo_approved' || gravitationPack != null;
    return {
      status: isApproved ? 'Preview' : 'Structure ready',
      statusOr: isApproved ? 'ପ୍ରାକ୍-ଦର୍ଶନ' : 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
      ready: isApproved,
    };
  }

  // Fallback for pending curriculum packs
  return {
    status: 'Pack pending',
    statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
    ready: false,
  };
}

export const BSE_SUBJECTS: BseSubject[] = [
  {
    id: 'physics',
    title: 'Physical Science (Physics)',
    titleOr: 'ଭୌତିକ ବିଜ୍ଞାନ',
    icon: '⚡',
    accentColor: '#304FFE',
    status: 'Full lesson ready',
    statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
    totalTopics: 4,
    readyTopics: 2,
    chapters: [
      {
        id: 'motion',
        chapterNumber: 1,
        title: 'Motion',
        titleOr: 'ଗତି',
        topics: [
          {
            id: 'distance_vs_displacement',
            title: 'Distance and Displacement',
            titleOr: 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-PHYS-MOTION-S02-02',
            conceptId: 'distance_vs_displacement',
          },
          {
            id: 'velocity_and_acceleration',
            title: 'Speed, Velocity & Acceleration',
            titleOr: 'ବେଗ ଏବଂ ତ୍ୱରଣ',
            status: 'Structure ready',
            statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
            ready: false,
            estimatedMins: 6,
          },
        ],
      },
      {
        id: 'gravitation',
        chapterNumber: 7,
        title: 'Gravitation',
        titleOr: 'ମାଧ୍ୟାକର୍ଷଣ',
        topics: [
          {
            id: 'mass_and_weight',
            title: 'Mass and Weight',
            titleOr: 'ବସ୍ତୁତ୍ୱ ଏବଂ ଭାର',
            status: gravitationPack ? 'Preview' : 'Structure ready',
            statusOr: gravitationPack ? 'ପ୍ରାକ୍-ଦର୍ଶନ' : 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-PHYS-GRAV-S03-01',
            conceptId: 'mass_vs_weight',
          },
          {
            id: 'universal_law_gravitation',
            title: 'Universal Law of Gravitation',
            titleOr: 'ସର୍ବଜନୀନ ମାଧ୍ୟାକର୍ଷଣ ନିୟମ',
            status: 'Structure ready',
            statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
            ready: false,
            estimatedMins: 7,
          },
        ],
      },
    ],
  },
  {
    id: 'chemistry',
    title: 'Physical Science (Chemistry)',
    titleOr: 'ରସାୟନ ବିଜ୍ଞାନ',
    icon: '🧪',
    accentColor: '#0F9D8A',
    status: 'Structure ready',
    statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
    totalTopics: 3,
    readyTopics: 0,
    chapters: [
      {
        id: 'matter_surroundings',
        chapterNumber: 2,
        title: 'Matter in Our Surroundings',
        titleOr: 'ଆମ ଚାରିପାଖର ପଦାର୍ଥ',
        topics: [
          {
            id: 'states_of_matter',
            title: 'States of Matter',
            titleOr: 'ପଦାର୍ଥର ଅବସ୍ଥା',
            status: 'Pack pending',
            statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
            ready: false,
            estimatedMins: 5,
          },
          {
            id: 'evaporation',
            title: 'Evaporation and Cooling',
            titleOr: 'ବାଷ୍ପୀଭବନ',
            status: 'Pack pending',
            statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
            ready: false,
            estimatedMins: 5,
          },
        ],
      },
      {
        id: 'atoms_molecules',
        chapterNumber: 3,
        title: 'Atoms and Molecules',
        titleOr: 'ପରମାଣୁ ଓ ଅଣୁ',
        topics: [
          {
            id: 'chemical_combination',
            title: 'Laws of Chemical Combination',
            titleOr: 'ରାସାୟନିକ ସଂଯୋଗ ନିୟମ',
            status: 'Structure ready',
            statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
            ready: false,
            estimatedMins: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'biology',
    title: 'Life Science (Biology)',
    titleOr: 'ଜୀବ ବିଜ୍ଞାନ',
    icon: '🌱',
    accentColor: '#22C55E',
    status: 'Structure ready',
    statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
    totalTopics: 3,
    readyTopics: 0,
    chapters: [
      {
        id: 'cell_unit_of_life',
        chapterNumber: 1,
        title: 'Fundamental Unit of Life',
        titleOr: 'ଜୀବନର ମୌଳିକ ଏକକ',
        topics: [
          {
            id: 'cell_structure',
            title: 'Cell Structure and Organelles',
            titleOr: 'କୋଷ ଗଠନ',
            status: 'Pack pending',
            statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
            ready: false,
            estimatedMins: 5,
          },
          {
            id: 'cell_division',
            title: 'Cell Division (Mitosis & Meiosis)',
            titleOr: 'କୋଷ ବିଭାଜନ',
            status: 'Structure ready',
            statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
            ready: false,
            estimatedMins: 6,
          },
        ],
      },
      {
        id: 'tissues',
        chapterNumber: 2,
        title: 'Tissues',
        titleOr: 'କଳା',
        topics: [
          {
            id: 'plant_tissues',
            title: 'Plant Tissues',
            titleOr: 'ଉଦ୍ଭିଦ କଳା',
            status: 'Pack pending',
            statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
            ready: false,
            estimatedMins: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'maths',
    title: 'Mathematics',
    titleOr: 'ଗଣିତ',
    icon: '📐',
    accentColor: '#F59E0B',
    status: 'Structure ready',
    statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
    totalTopics: 3,
    readyTopics: 0,
    chapters: [
      {
        id: 'number_systems',
        chapterNumber: 1,
        title: 'Number Systems',
        titleOr: 'ସଂଖ୍ୟା ପଦ୍ଧତି',
        topics: [
          {
            id: 'rational_irrational',
            title: 'Rational and Irrational Numbers',
            titleOr: 'ପରିମେୟ ଏବଂ ଅପରିମେୟ ସଂଖ୍ୟା',
            status: 'Pack pending',
            statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
            ready: false,
            estimatedMins: 6,
          },
          {
            id: 'real_numbers',
            title: 'Real Numbers and Decimal Expansions',
            titleOr: 'ବାସ୍ତବ ସଂଖ୍ୟା',
            status: 'Structure ready',
            statusOr: 'ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ',
            ready: false,
            estimatedMins: 6,
          },
        ],
      },
      {
        id: 'polynomials',
        chapterNumber: 2,
        title: 'Polynomials',
        titleOr: 'ବହୁପଦୀ',
        topics: [
          {
            id: 'zeroes_of_polynomial',
            title: 'Zeroes of a Polynomial',
            titleOr: 'ବହୁପଦୀର ଶୂନ୍ୟ',
            status: 'Pack pending',
            statusOr: 'ପ୍ୟାକ୍ ଅପେକ୍ଷାରେ ଅଛି',
            ready: false,
            estimatedMins: 5,
          },
        ],
      },
    ],
  },
];
