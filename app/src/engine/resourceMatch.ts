/**
 * PRD v4.0 §2.5 (D5) & §4.7 — Resource Match Engine
 *
 * Ranks a curated, reviewed set of lessons, pictures, audio, and Kui bridge cards
 * by how well each fits a learner's diagnosed need, language, and device,
 * and logs the reason for every recommendation and disqualified alternative.
 *
 * Pure module (FR-21): Zero Date.now(), Math.random(), network, or storage calls.
 */

import type { Bit, SetLabel } from './table';

export type ResourceModality =
  | 'kui_bridge'
  | 'visual_diagram'
  | 'audio_story'
  | 'tier1_text'
  | 'worked_example';

export type DisqualifyReason =
  | 'NOT_APPROVED'
  | 'AUDIO_UNAVAILABLE'
  | 'OFFLINE_MODE'
  | 'ALREADY_TRIED_IN_EPISODE';

export interface CuratedResource {
  resource_id: string;
  title_or: string;
  title_en: string;
  target_labels: SetLabel[];
  concept_id: string;
  term_id?: string;
  modality: ResourceModality;
  tier: 1 | 2;
  requires_audio: boolean;
  requires_network: boolean;
  has_kui_gloss: boolean;
  status: 'draft' | 'reviewed' | 'approved' | 'demo_approved';
  chunk_id: string;
}

export interface ResourceMatchContext {
  final_label: SetLabel;
  pattern: [Bit, Bit, Bit]; // [P, A, T]
  concept_id: string;
  term_id?: string;
  concept_mastery: number;
  reading_load: number;
  audio_available: boolean;
  network_mode: 'ONLINE' | 'WEAK' | 'OFFLINE';
  used_resource_ids?: string[];
}

export interface RankedResource {
  resource_id: string;
  title_or: string;
  title_en: string;
  chunk_id: string;
  modality: ResourceModality;
  tier: 1 | 2;
  score: number;
  reasons: string[];
}

export interface DisqualifiedResource {
  resource_id: string;
  title_en: string;
  reason: DisqualifyReason;
}

export interface ResourceMatchOutput {
  selected: RankedResource;
  runner_up: RankedResource | null;
  ranked: RankedResource[];
  disqualified: DisqualifiedResource[];
}

export const DEFAULT_RESOURCE_CATALOG: CuratedResource[] = [
  {
    resource_id: 'RES-KUI-DISP-01',
    title_or: 'କୁଇ ଶବ୍ଦ ସେତୁ: ବିସ୍ଥାପନ (Displacement)',
    title_en: 'Kui Word Bridge + Straight-Line Arrow Visual',
    target_labels: ['TERM_GAP'],
    concept_id: 'distance_vs_displacement',
    term_id: 'T_DISP',
    modality: 'kui_bridge',
    tier: 1,
    requires_audio: false,
    requires_network: false,
    has_kui_gloss: true,
    status: 'demo_approved',
    chunk_id: 'BSE9-PHYS-MOTION-S02-02',
  },
  {
    resource_id: 'RES-VIS-WELL-01',
    title_or: 'ଗାଁ କୂଅ ପଥ ଚିତ୍ର (ଦୂରତା ବନାମ ବିସ୍ଥାପନ)',
    title_en: 'Village Well Path vs. Straight-Line Diagram (Tier-1)',
    target_labels: ['CONCEPT_GAP', 'TERM_GAP', 'INCONSISTENT'],
    concept_id: 'distance_vs_displacement',
    modality: 'visual_diagram',
    tier: 1,
    requires_audio: false,
    requires_network: false,
    has_kui_gloss: false,
    status: 'demo_approved',
    chunk_id: 'BSE9-PHYS-MOTION-S02-03',
  },
  {
    resource_id: 'RES-AUD-STORY-01',
    title_or: 'ଅଡିଓ ପାଠ: ସରଳରେଖାରେ ଗତି ଓ ବିସ୍ଥାପନ',
    title_en: 'Odia Audio-First Highlighted Read-Along',
    target_labels: ['READING_GAP', 'INCONSISTENT'],
    concept_id: 'distance_vs_displacement',
    modality: 'audio_story',
    tier: 1,
    requires_audio: true,
    requires_network: false,
    has_kui_gloss: false,
    status: 'demo_approved',
    chunk_id: 'BSE9-PHYS-MOTION-S02-02',
  },
  {
    resource_id: 'RES-SLOW-PIC-01',
    title_or: 'ଚିତ୍ର ଓ ଛୋଟ ବାକ୍ୟ: ବିସ୍ଥାପନ (0.75x)',
    title_en: 'Picture-First Short Sentences + Slow Playback',
    target_labels: ['LISTENING_OR_COMPREHENSION', 'READING_GAP', 'INCONSISTENT'],
    concept_id: 'distance_vs_displacement',
    modality: 'visual_diagram',
    tier: 1,
    requires_audio: false,
    requires_network: false,
    has_kui_gloss: true,
    status: 'demo_approved',
    chunk_id: 'BSE9-PHYS-MOTION-S02-01',
  },
  {
    resource_id: 'RES-TIER2-EX-01',
    title_or: 'ଅଭ୍ୟାସ ପ୍ରଶ୍ନ: 60km ଓ 35km ସଂଖ୍ୟାତ୍ମକ ଉଦାହରଣ',
    title_en: 'Tier-2 Worked Numerical Example (OA + AB)',
    target_labels: ['RESOLVED', 'CONCEPT_GAP'],
    concept_id: 'distance_vs_displacement',
    modality: 'worked_example',
    tier: 2,
    requires_audio: false,
    requires_network: false,
    has_kui_gloss: false,
    status: 'demo_approved',
    chunk_id: 'BSE9-PHYS-MOTION-S02-03',
  },
  {
    resource_id: 'RES-CLOUD-GEN-01',
    title_or: 'AI ଜେନେରେଟେଡ୍ ଉଦାହରଣ (Unreviewed)',
    title_en: 'Live Cloud Gemini Explanation (Draft)',
    target_labels: ['CONCEPT_GAP', 'TERM_GAP'],
    concept_id: 'distance_vs_displacement',
    modality: 'tier1_text',
    tier: 1,
    requires_audio: false,
    requires_network: true,
    has_kui_gloss: false,
    status: 'draft',
    chunk_id: 'BSE9-PHYS-MOTION-S02-02',
  },
];

export function matchResources(
  ctx: ResourceMatchContext,
  catalog: CuratedResource[] = DEFAULT_RESOURCE_CATALOG
): ResourceMatchOutput {
  const disqualified: DisqualifiedResource[] = [];
  const ranked: RankedResource[] = [];
  const used = new Set(ctx.used_resource_ids ?? []);

  for (const res of catalog) {
    // Stage 1: Hard Eligibility Gates (FR-27, FR-23, FR-6, FR-25)
    if (res.status !== 'approved' && res.status !== 'demo_approved') {
      disqualified.push({
        resource_id: res.resource_id,
        title_en: res.title_en,
        reason: 'NOT_APPROVED',
      });
      continue;
    }
    if (res.requires_audio && !ctx.audio_available) {
      disqualified.push({
        resource_id: res.resource_id,
        title_en: res.title_en,
        reason: 'AUDIO_UNAVAILABLE',
      });
      continue;
    }
    if (res.requires_network && ctx.network_mode !== 'ONLINE') {
      disqualified.push({
        resource_id: res.resource_id,
        title_en: res.title_en,
        reason: 'OFFLINE_MODE',
      });
      continue;
    }
    if (used.has(res.resource_id)) {
      disqualified.push({
        resource_id: res.resource_id,
        title_en: res.title_en,
        reason: 'ALREADY_TRIED_IN_EPISODE',
      });
      continue;
    }

    // Stage 2: Deterministic 100-Point Utility Scoring
    let score = 0;
    const reasons: string[] = [];

    // 1. Diagnosed Need Fit (0-45 pts)
    if (res.target_labels[0] === ctx.final_label) {
      score += 45;
      reasons.push(`primary_need=${ctx.final_label}(+45)`);
    } else if (res.target_labels.includes(ctx.final_label)) {
      score += 30;
      reasons.push(`secondary_need=${ctx.final_label}(+30)`);
    }

    // 2. Modality & Probe Pattern Fit (0-25 pts)
    const [P, A, T] = ctx.pattern;
    if (P === 1 && (res.modality === 'kui_bridge' || res.modality === 'visual_diagram')) {
      score += 25;
      reasons.push('diagram_strength_P=1(+25)');
    } else if (T === 0 && res.modality === 'audio_story' && ctx.audio_available) {
      score += 25;
      reasons.push('bypasses_text_decoding_T=0(+25)');
    } else if (P === 0 && res.modality === 'visual_diagram') {
      score += 20;
      reasons.push('rebuilds_concept_visually_P=0(+20)');
    }

    // 3. Language & Reading-Load Fit (0-15 pts)
    if (
      ctx.final_label === 'TERM_GAP' &&
      res.has_kui_gloss &&
      res.term_id === (ctx.term_id ?? 'T_DISP')
    ) {
      score += 15;
      reasons.push(`kui_bridge_for_${res.term_id}(+15)`);
    } else if (ctx.reading_load > 0 && res.modality !== 'tier1_text') {
      score += 10;
      reasons.push('low_reading_load_fit(+10)');
    }

    // 4. Mastery Tier Fit (0-15 pts)
    const targetTier = ctx.concept_mastery < 0.65 ? 1 : 2;
    if (res.tier === targetTier) {
      score += 15;
      reasons.push(`tier_${targetTier}_mastery_fit(+15)`);
    }

    ranked.push({
      resource_id: res.resource_id,
      title_or: res.title_or,
      title_en: res.title_en,
      chunk_id: res.chunk_id,
      modality: res.modality,
      tier: res.tier,
      score,
      reasons,
    });
  }

  // Sort descending by score; deterministic tie-break by resource_id (FR-21)
  ranked.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.resource_id.localeCompare(b.resource_id)
  );

  return {
    selected: ranked[0],
    runner_up: ranked[1] ?? null,
    ranked,
    disqualified,
  };
}
