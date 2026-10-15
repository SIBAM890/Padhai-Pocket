# Padhai Pocket — Shared System Contracts & Golden Vectors

> **Cross-Platform Invariant Source of Truth**  
> **Team:** Coding_Aghoris — NEXTECH 2.0 / NIRMIT 2.0 (14–15 October 2026)  
> **Target:** Client (`/app/`), Backend (`/backend/`), Content Pipeline (`/content/`), and Evaluation (`/eval/`)

This directory contains the language-agnostic schemas, API contracts, and mathematical golden vectors that ensure byte-level and float-level parity across the entire Padhai Pocket ecosystem.

---

## 1. Directory Inventory

| File | Type | Primary Consumer | Purpose & Invariant |
| :--- | :--- | :--- | :--- |
| [`event.schema.json`](./event.schema.json) | JSON Schema (Draft-07) | Client, Backend, SQLite | Immutable learning event schema. Strictly enforces 15 allowed `node` states, monotonically increasing `seq`, RFC 4122 UUIDs, and a 12-char canonical SHA-256 hash. |
| [`pack.schema.json`](./pack.schema.json) | JSON Schema (Draft-07) | Content Pipeline, Validator | Curriculum content pack specification for BSE Odisha Class 9. Enforces chunk ID syntax, Kui-to-Odia terminology dictionaries, and 3-modality probe structures (`P`, `A`, `T`, `W`, `TX`, `PX`, `MCQ`). |
| [`openapi.yaml`](./openapi.yaml) | OpenAPI 3.0.3 | Client, FastAPI Sync Server | Complete REST contract (v1.1.0) covering device registration, batch event synchronization (256 KB / 200 events), teacher summaries, GDPR/DPDP purge, LangGraph agent planning, neural Odia TTS, and state hydration. |
| [`bkt_vectors.json`](./bkt_vectors.json) | Golden Test Vectors | FSM Engine, Pytest, Eval | Standardized Bayesian Knowledge Tracing (BKT) test chains. Guarantees that TypeScript and Python mathematical engines compute identical mastery trajectories within $\le 5 \times 10^{-5}$ float drift. |
| [`probe_vectors.json`](./probe_vectors.json) | Golden Test Vectors | Diagnostic FSM, Simulators | Deterministic 3-way probe truth tables ($2^3 = 8$ bit patterns), candidate-to-label resolutions, and Mulberry32 PRNG seed order verification vectors. |

---

## 2. Cross-Language Mathematical Invariants

### A. Bayesian Knowledge Tracing (BKT) Parameters
Both the client TypeScript FSM (`/app/src/engine/bkt.ts`) and Python evaluation models (`/eval/sim/`) derive mastery updates using these frozen parameters from [`bkt_vectors.json`](./bkt_vectors.json):

$$\text{Slip } (s) = 0.10 \quad|\quad \text{Guess } (g) = 0.25 \quad|\quad \text{Transit Concept } (T_c) = 0.15 \quad|\quad \text{Transit Term } (T_t) = 0.10$$

- **Posterior on Correct**:
  $$P(L \mid \text{correct}) = \frac{P(L) \cdot (1 - s)}{P(L) \cdot (1 - s) + (1 - P(L)) \cdot g}$$
- **Posterior on Incorrect**:
  $$P(L \mid \text{wrong}) = \frac{P(L) \cdot s}{P(L) \cdot s + (1 - P(L)) \cdot (1 - g)}$$
- **Knowledge Update with Transit**:
  $$P(L_{t}) = P(L \mid \text{obs}) + (1 - P(L \mid \text{obs})) \cdot T$$

Golden Verification Chain:
$$\text{Baseline: } 0.4200 \xrightarrow{\text{wrong}} 0.2248 \xrightarrow{\text{correct}} 0.5842 \xrightarrow{\text{correct}} 0.8597$$

### B. Mulberry32 Deterministic PRNG Seed
To ensure offline diagnostics generate identical probe sequences across device reboots without network connectivity:
$$\text{Seed} = \text{uint32}(\text{SHA-256}(\text{profile\_id} \mathbin{\Vert} \text{concept\_id} \mathbin{\Vert} \text{set})[0..3])$$

---

## 3. Event Ledger Integrity & Data Privacy

- **Zero PII**: Invariant enforced by [`event.schema.json`](./event.schema.json) — student names, voice recordings, raw child text inputs, and phone numbers are never stored in events or transmitted over the wire.
- **DPDP Act 2023 & GDPR Compliance**: `/v1/profiles/{id}` provides an audit-logged cryptographic purge that wipes all associated local and cloud telemetry, recording only the hashed identifier in an immutable purge log.
- **Tamper Detection**: Event replays (`replayMasteryFromEvents`) re-simulate the exact BKT chain from raw events. Any modified mastery value triggers verification flags without showing hostile deficit messages to the learner.

---

## 4. Verification Commands

Run the cross-language parity suite against these shared contracts:

```bash
# 1. Validate frontend engine against shared vectors & schemas
cd app && npm test

# 2. Validate official content pack against shared/pack.schema.json
python content/tools/run_validator_tests.py

# 3. Validate backend API compliance & failure modes
pytest backend/

# 4. Verify Python mirror simulation against shared BKT & probe vectors
python eval/test_vectors.py
```
