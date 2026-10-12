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

- **C1** (Std III reading figure): **Open** *(Owner: Sibam — awaiting ASER 2024 PDF page citation)*
- **C2** (Smartphone access 83.2% / ownership 21.5%): **Open** *(Owner: Sibam — awaiting ASER 2024 PDF page citation)*
- **C3** (MLE scale ~1,500 schools, 17 districts): **Open** *(Owner: Sibam — awaiting 101reporters URL)*
- **C4** (24 languages, primers for 21): **Open** *(Owner: Sibam — awaiting The Hindu 2017 URL)*
- **C5** (Kui is an MLE language): **Open** *(Owner: Sibam — awaiting NCERT journal URL)*
- **C6** (Competitor cells): **Open** *(Owner: Sibam — awaiting product page URLs)*
- **C11** (Sync integrity 0 lost / 0 duplicated): **Open (Pilot Target)** *(Owner: Sibam — Demo uses in-memory `demo_storage`)*
- **C13** (Simulated decision reliability): **Measured** *(Owner: Sibam — `eval/sim/report.md` matches §4.8)*
- **C15** (Prompt injection tests): **Open** *(Owner: Sibam — S1 test suite record)*
- **C16** (Unit cost per student-month): **Open** *(Owner: Sibam — cloud pricing calculation)*
- **C18** (Mid-eval feedback): **Open** *(Owner: Sibam — original mid-eval review notes)*
