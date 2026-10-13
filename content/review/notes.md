# Pipeline Engineering & Review Notes

## 1. Schema Discrepancy Notes (`shared/pack.schema.json` vs PRD v4.0)
- **`chunk_id` pattern**:
  - `shared/pack.schema.json` defines `^BSE9-[A-Z]+-[A-Z]+-S[0-9]{2}$` (e.g., `BSE9-PHYS-MOTION-S02`).
  - PRD v4.0 Phase 1 hero chunks use subsection chunk IDs `BSE9-PHYS-MOTION-S02-01`, `-02`, `-03`.
  - Validator v3 outputs `SCHEMA MISMATCH — needs Sibam` for the official schema check, while local rules permit it with a warning (`chunk_id form unconfirmed with Sibam`).
- **`items` properties & status**:
  - `shared/pack.schema.json` enforces `additionalProperties: false`.
  - Allowed fields on items are strictly: `item_id`, `concept_id`, `set`, `modality`, `stem`, `options`, `correct`, `audio`, `misconception_tag`.
  - Item status is **"draft"** for all items. Because `status` is not part of the item schema definition in `shared/pack.schema.json`, item status is tracked here in review notes rather than in the pack JSON to preserve strict schema compliance.
- **Item Modality Enum for Post-Remediation (PM1, PM2)**:
  - PRD mentions modality "M", but `shared/pack.schema.json` defines the modality enum as `["P", "A", "T", "W", "TX", "PX", "MCQ"]`.
  - Per the prompt instruction `(modality "M" unless the schema says otherwise)`, PM1 and PM2 are assigned modality **`"MCQ"`** to satisfy the frozen schema enum.

## 2. Word-Concept Matching (W) Limitations
- **W Item Specification**:
  - `W1` and `W2` present the target science term simultaneously spoken (audio) and written (text).
  - Response options are strictly pictorial / diagrams (`picture options only`, no text).
- **The W Limit**:
  - W items isolate term recognition (lexical decoding) from reading comprehension by removing reading load from the options.
  - However, W items are limited to 1-to-1 term-visual recognition. Passing a W item confirms the child recognizes what the Odia science word (`ଦୂରତା` or `ବିସ୍ଥାପନ`) refers to, but does NOT prove the child can apply vector algebra, sign conventions, or solve word problems. Therefore, W items serve exclusively as targeted confirmation for `LANGUAGE_OR_TERM_GAP`, not as a comprehensive concept test.

## 3. Extraction Ladder Findings (`9th_Physical_Science105.pdf`)
- **Extraction Tool**: `pypdf` (version 6.20.1) installed and executed.
- **Sanity check result**:
  - Odia Unicode block (U+0B00–U+0B7F) character share: **0.00%** across all 18 pages.
  - Character encoding inspection: The BSE Odisha physical science PDF uses custom embedded Type 1 fonts (`MSTT31c366`, `MSTT31c374`, `MSTT31c38e`) with `ToUnicode: None`. Extracted text layer contains unmapped raw glyph tokens (`/G40/GFB/G63/G65...`).
  - Per Step B of the Extraction Ladder, automated repair/guessing is strictly prohibited.
  - Per Step C, reading from the high-resolution textbook photos (`p57`, `p58`, `p60`, `p61`) requires explicit user command: `ALLOW VISION READ`.

## 4. Kui Terms Strategy Decision (PRD v4.0 §18 Claim C9)
- **Decision**: Option A (Ethical & Academic Honesty) formally adopted.
- **Specification**:
  - All 6 terms maintain `status: "pending"` with `kui.script: "[VERIFY with speaker]"` and `kui.audio: null` in both `content/motion_pack.json` and `content/glossary.json`.
  - Zero hallucinated tribal vocabulary or AI-synthesized audio clips are used.
  - UI slide label enforced verbatim per `content/kui_slide_label.md`:
    > `Kui starter glossary — text-only in Odia script; native audio pending validation` (0/6 verified).
  - Child UI presentation: Audio speaker icons are disabled/greyed out with a clear visual tooltip that native recording validation is pending.

