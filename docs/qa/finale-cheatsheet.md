# Padhai Pocket — Finale CTO Q&A Cheat Sheet

## 1. Auditability & Deterministic Verification

### Q: How does the system verify and audit learning episodes?
**A:** Through our deterministic replay verification system (FR-22).

> **Note on Verify Episode (FR-22 — Reconstruct & Replay):** Because the event ledger stores `input_hash` (not raw inputs) for privacy and compact schema compliance, Verify Episode performs a deterministic reconstruct & replay—reconstructing inputs from the logged event trajectory and re-running `nextAction(state, input, ctx)` to verify byte-identical state and mastery transitions (MATCH).

### Key Technical Guarantees
1. **Zero Raw Input Storage**: Raw learner inputs, keystrokes, and audio are never persisted in the event ledger. Only cryptographic `input_hash` (12 hex characters) is retained for compact schema compliance and student privacy.
2. **Deterministic State Machine**: `nextAction(state, input, ctx)` is a pure mathematical function. Given identical initial seeds and sequence of reconstructed inputs, it produces bit-for-bit identical state transitions and mastery calculations.
3. **Tamper Detection**: If any mastery value, node transition, or sequence order in the SQLite event ledger is modified or corrupted, the replay verifier immediately detects the divergence step and flags the mismatch with divergence reason.

---

## 2. Mastery & Diagnostic Architecture

### Q: How is student knowledge modeled?
**A:** We use Bayesian Knowledge Tracing (BKT) with exact parameterization:
- $P(L_0) = 0.42$ (Initial Concept Mastery)
- $P(T) = 0.15$ (Transit)
- $P(S) = 0.10$ (Slip)
- $P(G) = 0.20$ (Guess)

Mastery updates are deterministic and calculated via:
$$P(L_t | \text{correct}) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$
$$P(L_t | \text{incorrect}) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$

### Q: How does the 3-Way Probe Battery work?
- Probes evaluate three distinct modalities: **Picture (`P`)**, **Audio (`A`)**, and **Text (`T`)**.
- The binary observation vector $(P, A, T) \in \{0, 1\}^3$ maps deterministically to diagnostic hypotheses (`CONCEPT_GAP`, `READING_GAP`, `TERM_GAP`, `RESOLVED`, or `INCONSISTENT`).
- When observations are ambiguous or audio is unavailable, the engine abstains rather than making ungrounded assumptions.

---

## 3. Offline & Sync Resilience

### Q: What happens when the device has no connectivity?
- All lesson packs, audio clips, and SQLite persistence function 100% offline.
- Events are appended to the local SQLite ledger with `sync_status = 'PENDING'`.
- When connectivity is restored, the idempotent `/v1/sync/events` endpoint acknowledges and deduplicates events.
