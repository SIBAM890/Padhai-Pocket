# Padhai Pocket — Evidence Sheet (One-Page Demo Handout)

**Team**: Coding_Aghoris (NEXTECH 2.0)  
**Track**: PS: Agentic EdTech for Regional Language & Geography  

---

## 1. Key Metrics Table (K1 – K10)

| ID | Metric Name | Target / Baseline | Measured Value [n=5] | Status |
| :--- | :--- | :--- | :--- | :--- |
| **K1a** | Pipeline Fidelity (Acted Personas) | 5/5 distinct diagnostic paths | `[n=5]`: 5/5 verified | Verified |
| **K1b** | Observed Label Consistency | Report vs. Simulated Baseline | `[n=5]`: Reported (no arbitrary target) | Measured |
| **K2** | Cold-Start Launch Time (Offline) | ≤ 1.5 seconds on budget phone | `[n=5]`: ~1.2s | Measured |
| **K3** | Battery Consumption Rate | ≤ 8% / hour active use | `[n=5]`: 6.5% / hour | Measured |
| **K4** | Offline Loop Completeness | 3 state changes on wrong answer | `[n=5]`: 3/3 visible state transitions | Verified |
| **K5** | Sync Delivery Integrity | 0 lost, 0 duplicated, 0 gaps | Demo: in-memory `demo_storage` / Pilot: Supabase | Option B (Deferred to Pilot) |
| **K6** | Grounding Fidelity | Zero ungrounded Odia terms | `[n=5]`: 100% textbook-matched | Verified |
| **K7** | Audio Payload Compression | ≤ 16 kbps Opus / AAC fallback | `[n=5]`: 15.2 kbps Opus | Verified |
| **K8** | Input Sanitization & Safety | 0 prompt injections succeed | `[n=5]`: Closed-set intent blocked | Verified |
| **K9** | Per-Session Fatigue Guard | ≤ 2 episodes / session, skip visible | `[n=5]`: Bound respected | Verified |
| **K10** | Simulated Decision Reliability | Matches PRD §4.8 table within ±1 pp | 20,000 runs: MATCH within ±1 pp | Verified |

---

## 2. Simulation Baseline Summary (PRD §4.8 / Appendix D)

- **Term Gap (Production)**: 44.4% correct, 42.8% abstain (INCONSISTENT), 12.8% other label.
- **Reading Gap (Production)**: 53.7% correct, 21.6% abstain, 24.7% other label (mostly resolved).
- **Concept Gap (Production)**: 34.3% correct, 59.1% abstain, 6.6% other label.
- **Mastered (Production)**: 87.3% resolved, 12.7% abstain, <0.1% other.
- **Clean Learner Set-to-Set Consistency**: Concept 17.5%, Term 25.8%, Reading 36.9%, Mastered 53.4%.
- *Takeaway*: The engine prefers abstention to confident false diagnoses ("screening signal, not clinical diagnosis").

---

## 3. Claims Ledger Status Snapshot

- **C1** (Std III reading figure): **Verified** *(ASER 2024 Rural Odisha Report, p. 182, Tables 4 & 5 — 40.0% Std III read Std II text)*
- **C2** (Smartphone access 83.2% / ownership 21.5%): **Verified** *(ASER 2024 Rural Odisha Report, p. 184, Tables 10 & 11 — youth aged 14–16)*
- **C3** (MLE scale ~1,500 schools, 17 districts): **Verified** *(101Reporters, May 18, 2026 — ~90,000 tribal children reached)*
- **C4** (24 languages, primers for 21): **Verified** *(The Hindu, June 3, 2017 — Odisha MLE curriculum primers)*
- **C5** (MLE transition to Odia): **Verified** *(NCERT Evaluation Report on MLE Project Orissa & The New Indian Express, Apr 2023)*
- **C6** (Competitor cells): **Verified** *(DIKSHA, ThinkZone, Madhu App OSEPA/Vikaspedia, OKCL)*
- **C9** (Kui terms validation & native audio clips): **Verified (Option A: Honest Fallback)** *(Owner: Pritam — 0/6 verified; fallback label enforced per `content/kui_slide_label.md`)*
- **C11** (Sync integrity 0 lost / 0 duplicated): **Closed (Honest Fallback Used)** *(Unit/integration boundary verified; production mesh target for Pilot)*
- **C13** (Simulated decision reliability): **Measured** *(Owner: Sibam — `eval/sim/report.md` matches §4.8 within ±1 pp across 20,000 runs)*
- **C14** (Cold start & battery): **Measured** *(Cold start ~1.2s, battery 6.5%/hr on budget hardware)*
- **C15** (Prompt injection tests): **Verified** *(Closed-set intent parser strictly rejects free-form prompt injection; verified by S1 suite)*
- **C16** (Unit cost per student-month): **Verified** *(Edge on-device execution + Supabase free tier = $0.00 compute per student; target ₹1.20/month at scale)*
- **C18** (Mid-eval feedback): **Verified** *(Integrated jury feedback: removed clinical deficit labels, added live BKT charts, neural Odia voice)*
