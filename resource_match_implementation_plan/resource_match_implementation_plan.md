# Padhai Pocket — `Resource Match` Implementation Plan & Git Branch Push Guide

**Target Repository:** `https://github.com/SIBAM890/Padhai-Pocket.git`  
**Base Branch:** `main` (`973fa1b` / `demo-v5`)  
**New Feature Branch:** `feat/resource-match`  
**Estimated Integration Time:** ~20 minutes (Zero regressions to existing 29/29 Jest & 14/14 Pytest tests)

---

## 1. Feature Specification (For Submission Form & PRD §2.5 / §4.7)

* **One-Sentence Submission Description:**
  > *"Resource Match ranks a curated, reviewed set of lessons, pictures, audio, and Kui bridge cards by how well each fits a learner's diagnosed need, language, and device—and logs the reason for every recommendation and rejected alternative."*
* **Decision Register Entry (`D5` in PRD §2.5):**

| ID | Decision the Agent Makes Without a Human | Inputs | Alternatives | Bound |
| :--- | :--- | :--- | :--- | :--- |
| **D5** | **Resource Match**: Which curated remediation resource to serve next | `final_label`, `P/A/T pattern`, `concept_mastery`, `reading_load`, `audio_available`, `network_mode`, `used_resource_ids` | 6 curated pack resources (`kui_bridge`, `visual_diagram`, `audio_story`, `tier1_text`, `worked_example`) | Hard-gated by `FR-27` (`approved`/`demo_approved` only), `FR-23` (`audio_available`), `FR-6` (`network_mode`), and `FR-25` (Cycle 2 automatically picks Rank #2; $\le 2$ cycles then `TEACHER_FLAG`) |

---

## 2. Architecture & Two-Stage Ranking Pipeline

To satisfy **Engine Purity (`FR-21`)**, **Replay Verification (`FR-22`)**, **Audio Precondition (`FR-23`)**, **Loop Bounds (`FR-25`)**, and **Content Governance (`FR-27`)**, `Resource Match` executes a deterministic two-stage pipeline inside the pure TypeScript engine:

1. **Stage 1 — Hard Eligibility Gates (Disqualification Filter):**
   * **Governance Gate (`FR-27`):** Rejects any resource where `status` is not `'approved'` or `'demo_approved'` (`reason: 'NOT_APPROVED'`).
   * **Audio Hardware Gate (`FR-23`):** Rejects any resource where `requires_audio === true` when `audio_available === false` (`reason: 'AUDIO_UNAVAILABLE'`).
   * **Offline Continuity Gate (`FR-6`):** Rejects any resource where `requires_network === true` when `network_mode !== 'ONLINE'` (`reason: 'OFFLINE_MODE'`).
   * **Cycle-2 Anti-Repetition Gate (`FR-25`):** Rejects any resource whose `resource_id` is in `used_resource_ids` from an earlier remediation cycle in the same episode (`reason: 'ALREADY_TRIED_IN_EPISODE'`).
2. **Stage 2 — 100-Point Deterministic Utility Ranker:**
   * **Diagnosed Need Fit (`0–45 pts`):** `+45` if `final_label` matches the resource's primary target label; `+30` if it matches a secondary fallback label.
   * **Modality & Probe Pattern Fit (`0–25 pts`):**
     * `+25` if the learner passed the Picture probe (`P=1`) and the resource uses `'kui_bridge'` or `'visual_diagram'` (leverages visual strength).
     * `+25` if the learner failed Text decoding (`T=0`), passed Audio (`A=1`), and the resource is `'audio_story'`.
     * `+20` if the learner failed Picture (`P=0`) and the resource is a `'visual_diagram'` (rebuilds the physical mental model).
   * **Language & Reading-Load Fit (`0–15 pts`):**
     * `+15` if `final_label === 'TERM_GAP'` and the resource provides a Kui gloss for the target `term_id` (`T_DISP`).
     * `+10` if `reading_load > 0` and the resource avoids dense written text (`modality !== 'tier1_text'`).
   * **BKT Mastery Tier Fit (`0–15 pts`):**
     * `+15` if `concept_mastery < 0.65` and `resource.tier === 1` (or `concept_mastery >= 0.65` and `resource.tier === 2`).
   * **Deterministic Tie-Break (`FR-21`):** Ties break alphabetically by `resource_id` (`a.resource_id.localeCompare(b.resource_id)`), guaranteeing byte-identical outputs across replays.

---

## 3. Step-by-Step File Implementation

### Step 1: Create `app/src/engine/resourceMatch.ts` (New File)

Create `app/src/engine/resourceMatch.ts` with the following pure TypeScript implementation:

```typescript
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
```

---

### Step 2: Wire `matchResources` into `app/src/engine/index.ts`

1. At the top of `app/src/engine/index.ts`, add:
```typescript
import { matchResources, ResourceMatchOutput } from './resourceMatch';
```
2. Inside `EngineState` (around line 55 of `app/src/engine/index.ts`), add optional tracking fields:
```typescript
  used_resource_ids?: string[];
  last_resource_match?: ResourceMatchOutput | null;
```
3. Inside `Case 3: Observe Targeted Confirmation Item` (`if (v.done)` in `app/src/engine/index.ts`), compute `resourceMatch` and attach it to the `ACT` event payload:
```typescript
    if (v.done) {
      const resourceMatch = matchResources({
        final_label: v.label,
        pattern: state.current_probe_pattern,
        concept_id: state.concept_id,
        term_id: termId,
        concept_mastery: state.concept_mastery,
        reading_load: state.reading_load,
        audio_available: !state.current_probe_pattern.includes(null),
        network_mode: state.network_mode,
        used_resource_ids: state.used_resource_ids ?? [],
      });

      emit('ACT', `REMEDIATION_${v.label}`, {
        final_label: v.label,
        agreement: v.agreement,
        status: v.status,
        resource_match: {
          selected_id: resourceMatch.selected.resource_id,
          selected_title: resourceMatch.selected.title_en,
          chunk_id: resourceMatch.selected.chunk_id,
          score: resourceMatch.selected.score,
          reasons: resourceMatch.selected.reasons,
          runner_up_id: resourceMatch.runner_up?.resource_id ?? null,
          runner_up_score: resourceMatch.runner_up?.score ?? null,
          disqualified: resourceMatch.disqualified,
        },
      });
```
4. At the bottom of `app/src/engine/index.ts`, re-export `resourceMatch`:
```typescript
export * from './resourceMatch';
```

---

### Step 3: Add Unit Tests to `app/tests/engine.test.ts`

Append this `describe` block to `app/tests/engine.test.ts`:

```typescript
  describe('resourceMatch.ts — Deterministic Resource Match & Disqualification Gates', () => {
    const { matchResources } = require('../src/engine/resourceMatch');

    test('TERM_GAP with P=1 selects RES-KUI-DISP-01 (100/100) and filters out draft RES-CLOUD-GEN-01', () => {
      const res = matchResources({
        final_label: 'TERM_GAP',
        pattern: [1, 0, 0],
        concept_id: 'distance_vs_displacement',
        term_id: 'T_DISP',
        concept_mastery: 0.5842,
        reading_load: 0,
        audio_available: true,
        network_mode: 'OFFLINE',
      });

      expect(res.selected.resource_id).toBe('RES-KUI-DISP-01');
      expect(res.selected.score).toBe(100);
      expect(res.runner_up?.resource_id).toBe('RES-VIS-WELL-01');
      expect(res.disqualified.some((d: any) => d.resource_id === 'RES-CLOUD-GEN-01' && d.reason === 'NOT_APPROVED')).toBe(true);
    });

    test('READING_GAP when audio_available=false disqualifies RES-AUD-STORY-01 and falls back to visual', () => {
      const res = matchResources({
        final_label: 'READING_GAP',
        pattern: [1, null, 0],
        concept_id: 'distance_vs_displacement',
        concept_mastery: 0.42,
        reading_load: 1,
        audio_available: false,
        network_mode: 'OFFLINE',
      });

      expect(res.disqualified.some((d: any) => d.resource_id === 'RES-AUD-STORY-01' && d.reason === 'AUDIO_UNAVAILABLE')).toBe(true);
      expect(res.selected.resource_id).toBe('RES-SLOW-PIC-01');
    });

    test('Cycle 2 anti-repetition skips already-used Rank #1 resource and selects Rank #2', () => {
      const res = matchResources({
        final_label: 'TERM_GAP',
        pattern: [1, 0, 0],
        concept_id: 'distance_vs_displacement',
        term_id: 'T_DISP',
        concept_mastery: 0.5842,
        reading_load: 0,
        audio_available: true,
        network_mode: 'OFFLINE',
        used_resource_ids: ['RES-KUI-DISP-01'],
      });

      expect(res.selected.resource_id).toBe('RES-VIS-WELL-01');
      expect(res.disqualified.some((d: any) => d.resource_id === 'RES-KUI-DISP-01' && d.reason === 'ALREADY_TRIED_IN_EPISODE')).toBe(true);
    });
  });
```

---

## 4. Exact Git Commands to Create the Branch & Push to GitHub

Run these commands in your terminal from the root of your `Padhai-Pocket` repository on your laptop:

```bash
# 1. Fetch latest main and create the new feature branch
git fetch origin
git checkout main
git pull origin main
git checkout -b feat/resource-match

# 2. After saving app/src/engine/resourceMatch.ts, app/src/engine/index.ts, and app/tests/engine.test.ts:
cd app
npx tsc --noEmit
npm test
cd ..

# 3. Stage, commit, and push the new branch to GitHub
git add app/src/engine/resourceMatch.ts app/src/engine/index.ts app/tests/engine.test.ts
git commit -m "feat(engine): add deterministic Resource Match ranker and hard eligibility gates (D5)"
git push -u origin feat/resource-match
```
