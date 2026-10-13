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
| **C1** | Std III reading figure for rural Odisha | ASER 2024 Odisha PDF, page __ | **Open (need ASER Odisha PDF page 20-25)** | Sibam |
| **C2** | Smartphone access 83.2% / ownership 21.5% (girls 17.3%) and denominators | ASER 2024 Odisha PDF, page __ | **Open (need ASER Odisha PDF page 35-40)** | Sibam |
| **C3** | MLE scale (~1,500 schools, 17 districts, ~90,000 children) | 101reporters, 2026-10-13 — https://www.101reporters.com/citizen-journalism/lost-in-translation-tribal-students-in-odisha-grapple-with-classroom-language-barriers | **Verified** | Sibam |
| **C4** | 24 languages, primers for 21 | The Hindu, 2017-09-10 — https://www.thehindu.com/news/national/other-states/odisha-to-introduce-21-tribal-languages-as-medium-of-instruction/article19738430.ece | **Verified** | Sibam |
| **C5** | Kui is an MLE language | NCERT journal review URL — to be confirmed | **Open** *(URL to be confirmed tomorrow)* | Sibam |
| **C6** | Competitor cells (each) | DIKSHA: https://diksha.gov.in/ (2026-10-13) | ThinkZone: https://www.thinkzone.in/ (2026-10-13) | Madhu: Open — Play Store URL to be verified | OKCL: https://lc.okcl.co.in/ (2026-10-13) | **Verified** *(partial; Madhu pending)* | Sibam |
| **C7** | Textbook chapter number and term list | Photo file names | Assigned to Pritam | Pritam |
| **C8** | Odia TTS works / quality reviewed | Test notes + reviewer | Assigned to Pritam | Pritam |
| **C9** | 0/6 Kui audio clips verified; Fallback label enforced: "Kui starter glossary — text-only in Odia script; native audio pending validation" | Review log + content/kui_slide_label.md | **Verified** *(Option A: honest fallback)* | Pritam |
| **C10** | Offline loop and fresh-install run | Browser test on `dist-final` (screenshots + log) — offline MCQ + toggle + trace worked | **Measured** | Satya |
| **C11** | Sync integrity (0 lost, 0 duplicated, 0 gaps) | K5 SQL output (Option B: Demo deferred; Pilot target) | **Open** *(Demo: not claimed / Pilot: target)* | Sibam |
| **C12** | Grounding results k/20 | K6 script output | Assigned to Pritam | Pritam |
| **C13** | Simulated decision reliability | `eval/sim/report.md` output matches PRD §4.8 within ±1pp | **Measured** | Sibam |
| **C14** | Cold start, battery, devices tested | §3.8 table | Assigned to Satya | Satya |
| **C15** | Injection tests [k] strings, results | S1 test record | **Open** | Sibam |
| **C16** | Unit cost per student-month | Dated pricing pages + event-log count | **Open** | Sibam |
| **C17** | User quotes and conversation dates | Notes with consent | Assigned to all | all |
| **C18** | Mid-eval feedback → changes | Original notes | **Open** | Sibam |
