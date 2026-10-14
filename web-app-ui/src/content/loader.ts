import pack from '../../../content/motion_pack.json';

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

export function getHeroChunk(): HeroChunk | null {
  const chunk = pack.chunks.find(
    (c: any) => c.chunk_id === 'BSE9-PHYS-MOTION-S02-02'
  );
  if (!chunk) return null;
  return {
    chunkId: chunk.chunk_id,
    title: chunk.title_or,
    odiaText: chunk.odia_text,
  };
}

export function getHeroItem(): HeroItem | null {
  // DVD-A-T is the Text-modality MCQ — the primary hero question
  const item = pack.items.find((i: any) => i.item_id === 'DVD-A-T');
  if (!item) return null;
  return {
    itemId: item.item_id,
    stem: item.stem,
    options: item.options,
    correct: item.correct,
    misconceptionTag: item.misconception_tag,
  };
}

export function getProbeItems(): ProbeItems | null {
  const items = pack.items.filter((i: any) => i.set === 'A');
  const P = items.find((i: any) => i.modality === 'P');
  const A = items.find((i: any) => i.modality === 'A');
  const T = items.find((i: any) => i.modality === 'T');
  if (!P || !A || !T) return null;
  return { P, A, T };
}

export function getConfirmItem(): any | null {
  return pack.items.find((i: any) => i.item_id === 'W1') ?? null;
}

export function getKuiGlossary(): any[] {
  return pack.terms ?? [];
}

export function getPackHash(): string {
  return (pack as any).manifest?.sha256 ?? 'unbuilt';
}

export function getPackVersion(): string {
  return (pack as any).pack_version ?? '1.0';
}