import motionPack from '../../../content/motion_pack.json';
import gravitationPack from '../../../content/gravitation_pack.json';
import physicsPack from '../../../content/packs/physics.json';
import chemistryPack from '../../../content/packs/chemistry.json';
import biologyPack from '../../../content/packs/biology.json';
import mathsPack from '../../../content/packs/maths.json';

export interface HeroChunk {
  chunkId: string;
  title: string;
  odiaText: string;
}

export interface HeroItem {
  itemId: string;
  stem: string;
  options: string[];
  correct: number;
  misconceptionTag: string;
}

export interface ProbeItems {
  P: any;
  A: any;
  T: any;
}

const DEFAULT_OPTIONS = [
  'ଦୂରତା ଏକ ଅଦିଶ ରାଶି ଏବଂ ବିସ୍ଥାପନ ଏକ ସଦିଶ ରାଶି ଅଟେ',
  'ଦୂରତା ସର୍ବଦା ବିସ୍ଥାପନ ଠାରୁ କମ୍ ହୋଇଥାଏ',
  'ବିସ୍ଥାପନର କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଦିଗ ନଥାଏ',
  'ଉଭୟ ଦୂରତା ଓ ବିସ୍ଥାପନ କେବଳ ମୂଳବିନ୍ଦୁ ଉପରେ ନିର୍ଭର କରନ୍ତି',
];

export function getPackForSubject(subject?: string, chunkId?: string): any {
  const s = subject?.toLowerCase();
  const c = chunkId?.toLowerCase();

  if (s === 'chemistry' || c?.includes('chem') || c?.includes('carbon')) {
    return chemistryPack || motionPack;
  }
  if (s === 'biology' || c?.includes('bio') || c?.includes('cell')) {
    return biologyPack || motionPack;
  }
  if (s === 'maths' || s === 'mathematics' || c?.includes('math') || c?.includes('rational') || c?.includes('real')) {
    return mathsPack || motionPack;
  }
  if (c?.includes('grav') || c === 'mass_and_weight' || c === 'mass_vs_weight') {
    return gravitationPack || motionPack;
  }
  return physicsPack || motionPack;
}

export function getHeroChunk(subject?: string, chunkId?: string): HeroChunk | null {
  try {
    const pack = getPackForSubject(subject, chunkId);
    const chunks = pack?.chunks ?? motionPack.chunks;

    let chunk = chunkId ? chunks?.find((c: any) => c.chunk_id === chunkId) : null;
    if (!chunk) {
      chunk = chunks?.find((c: any) => c.chunk_id === 'BSE9-PHYS-MOTION-S02-02') ?? chunks?.[0] ?? motionPack.chunks[0];
    }
    if (!chunk) return null;

    return {
      chunkId: chunk.chunk_id || 'BSE9-PHYS-MOTION-S02-02',
      title: chunk.title_or || 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନର ସଂଜ୍ଞା',
      odiaText: chunk.odia_text || '',
    };
  } catch (err) {
    console.warn('getHeroChunk fallback to motion default', err);
    const defaultChunk = motionPack.chunks[1] || motionPack.chunks[0];
    return {
      chunkId: defaultChunk.chunk_id,
      title: defaultChunk.title_or,
      odiaText: defaultChunk.odia_text,
    };
  }
}

export function getHeroItem(subject?: string, chunkId?: string): HeroItem | null {
  try {
    const pack = getPackForSubject(subject, chunkId);
    const items = pack?.items ?? motionPack.items;

    // DVD-A-T is the Text-modality MCQ — the primary hero question
    let item = items?.find((i: any) => i.item_id === 'DVD-A-T' || i.modality === 'T');
    if (!item) {
      item = items?.[0] ?? motionPack.items.find((i: any) => i.item_id === 'DVD-A-T') ?? motionPack.items[0];
    }
    if (!item) return null;

    const options = Array.isArray(item.options) && item.options.length > 0
      ? item.options
      : DEFAULT_OPTIONS;

    return {
      itemId: item.item_id || 'DVD-A-T',
      stem: item.stem || 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ ମଧ୍ୟରେ ମୁଖ୍ୟ ପାର୍ଥକ୍ୟ କ’ଣ?',
      options,
      correct: typeof item.correct === 'number' ? item.correct : 0,
      misconceptionTag: item.misconception_tag || '',
    };
  } catch (err) {
    console.warn('getHeroItem fallback to motion default', err);
    const fallback = motionPack.items.find((i: any) => i.item_id === 'DVD-A-T') || motionPack.items[0];
    return {
      itemId: fallback.item_id,
      stem: fallback.stem,
      options: fallback.options,
      correct: fallback.correct,
      misconceptionTag: fallback.misconception_tag,
    };
  }
}

export function getProbeItems(subject?: string, chunkId?: string): ProbeItems | null {
  try {
    const pack = getPackForSubject(subject, chunkId);
    const items = pack?.items ?? motionPack.items;

    const P = items.find((i: any) => i.modality === 'P') ?? motionPack.items.find((i: any) => i.modality === 'P');
    const A = items.find((i: any) => i.modality === 'A') ?? motionPack.items.find((i: any) => i.modality === 'A');
    const T = items.find((i: any) => i.modality === 'T') ?? motionPack.items.find((i: any) => i.modality === 'T');

    if (!P || !A || !T) {
      const fallbackItems = motionPack.items.filter((i: any) => i.set === 'A');
      return {
        P: fallbackItems.find((i: any) => i.modality === 'P'),
        A: fallbackItems.find((i: any) => i.modality === 'A'),
        T: fallbackItems.find((i: any) => i.modality === 'T'),
      };
    }
    return { P, A, T };
  } catch (err) {
    console.warn('getProbeItems fallback to motion default', err);
    const fallbackItems = motionPack.items.filter((i: any) => i.set === 'A');
    return {
      P: fallbackItems.find((i: any) => i.modality === 'P'),
      A: fallbackItems.find((i: any) => i.modality === 'A'),
      T: fallbackItems.find((i: any) => i.modality === 'T'),
    };
  }
}

export function getConfirmItem(subject?: string): any | null {
  try {
    const pack = getPackForSubject(subject);
    const item = pack?.items?.find((i: any) => i.item_id === 'W1' || i.modality === 'W');
    return item ?? motionPack.items.find((i: any) => i.item_id === 'W1') ?? null;
  } catch {
    return motionPack.items.find((i: any) => i.item_id === 'W1') ?? null;
  }
}

export function getKuiGlossary(subject?: string): any[] {
  try {
    const pack = getPackForSubject(subject);
    return pack?.terms ?? motionPack.terms ?? [];
  } catch {
    return motionPack.terms ?? [];
  }
}

export function getPackHash(subject?: string): string {
  try {
    const pack = getPackForSubject(subject);
    return pack?.manifest?.sha256 ?? (motionPack as any).manifest?.sha256 ?? 'unbuilt';
  } catch {
    return (motionPack as any).manifest?.sha256 ?? 'unbuilt';
  }
}

export function getPackVersion(subject?: string): string {
  try {
    const pack = getPackForSubject(subject);
    return pack?.pack_version ?? (motionPack as any).pack_version ?? '1.0';
  } catch {
    return (motionPack as any).pack_version ?? '1.0';
  }
}