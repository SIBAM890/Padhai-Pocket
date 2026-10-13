# Textbook Transcription Guidelines

This directory holds verbatim text extracted by hand directly from the official BSE Odisha Class 9 Physical Science textbook (`9th_Physical_Science105.pdf`).

Per Hard Rule R2: The AI pipeline NEVER generates, translates, or auto-corrects Odia text. All Odia text must originate from hand-verified transcripts placed in this directory.

---

## Required Files to Create by Hand

### 1. `contents.txt`
Lists the chapter number, section titles in order, and their textbook page numbers.
- **Format**: `chapter_number | section_title | start_page`
- **Example (English placeholders only)**:
```text
CHAPTER_NUM | SECTION_TITLE_TEXT | PAGE_NUM
```

### 2. `terms_odia.txt`
Lists the six canonical core science terms exactly as printed in the textbook, with their English equivalents and source page.
- **Target Term IDs**: `T_DIST`, `T_DISP`, `T_SPEED`, `T_VEL`, `T_ACC`, `T_REST`
- **Format**: `TERM_ID | english | odia_as_printed | page`
- **Example (English placeholders only)**:
```text
TERM_ID | ENGLISH_TERM | ODIA_TERM_AS_PRINTED | PAGE_NUM
```

### 3. `section_S02.txt`
The verbatim text for the hero concept section (Distance vs. Displacement / Section 5.1 & 5.1.1), copied character-for-character from the textbook with explicit page markers.
- **Format**: Verbatim text including page markers `[p.NN]`.
- **Example (English placeholders only)**:
```text
[p.57] SECTION_HEADING ... [p.58] VERBATIM_PARAGRAPH_TEXT ...
```
