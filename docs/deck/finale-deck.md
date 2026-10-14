# Padhai Pocket — Finale Pitch Deck

> **One Concept. One Loop. Three Causes. Offline Agency.**  
> *NEXTECH 2.0 Hackathon Finale Presentation — Team Padhai Pocket*

---

## Slide 1 — Title & Mission Statement

# Padhai Pocket (ପଢ଼ାଇ ପକେଟ୍)
### One Concept. One Loop. Three Causes. Offline Agency.

**The First Offline-Resilient Diagnostic Agent for Rural Odisha's Secondary Science Learners.**

* **The Core Gap**: Bridging the critical transition where tribal mother-tongue education (MLE) ends and Class 9 secondary science begins in academic Odia.
* **The Engineering Principle**: Not guessing, not predicting with false certainty. Running transparent, on-device diagnostic loops that identify *why* a student stumbled and intervening locally without connectivity.

---

## Slide 2 — The Sunita Story & Odisha Educational Reality

### When Sunita Gets a Physics Question Wrong... What Actually Failed?

* **Meet Sunita**:
  * Class 9 student in a rural tribal district (Koraput / Kandhamal / Rayagada).
  * Speaks **Kui** at home; studies BSE Odisha Physical Science in formal **Odia** at school.
  * Shares a low-end 4 GB Android smartphone with family members; mobile network is weak or frequently absent.
* **The Flaw of Modern EdTech**:
  * Standard apps treat every incorrect MCQ response identically: *"Wrong answer, review Chapter 5."*
* **The Educational Reality (Simple View of Reading applied to Science)**:
  * An incorrect answer to *Distance vs. Displacement (ଦୂରତା ବନାମ ବିସ୍ଥାପନ)* has **three completely different root causes**:
    1. **Concept Gap**: Sunita lacks physical intuition about scalar path length vs. vector shortest-distance $\rightarrow$ Needs visual re-teaching with local analogies.
    2. **Reading Gap**: Sunita understands vectors intuitively, but cannot decode complex Odia script fast enough on screen $\rightarrow$ Needs audio-first question modality.
    3. **Term Gap**: Sunita understands the motion and hears the Odia sentence, but confuses the formal Odia textbook terms (*ବିସ୍ଥାପନ* vs *ଦୂରତା*) $\rightarrow$ Needs a mother-tongue bridge (Kui everyday explanation + Odia term).
* **The Hard Data (ASER 2024 Odisha)**:
  * Only **40%** of rural Standard III children in Odisha can read a Standard II-level text fluently.
  * Among 14–16-year-olds who can use smartphones, only **21.5%** own their own device; for girls, ownership drops to **17.3%**.
  * **The Class 9 Drop-Off Cliff**: Odisha's multilingual education (MLE) supports tribal languages up to primary school. By Class 9, science textbooks are exclusively in formal academic Odia with zero digital linguistic bridges.

---

## Slide 3 — The 3-Way Diagnostic Probe & Decision Table

### Systematic Triangulation: Picture (P) · Audio (A) · Text (T)

When Sunita misses a primary diagnostic question, Padhai Pocket triggers a targeted **3-way probe sequence**:

| Picture (P) | Audio (A) | Text (T) | Candidate Cause | Targeted Confirmation | Final Diagnostic Label | Remediation Action |
|:---:|:---:|:---:|:---|:---|:---|:---|
| **1 (✓)** | **1 (✓)** | **0 (✗)** | Reading decoding barrier | $TX$ (Audio read-aloud check) | **READING_GAP** | Audio-first mode + visual pacing |
| **1 (✓)** | **0 (✗)** | **0 (✗)** | Science vocabulary barrier | $W$ (Isolated word check) | **TERM_GAP** | Kui mother-tongue bridge + Odia textbook pair |
| **0 (✗)** | **0 (✗)** | **0 (✗)** | Physics concept barrier | $PX$ (Pure diagram check) | **CONCEPT_GAP** | Simpler Tier 1 explanation grounded in BSE chunk |
| *Noisy / Mixed* | *Noisy / Mixed* | *Noisy / Mixed* | Inconclusive signal | — | **INCONSISTENT (Abstain)** | Safe supportive review; no deficit labeling |

* **Agreement & Confirmation Rule (FR-12)**:
  * A candidate label is never finalized from probes alone. It requires targeted confirmation ($W1$, $TX1$, or $PX1$).
  * If candidate and confirmation match $\rightarrow$ Confirmed label (`confirm_threshold: 2`).
  * If confirmation fails or probes diverge $\rightarrow$ Engine abstains (`INCONSISTENT`), avoiding harmful misdiagnosis.

---

## Slide 4 — Live Demonstration Beat Sheet (7:00 Minutes)

| Timing | Demo Segment | On-Screen Action & Evidence | Technical Anchor |
|---|---|---|---|
| **0:00 – 0:40** | **The Problem & Context** | Sunita's profile card, rural Odisha context, ASER numbers. | `PRD §1.3`, Low-connectivity reality |
| **0:40 – 1:25** | **Online Lesson & Tool Grounding** | Sunita opens *Motion*. Curriculum tool loads verified BSE Chunk `BSE9-PHYS-MOTION-S02-02`. 4 parallel REFLECT checks displayed. | `FR-7`, Chunk citation, zero hallucination |
| **1:25 – 2:55** | **The Diagnostic Loop** | Sunita misses MCQ. Sound check passes. 3-way probe fires ($P=1, A=0, T=0$). Word check $W=0$. Candidate resolves to `TERM_GAP`. | `PRD §4.3`, Deterministic seed PRNG |
| **2:55 – 3:45** | **Kui Bridge & Mastery Update** | App displays native-verified Kui glossary bridge for *Displacement*. Sunita retries and succeeds ($W=1, PM1=1$). BKT mastery updates to `0.7643`. | `PRD §5.1`, BKT floating-point math |
| **3:45 – 4:00** | **Deterministic Episode Replay** | Operator taps *Verify Episode* in Judge Telemetry. Engine replays sequence from log; confirms 100% decision and mastery match. | `FR-22`, Pure engine replay, anti-tamper |
| **4:00 – 5:05** | **Airplane Mode ON (Offline Agency)** | Airplane mode toggled ON. Sunita answers offline. Local SQLite stores `PENDING` events. App process killed and restarted $\rightarrow$ Progress 100% intact. | `PRD §8.2`, SQLite offline persistence |
| **5:05 – 5:50** | **Airplane Mode OFF & Multi-Grade Sync** | Airplane mode toggled OFF. Background sync uploads 10 events. Server returns ACK. Teacher View shows diagnostic breakdown. | `FR-10`, Idempotent batch sync, SQLite RLS |
| **5:50 – 6:20** | **Evidence & Boundaries** | Bundle size (975 KB), 63/63 test suite pass, zero PII leakage. | `PRD §17`, Data minimisation |
| **6:20 – 6:45** | **Judge Hands-On Interaction** | Judge taps test profile, triggers alternate probe sequence. | Interactive live trial |
| **6:45 – 7:00** | **Pilot Ask & Call to Action** | 50-school deployment plan across Koraput, Rayagada, and Kandhamal. | Hackathon closure |

---

## Backup Slide 1 — Agentic Architecture & Privacy Boundary

```
  [STUDENT UTTERANCE / TAP]
            │
            ▼
┌───────────────────────────┐
│   Closed Intent Mapper    │  ◄── Drops raw text / student voice (FR-26)
│   {TEACH, REPEAT, HELP}   │      Quarantines prompt injections (Test S1)
└─────────────┬─────────────┘
              │ Minimal Payload: {candidate_concept_ids, mastery_bucket, tier_history}
              ▼ (NO profile_id, NO device_id, NO names, NO transcripts - PRD §6.8)
┌───────────────────────────┐
│        PLAN Node          │  ◄── Gemini 1.5 Flash (Pinned) / Rule Fallback
│  Output: {concept, tier}  │      Prompt Version Hash: 077af84e590a
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│    gen_explanation Node   │  ◄── BSE Odisha textbook chunk grounding
│    Cites approved chunk   │      Zero deficit words ("wrong", "gap", "ଭୁଲ")
└─────────────┬─────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│                        REFLECT Node                          │
│  Four Parallel, Independent, Unmerged Verifications (FR-7):  │
│  1. chunk_exists: PASS       2. glossary_terms: PASS         │
│  3. readability: PASS        4. model_source_check: PASS     │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│         ACT Node          │  ◄── Delivers verified remediation or
│                           │      falls back to pre-approved cached chunk
└───────────────────────────┘
```

---

## Backup Slide 2 — Technical Evidence & Verification Proof

* **Complete Test Coverage**:
  * **63 / 63 passed** Jest tests in `app` (Engine BKT, Seed determinism, SQLite lifecycle, Replay verification, Teacher queries, Multi-tap gesture).
  * **14 / 14 passed** Pytest tests in `backend` (LangGraph reflection, Idempotent sync, SQLite RLS, Authentication).
  * **3 / 3 passed** S1 prompt injection unit tests with 100% raw text quarantine.
  * **17 / 17 passed** Content pack validator self-tests.
* **Engine Purity**:
  * Pure TypeScript state machine (`app/src/engine/`).
  * Pure BKT mathematics (`bkt.ts`) matching floating-point goldens to 4 decimal places.
  * Zero external state, zero random numbers (seeded PRNG only), zero network dependencies in core decision loop.
* **Lightweight Bundle Footprint**:
  * Total application bundle size: **< 975 KB**.
  * Instant startup on budget 4 GB RAM Android devices without thermal throttling.

---

## Backup Slide 3 — Deployment Roadmap & Pilot Ask

### The 50-School Secondary Science Pilot

* **Target Geography**:
  * High-tribal concentration districts in Southern & Central Odisha: **Koraput**, **Rayagada**, and **Kandhamal**.
  * Grade focus: **Class 9 (BSE Odisha Board)**.
* **Pilot Phase 1 (Month 1–3)**:
  * Deploy Padhai Pocket on 100 school/community shared tablets.
  * Native speaker validation and recording of 120 key science vocabulary terms in Kui (using established consent and governance protocols).
* **Pilot Phase 2 (Month 4–6)**:
  * Measure diagnostic accuracy against classroom teacher observational evaluations.
  * Track reduction in science dropout rates and increase in Class 10 board exam readiness.
* **Our Ask**:
  * Partnership with Odisha School Education Programme Authority (OSEPA) and SCERT Odisha for classroom pilot clearances.
  * Grant funding for native tribal language speaker honorariums and field telemetry analysis.
