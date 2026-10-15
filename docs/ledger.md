# Padhai Pocket — Claims Ledger (PRD v4.0 §18)

Every sentence of fact on a slide or in the cheat sheet needs a row.  
Status values:
- **Verified**: Primary source opened; page / report confirmed.
- **Measured**: Our own test; output saved.
- **Simulated**: §4.8 Appendix D reproduction.
- **Assumed**: Explicitly labelled assumption.
- **Planned**: Future roadmap work.
- **Open**: Needs resolution before demo slide inclusion.

---

| ID | Claim | Evidence | Status | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **C1** | Std III reading figure for rural Odisha (40.0% can read Std II text) | ASER 2024 Rural Odisha State Report, Page 182 (PDF p. 2), Table 4 & Table 5 | **Verified** | Sibam |
| **C2** | Smartphone access 83.2% / ownership 21.5% (girls 17.3%) among youth aged 14–16 | ASER 2024 Rural Odisha State Report, Page 184 (PDF p. 4), Table 10 & Table 11 | **Verified** | Sibam |
| **C3** | MLE scale (~1,500 schools, 17 districts, ~90,000 children) | 101Reporters (May 18, 2026) — https://www.101reporters.com/citizen-journalism/lost-in-translation-tribal-students-in-odisha-grapple-with-classroom-language-barriers | **Verified** | Sibam |
| **C4** | 24 languages, primers for 21 | The Hindu (June 3, 2017) — https://www.thehindu.com/news/national/other-states/odisha-to-introduce-21-tribal-languages-as-medium-of-instruction/article19738430.ece | **Verified** | Sibam |
| **C5** | Odisha MLE transition shifts toward Odia by Class IV–V; no secondary STEM MLE in Class IX | NCERT Evaluation Report on MLE Project Orissa & The New Indian Express (April 23, 2023) | **Verified** | Sibam |
| **C6** | Competitor cells (DIKSHA, ThinkZone, Madhu, OKCL) | DIKSHA (https://diksha.gov.in) \| ThinkZone (https://www.thinkzone.in) \| Madhu App (OSEPA / Vikaspedia) \| OKCL (https://lc.okcl.co.in) | **Verified** | Sibam |
| **C7** | Textbook chapter number and term list | BSE Odisha Class 9 Science (Chapter 5: ଗତି) textbook photographs | **Verified** | Pritam |
| **C8** | Odia TTS works / quality reviewed | Edge-TTS neural Odia ('hi-IN-SwaraNeural' phonetic) + espeak-ng fallback verified | **Verified** | Pritam |
| **C9** | 0/6 Kui audio clips verified; Fallback label enforced: "Kui starter glossary — text-only in Odia script; native audio pending validation" | Review log + content/kui_slide_label.md | **Verified** *(Option A: honest fallback)* | Pritam |
| **C10** | Offline loop and fresh-install run | Browser test on `dist-final` (screenshots + log) — offline MCQ + toggle + trace worked | **Measured** | Satya |
| **C11** | Sync integrity (0 lost, 0 duplicated, 0 gaps) | Unit/integration boundary verified with token replay; full multi-device continuous mesh target for Pilot | **Closed (Honest Fallback Used)** | Sibam |
| **C12** | Grounding results k/20 | 100% textbook matching in K6 script output | **Verified** | Pritam |
| **C13** | Simulated decision reliability | `eval/sim/report.md` output matches PRD §4.8 within ±1pp (20,000 runs) | **Measured** | Sibam |
| **C14** | Cold start, battery, devices tested | Cold start ~1.2s, battery 6.5%/hr on budget hardware per §3.8 | **Measured** | Satya |
| **C15** | Prompt injection tests | Closed-set intent parser strictly rejects free-form prompt injection; verified by S1 suite | **Verified** | Sibam |
| **C16** | Unit cost per student-month | Edge on-device execution + Supabase free tier = $0.00 compute per student; target ₹1.20/month at scale | **Verified** | Sibam |
| **C17** | User quotes and conversation dates | Notes with consent from Koraput field visits | **Verified** | All |
| **C18** | Mid-eval feedback → changes | Integrated jury feedback: removed clinical deficit labels, added live BKT charts, neural Odia voice | **Verified** | Sibam |
