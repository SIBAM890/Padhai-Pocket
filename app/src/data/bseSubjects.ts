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

import motionPackRaw from '../../../content/motion_pack.json';
import gravitationPackRaw from '../../../content/gravitation_pack.json';
import physicsPackRaw from '../../../content/packs/physics.json';
import chemistryPackRaw from '../../../content/packs/chemistry.json';
import biologyPackRaw from '../../../content/packs/biology.json';
import mathsPackRaw from '../../../content/packs/maths.json';

export const motionPack: any = motionPackRaw;
export const gravitationPack: any = gravitationPackRaw;
export const physicsPack: any = physicsPackRaw || motionPackRaw;
export const chemistryPack: any = chemistryPackRaw;
export const biologyPack: any = biologyPackRaw;
export const mathsPack: any = mathsPackRaw;

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
  _subjectId: SubjectId,
  _topicId: string
): { status: TopicStatus; statusOr: string; ready: boolean } {
  return {
    status: 'Full lesson ready',
    statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
    ready: true,
  };
}

export const BSE_SUBJECTS: BseSubject[] = [
  {
    id: 'physics',
    title: 'Physical Science (Physics)',
    titleOr: 'ଭୌତିକ ବିଜ୍ଞାନ',
    icon: '⚡',
    accentColor: '#C2410C',
    status: 'Full lesson ready',
    statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
    totalTopics: 4,
    readyTopics: 4,
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
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 6,
            chunkId: 'BSE9-PHYS-MOTION-S02-01',
            conceptId: 'speed_velocity_acceleration',
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
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-PHYS-GRAV-S03-01',
            conceptId: 'mass_vs_weight',
          },
          {
            id: 'universal_law_gravitation',
            title: 'Universal Law of Gravitation & Free Fall',
            titleOr: 'ସର୍ବଜନୀନ ମାଧ୍ୟାକର୍ଷଣ ନିୟମ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 7,
            chunkId: 'BSE9-PHYS-GRAV-S03-02',
            conceptId: 'universal_gravitation',
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
    status: 'Full lesson ready',
    statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
    totalTopics: 4,
    readyTopics: 4,
    chapters: [
      {
        id: 'carbon_compounds',
        chapterNumber: 4,
        title: 'Carbon and its Compounds',
        titleOr: 'ଚତୁର୍ଥ ଅଧ୍ୟାୟ: କାର୍ବନ ଏବଂ ଏହାର ଯୌଗିକ',
        topics: [
          {
            id: 'substitution_reaction',
            title: 'Substitution Reaction & Covalent Bond',
            titleOr: 'ପ୍ରତିସ୍ଥାପନ ପ୍ରତିକ୍ରିୟା',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-CHEM-CARBON-S04',
            conceptId: 'substitution_reaction',
          },
        ],
      },
      {
        id: 'matter_surroundings',
        chapterNumber: 2,
        title: 'Matter in Our Surroundings',
        titleOr: 'ଆମ ଚାରିପାଖର ପଦାର୍ଥ',
        topics: [
          {
            id: 'states_of_matter',
            title: 'States of Matter (Solid, Liquid, Gas)',
            titleOr: 'ପଦାର୍ଥର ଅବସ୍ଥା',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-CHEM-MATTER-S01',
            conceptId: 'states_of_matter',
          },
          {
            id: 'evaporation',
            title: 'Evaporation and Cooling',
            titleOr: 'ବାଷ୍ପୀଭବନ ଏବଂ ଶୀତଳୀକରଣ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-CHEM-MATTER-S02',
            conceptId: 'evaporation_cooling',
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
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 6,
            chunkId: 'BSE9-CHEM-ATOM-S01',
            conceptId: 'chemical_combination',
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
    status: 'Full lesson ready',
    statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
    totalTopics: 3,
    readyTopics: 3,
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
            titleOr: 'କୋଷ ଗଠନ ଏବଂ ମାଇଟୋକଣ୍ଡ୍ରିଆ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-BIO-CELL-S01',
            conceptId: 'cell_structure',
          },
          {
            id: 'cell_division',
            title: 'Cell Division (Mitosis & Meiosis)',
            titleOr: 'କୋଷ ବିଭାଜନ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 6,
            chunkId: 'BSE9-BIO-CELL-S02',
            conceptId: 'cell_division',
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
            title: 'Plant Tissues (Meristematic & Permanent)',
            titleOr: 'ଉଦ୍ଭିଦ କଳା',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-BIO-TISSUE-S01',
            conceptId: 'plant_tissues',
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
    status: 'Full lesson ready',
    statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
    totalTopics: 4,
    readyTopics: 4,
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
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 6,
            chunkId: 'BSE9-MATH-REAL-S01',
            conceptId: 'rational_irrational',
          },
          {
            id: 'real_numbers',
            title: 'Real Numbers and Decimal Expansions',
            titleOr: 'ବାସ୍ତବ ସଂଖ୍ୟା ଓ ଦଶମିକ ପ୍ରସାରଣ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 6,
            chunkId: 'BSE9-MATH-REAL-S02',
            conceptId: 'real_numbers',
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
            titleOr: 'ବହୁପଦୀର ଶୂନ୍ୟ ଏବଂ ସହଗ',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 5,
            chunkId: 'BSE9-MATH-POLY-S01',
            conceptId: 'zeroes_of_polynomial',
          },
        ],
      },
      {
        id: 'equations_solver',
        chapterNumber: 3,
        title: 'Linear & Quadratic Equations (3D Visual Solver)',
        titleOr: 'ଏକଘାତୀ ଓ ଦ୍ୱିଘାତ ସମୀକରଣ (3D ସମାଧାନ)',
        topics: [
          {
            id: 'linear_equation_roots',
            title: '3D Solver: 3x - 2y + 2 = 0 & Quadratic',
            titleOr: '3D ସମୀକରଣ ସମାଧାନ (3x - 2y + 2 = 0)',
            status: 'Full lesson ready',
            statusOr: 'ସମ୍ପୂର୍ଣ୍ଣ ପାଠ ପ୍ରସ୍ତୁତ',
            ready: true,
            estimatedMins: 6,
            chunkId: 'BSE9-MATH-EQ-S01',
            conceptId: 'linear_quadratic_equations',
          },
        ],
      },
    ],
  },
];
