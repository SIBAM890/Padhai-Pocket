# Padhai Pocket — PRD & Build Bible (v4.0)
*Extracted Reference Copy from Padhai_Final.pdf*

**Team**: Coding_Aghoris · NEXTECH 2.0 (NIRMIT 2.0, NMIET Bhubaneswar)  
**Track**: PS: Agentic EdTech for Regional Language & Geography  
**Team**: Sibam (core backend + agent) · Satya Sarthak Manohari (frontend + middle backend) · Pritam Piyush Nayak (AI + content + automation)  
**Status**: build-ready candidate. Supersedes v3 and v3.1. Frozen.

**Rule of this document**: We win by proving three things live (grounded content, diagnosis, offline continuity), not by claiming ten. Anything not demonstrable inside the demo slot is cut or moved to a backup slide.

---

## What changed in v4 (read first)
v4 was produced by re-checking v3.1 with computation, not only by re-reading it. The code behind the numbers is described in Appendix D.

| # | Area | Gap in v3.1 | v4 fix |
|---|------|-------------|--------|
| 1 | Probe reliability | Described as dependable classifier; clean learner TERM_GAP only 37-45%, mostly abstentions | §4.8 Reliability budget: mechanism demonstration |
| 2 | K1 target | >=4 of 5 consistent unreachable under model | K1 split into K1a (pipeline fidelity 5/5) and K1b (observed consistency reported vs baseline) |
| 3 | Golden vector bug | 0.2248 + correct -> 0.5842 fails at 4 decimals if rounded | Chained at full precision; rounding display-only (§5.1) |
| 4 | Trigger rule vs demo | Demo mastery 0.42 fires rule B, not rule A | Fixed; trigger uses pre-update mastery (§4.1) |
| 5 | Guess noise & confirm depth | Single 4-option item passed 25% by guess | Depth is parameter: demo 1 item, prod 2 items (all pass) (§4.4) |
| 6 | Fatigue & loops | Worst case 14+ probe items, unbounded loops | Episode budget, skip semantics, loop bounds (§4.7) |
| 7 | Audio confound | Muted phone mimics term gap | Sound check; unavailable audio yields no label (§4.2) |
| 8 | Determinism | Seeded order underspecified | Exact seed & PRNG spec (mulberry32), pure nextAction, replay (§4.9) |
| 9 | Prompt injection | Defence relied on testing strings | Closed-set intent design: free text never reaches prompt (§6.4) |
| 10 | Content governance | Unreviewed generated Odia could reach child | Content status machine; child UI renders approved only (§9.6) |
| 11 | Data lifecycle | Immutable events conflicted with erasure | Purge procedure with tombstone, RLS on Postgres (§7, §17) |
| 12 | Connectivity truth | NetInfo alone can be captive portal | Defined ONLINE/WEAK/OFFLINE; healthz check (§6.7) |
| 13 | Demo structure | 8 speaker hand-offs in 7 min | Two stage roles, 4 main slides, timed beats (§13) |
| 14 | Claims discipline | Facts in unchecked boxes | Claims Ledger with strict statuses (§18) |
| 15 | Environment risks | Build queues, font rendering unplanned | Pre-flight readiness checklist (§11.0, §13.4) |

---

## 0. How to Use this Document
- **0.1 Reading order**:
  - Everyone: What changed, §1, §2, §4, §10, §11, §13
  - Sibam: §4, §5, §6, §7, §12, §17
  - Satya: §3, §6, §7, §8, §13, §17
  - Pritam: §4.3, §9, §12.4, §6.4, §15
- **Status tags**: `[VERIFY]` = not confirmed from primary source.
- **Set label**: outcome of one probe set (P, A, T items plus any targeted confirmation).
- **Final label**: outcome of the episode after agreement rule (§4.5). Provisional = demo threshold 1. Confirmed = production threshold 2.
- **Episode**: one probe sequence triggered by one wrong-answer event. Has an `episode_id`.
- **Abstention**: the engine deliberately gives no label (`INCONSISTENT`) and falls back to a safe default.

---

## 1. Problem
- **1.1 The Story**: Sunita, Class 9, rural tribal Odisha. She speaks Kui at home and learns science in Odia at school. She shares a low-end 4 GB phone with family, and signal is weak. She answers a Motion question wrong.
  - Concept gap: Doesn't understand displacement -> Re-teach idea (simpler Odia, local example).
  - Reading gap: Understands, but can't decode Odia text fast enough -> Audio-first mode.
  - Term gap: Understands, hears fine, doesn't know Odia science word -> Bridge the term (Kui explanation + Odia term + visual).
- **1.2 Why Class 9 is the gap**: Odisha's MLE programme uses tribal language for first ~5 years, then moves to Odia. Classrooms drift back to Odia. By Class 9, science is entirely in Odia with no digital bridge for Kui -> Odia.
- **1.3 Sourced facts**: In rural Odisha, 40% of Standard III children could read a Standard II-level text. Among 14-16-year-olds who could use a smartphone, 21.5% owned one; for girls, 17.3% (ASER 2024).

---

## 2. Solution
- **2.1 One sentence**: Padhai Pocket is an offline-resilient diagnostic agent: when a Class 9 Kui-home student gets a Motion question wrong, it runs a 3-way probe (picture / Odia audio / Odia text) to screen whether the cause is concept, reading, or term, then teaches the matching remediation — and keeps doing so with no network.
- **2.2 Core insight**: Simple View of Reading (decoding vs language comprehension) applied to secondary science.
- **2.3 How it works for Sunita**:
  1. Picks avatar (shared phone, no login) -> taps 'teach me Motion'.
  2. PLAN: agent picks concept and tier.
  3. TOOL: curriculum_tool retrieves BSE chunk with audio and chunk ID.
  4. Wrong MCQ.
  5. PROBE: fires after sound check.
  6. REFLECT: pattern -> candidate -> targeted confirmation -> set label with agreement score.
  7. ACT: matching remediation.
  8. MASTERY: concept and term estimates update.
  9. Offline: all runs locally from bundled pack.
  10. SYNC: events upload when online; teacher view shows label breakdown.
- **2.4 What we claim and do not claim**:
  - Claim: transparent diagnostic loop, offline agency, grounded content (BSE chunk IDs), starter Kui glossary, screening signal for teachers.
  - Do NOT claim: on-device LLM, offline generation, full Kui coverage, psychometric accuracy.
- **2.5 Autonomy / Decision Register (D1-D7)**:
  - D1: Which concept & tier to teach next.
  - D2: Whether to probe at all (Rule B: mastery < 0.50).
  - D3: Which probe order & set (seeded PRNG).
  - D4: Candidate -> confirm vs abstain.
  - D5: Which remediation to run.
  - D6: Which plan source (Gemini / cached / rule).
  - D7: When to escalate to teacher.

---

## 3. Product Requirements
- **3.1 Users**: Sunita (low literacy fluency, voice-first, supportive copy, never sees words 'wrong'/'gap'/'diagnosis'), Teacher (multi-grade summary), Judge/CTO.
- **3.2 MoSCoW**: Must = 3-way probe + decision table + targeted confirmation + agreement rule; on-device pure engine; BKT mastery; visible trace panel; Motion pack with chunk IDs; Kui starter glossary; sync with event_id, idempotency, server ack.
- **3.3 Functional Requirements (FR-1 to FR-34)**:
  - FR-1: Wrong MCQ on target concept fires probe using pre-update mastery (§4.1).
  - FR-2: P/A/T items run in seeded order using mulberry32 (§4.9).
  - FR-3: Pattern -> candidate -> targeted confirmation -> set label.
  - FR-4: Agreement threshold = 1 in demo (CONFIRM_THRESHOLD=1), 2 in production.
  - FR-5: Remediation routes by final label (§4.7).
  - FR-6: Whole loop works offline with audio.
  - FR-7: Cites valid chunk ID; trace prints 4 REFLECT checks separately.
  - FR-8: Trace renders from SQLite event rows.
  - FR-9: SYNCED shown only when event ID returned in acked or duplicates.
  - FR-10: Duplicate event_id creates no second record.
  - FR-11: Gemini timeout falls back to cached plan with visible FALLBACK event.
  - FR-12: Raw log opens by tapping logo 5x within 3s.
  - FR-13: Child-facing UI never shows 'gap', 'diagnosis', 'wrong'.
  - FR-16: Strings from strings.or.json; friendly Odia error screen.
  - FR-17: /v1/sync/events requires per-device bearer token; token issued via /v1/devices/register; stored in expo-secure-store.
  - FR-20: events table immutable; delivery state lives in sync_queue.
  - FR-21: nextAction(state, input, ctx) pure function with injected now and seed.
  - FR-22: Replay verification on logged OBSERVE inputs.
  - FR-23: Sound check once per session; failure yields AUDIO_UNAVAILABLE.
  - FR-24: Skip is no evidence; 2 skips abort set as INCONSISTENT.
  - FR-25: Bounds: <=3 sets/episode, <=8 probe items/sitting, <=2 remediation cycles/concept.
  - FR-26: Closed-set intent: student speech mapped to enum {TEACH_CONCEPT, REPEAT, HELP, UNKNOWN}.
  - FR-27: Status machine: draft -> reviewed -> approved (demo_approved for hero).
  - FR-28: Profile erasure: teacher PIN -> purge local and DELETE /v1/profiles/{id}.
  - FR-31: Network mode follows §6.7.

---

## 4. The Diagnostic Engine
- **4.1 Trigger Rule**: Rule A (2nd wrong) or Rule B (1st wrong with pre-update mastery < 0.50). Demo profile starts at 0.42 -> fires Rule B. Max 2 episodes/session.
- **4.2 Probe Design**:
  - Picture (P): Path diagram, tap-the-arrow, no text beyond icons.
  - Audio (A): Question read aloud in Odia; options voiced or pictorial, NEVER text.
  - Text (T): Question and options in Odia text.
  - Exactly 4 options per item (guess rate g = 0.25).
  - Sound check precondition: if failed, A = null, engine abstains (AUDIO_UNAVAILABLE).
- **4.3 Item Inventory**: Concept `distance_vs_displacement`. Sets A and B (parallel), confirmation items W1/W2, TX, PX, parallel post-remediation MCQs.
- **4.4 Decision Table**:
  - 1,1,1 -> RESOLVED
  - 1,1,0 -> READING_GAP_CANDIDATE -> TX fails -> READING_GAP (passes -> INCONSISTENT)
  - 1,0,0 -> LANGUAGE_OR_TERM_GAP_CANDIDATE -> W fails -> TERM_GAP (passes -> LISTENING_OR_COMPREHENSION)
  - 0,0,0 -> CONCEPT_GAP_CANDIDATE -> PX fails -> CONCEPT_GAP (passes -> INCONSISTENT)
  - any other or A=null -> INCONSISTENT
- **4.5 Agreement Rule**:
  - Demo (threshold=1): first non-INCONSISTENT label -> provisional (1/n).
  - Production (threshold=2): clean first set (RESOLVED) ends; else 2 matching sets -> confirmed (c/n); else abstained (0/n).
- **4.7 Remediation Specification**:
  - TERM_GAP: (1) Kui everyday description (audio+text) -> (2) Odia term (audio+text) -> (3) visual -> (4) post-remediation W check. Exit: W passes -> term mastery up.
  - CONCEPT_GAP: (1) local-example scene (village well) -> (2) tier-1 simpler Odia -> (3) parallel MCQ. Exit: Parallel MCQ correct -> concept mastery up.
  - READING_GAP: Audio-first mode ON (auto-play with highlight) -> reading_load += 1 -> parallel MCQ.
  - LISTENING_OR_COMPREHENSION: Picture-first, 0.75x slower audio, short sentences -> parallel MCQ.
  - INCONSISTENT: Safe default (audio-first + tier-1 simpler Odia + teacher flag).
- **4.8 Reliability Budget**: Simulation baseline (Appendix D). Engine prefers abstention to false diagnosis.
- **4.9 Determinism Spec**:
  - seed = uint32 from first 4 bytes of SHA-256("<profile_id>|<concept_id>|<set_id>")
  - PRNG = mulberry32(seed)
  - Fisher-Yates shuffle over ["P", "A", "T"].
  - Injected clock and RNG via ctx: { now: number, seed: number }.

---

## 5. Mastery Models
- **5.1 BKT**:
  - wrong: P' = P*s / (P*s + (1-P)*(1-g))
  - correct: P' = P*(1-s) / (P*(1-s) + (1-P)*g)
  - learn: P_next = P' + (1-P')*t
  - s = 0.10, g = 0.25, t = 0.15 (concept), t = 0.10 (term).
  - Precision: Chained at full floating-point precision; rounding to 4 decimals is display-only.
- **5.3 Update Policy**: Probe answer updates only the state it was designed to measure.

---

## 6. Agent Loop & Architecture
- Loop: PLAN -> TOOL CALL -> OBSERVE -> PROBE -> CONFIRM -> REFLECT -> ACT -> MASTERY -> FALLBACK -> SYNC
- REFLECT 4 checks (never merged):
  1. chunk_exists=PASS|FAIL
  2. glossary_terms=PASS|FAIL
  3. readability=PASS|FAIL
  4. model_source_check=PASS|FAIL|UNAVAILABLE
- Network Tiers:
  - Online: Gemini PLAN, pack audio (+ Bhashini TTS), Engine + Gemini.
  - Weak: Cached plan, pack, pack, Engine.
  - Offline: Local rule planner, pack, pack, Engine.

---

## 7. Data Contracts
- 7.1 Event Schema v1.1 (/shared/event.schema.json).
- 7.2 SQLite Schema: events (with immutable triggers), sync_queue, mastery, profile_state, episode_state, purge_log, purge_guard, schema_version.
- 7.3 Postgres Schema (/backend/schema.sql): RLS enabled on all 4 tables with no policies (service-role only).
- 7.4 Sync API: /healthz, /v1/devices/register, /v1/sync/events, /v1/summary, /v1/profiles/{id}.
- 7.5 Content Pack Format (/content/motion_pack.json, /shared/pack.schema.json). Chunk IDs: BSE9-PHYS-MOTION-S02 (no chapter numbers).

---

## 8. Offline & Degraded-Mode Behaviour
- Airplane mode on mid-lesson: continues from pack.
- Wrong answer offline: engine picks tier-1 variant, queues revision, lowers mastery (3 visible state changes).
- Captive portal: treated as OFFLINE (healthz fails).
- Gemini timeout: falls back to cached plan.

---

## 9. Content Plan (Pritam)
- Chunks: 1. Motion and rest · 2. Distance and displacement (hero concept) · 3. Average speed · 4. Velocity · 5. Acceleration · 6. Graphs.
- Terms: T_DIST, T_DISP, T_SPEED, T_VEL, T_ACC, T_REST. Odia terms from textbook only.
- Kui Glossary: Everyday explanation in Kui + Odia term + visual. Native speaker consent, ~16 kbps Opus.
- Status machine: draft -> reviewed -> approved (demo_approved for hero).

---

## 10. Team Split
- Sibam: Backend, Agent Engine, Sync API, Simulation. Presenter on stage.
- Satya: Mobile app, SQLite, UI, Sync client. Operator on stage.
- Pritam: AI prompts, Content pack, Textbook grounding, Kui audio. Content voice on stage.

---

## 11. Timeline & Cut Ladder
- Cut ladder order: (1) Teacher view -> plain table, (2) Profile picker -> single profile, (3) Bhashini ASR -> tap input only, (4) Model-based REFLECT -> deterministic checks only, (5) Backend PLAN -> deterministic rule planner.
- Never cut: engine, offline loop, trace from real log, sync ack, grounded chunk IDs, 4 REFLECT checks, child error screens, sound check, device token, RLS.

---

## 13. Live Demo Script (7:00 min)
- 0:00-0:40 Sunita story + numbers
- 0:40-1:25 Lesson + tool trace + 4 REFLECT checks
- 1:25-2:55 Wrong answer -> sound check -> 3-way probe -> candidate -> word check -> TERM_GAP
- 2:55-3:45 Kui bridge -> Odia term -> mastery update
- 3:45-4:00 (Optional) Verify episode -> MATCH
- 4:00-5:05 Airplane ON -> wrong MCQ -> offline branch -> restart app -> progress intact
- 5:05-5:50 Airplane OFF -> PENDING -> ACKED -> teacher view
- 5:50-6:20 Evidence & limitations
- 6:20-6:45 (Optional) Judge plays Sunita
- 6:45-7:00 Pilot ask + close

---

## 17. Security & Privacy
- S1: Prompt injection blocked via closed-set intent enum.
- S2: No secrets in repo or app.
- S3: Sync limits (256 KB, 200 events, 30 req/min).
- S4: Cross-profile isolation.
- S7: X-Failure-Mode honored only when ENV=demo.
- S8: Supabase RLS on all tables with no policies.

---

## 19. Go / No-Go Gates
- G0: Contracts and vectors pass.
- G1: Offline slice works on phone (wrong -> sound check -> probe -> label -> mastery -> trace).
- G2: Sync to server with ack.
- G3: Feature freeze.
- G4: Code freeze.
- G5: 3 clean timed rehearsals.

---

## 20. Winning Claim
"Padhai Pocket is built where Odisha's tribal-language support ends: when a Kui-first student reaches Class 9 science in Odia. When Sunita gets a Motion question wrong, our agent doesn't guess and doesn't pretend to be certain... One concept. One loop. Three causes. Offline agency."
