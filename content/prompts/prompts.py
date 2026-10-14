"""
Padhai Pocket — Gemini Prompts, Version Hashing & Intent Mapping Specification.
PRD v4.0 §6.4, §6.5, §6.8 and FR-13, FR-16, FR-26.

Designed for drop-in compatibility with /backend/graph/prompts.py.
"""

import hashlib
import re
from typing import Dict, Any, List, Optional, Tuple

# Pinned model ID and prompt semantic version
MODEL_ID = "gemini-1.5-flash-002"
PINNED_MODEL_ID = MODEL_ID
PROMPT_VERSION = "1.0.0"

# Closed enumeration boundaries
ALLOWED_CONCEPT_IDS = (
    "distance_vs_displacement",
    "mass_vs_weight",
)

ALLOWED_INTENTS = (
    "TEACH_CONCEPT",
    "REPEAT",
    "HELP",
    "UNKNOWN",
)

BANNED_CHILD_FACING_WORDS = (
    "wrong",
    "gap",
    "diagnosis",
    "ଭୁଲ",
    "ତ୍ରୁଟି",
    "ଅଭାବ",
    "ରୋଗ ନିର୍ଣ୍ଣୟ",
)

# -----------------------------------------------------------------------------
# a) PLAN_PROMPT (PRD §6.8 Data Minimisation & Closed-Set Constraints)
# -----------------------------------------------------------------------------
PLAN_PROMPT = """You are a pedagogical planner for Class 9 science in Odisha (Padhai Pocket).
Given candidate concept IDs, the learner's current mastery bucket, and past tier history, select the next concept_id, remediation tier (1, 2, or 3), and a concise pedagogical reason.

DATA MINIMISATION RULES (PRD §6.8):
- Input contains ONLY candidate_concept_ids, mastery_bucket, and tier_history.
- NEVER request, accept, or process profile_id, device_id, student names, or student voice transcripts.

CLOSED-SET CONSTRAINTS:
- concept_id MUST be one of: "distance_vs_displacement", "mass_vs_weight".
- tier MUST be an integer in: 1, 2, 3.

OUTPUT FORMAT:
Output strict, valid JSON only. Do not include markdown formatting, code fences (e.g. ```json), or explanatory prose.
{
  "concept_id": "<concept_id>",
  "tier": 1,
  "reason": "<one-line pedagogical rationale>"
}"""

# Alias for backward compatibility with existing backend/graph/prompts.py
PLAN_SYSTEM_PROMPT = PLAN_PROMPT

# -----------------------------------------------------------------------------
# b) GEN_EXPLANATION_PROMPT (PRD §6.4, §6.5 Grounding & Child Safety)
# -----------------------------------------------------------------------------
GEN_EXPLANATION_PROMPT = """You are generating a simpler pedagogical explanation in Odia for Class 9 secondary students in Odisha (Padhai Pocket).
Input parameters:
- chunk_id: Approved textbook chunk identifier.
- odia_chunk_text: Verified Odia textbook source text.
- tier: Remediation tier level (1, 2, or 3).
- mastery_bucket: Current mastery bucket ("low", "mid", "high").
- allowed_terms: Allowed Odia textbook science glossary terms.

GROUNDING & CHILD-SAFETY RULES (PRD §6.4, §6.5, FR-13, FR-16):
1. GROUNDING: The explanation MUST be grounded strictly in odia_chunk_text. Do not introduce outside physics claims.
2. CITATION: You MUST cite chunk_id in the "cites" array.
3. GLOSSARY: You MUST only use scientific glossary terms present in allowed_terms.
4. CHILD-SAFE COPY: You must NEVER use negative or deficit labels such as "wrong", "gap", "diagnosis", "ଭୁଲ", "ତ୍ରୁଟି", or "ଅଭାବ". Keep language affirmative, encouraging, and focused on conceptual inquiry.
5. GOVERNANCE STATUS: Output status must ALWAYS be "draft" pending native speaker review (FR-27).

OUTPUT FORMAT:
Output strict, valid JSON only. Do not include markdown code fences or explanatory prose.
{
  "text": "<simple affirmative Odia explanation>",
  "cites": ["<chunk_id>"],
  "terms_used": ["<term1>", "<term2>"],
  "status": "draft"
}"""

# Alias for backward compatibility
EXPLANATION_SYSTEM_PROMPT = GEN_EXPLANATION_PROMPT

# -----------------------------------------------------------------------------
# c) REFLECT_MODEL_SOURCE_CHECK_PROMPT (PRD §6.5, FR-7)
# -----------------------------------------------------------------------------
REFLECT_MODEL_SOURCE_CHECK_PROMPT = """You are an independent factual verifier evaluating a generated Odia physics explanation for Class 9 students (Padhai Pocket REFLECT pipeline).
Input parameters:
- chunk_id: Approved textbook chunk identifier.
- odia_chunk_text: Source textbook excerpt in Odia.
- generated_explanation: Proposed student explanation in Odia.
- allowed_terms: List of authorized Odia scientific terms.

VERIFICATION RULES (PRD §6.5, FR-7):
1. Check whether EVERY factual statement in generated_explanation is directly supported by odia_chunk_text.
2. Check whether all specialized physics terms in generated_explanation belong to allowed_terms.
3. If unsupported statements, hallucinated facts, or unauthorized terms appear, return FAIL. Otherwise return PASS.

OUTPUT FORMAT:
Output strict, valid JSON only. Do not include markdown code fences or explanatory prose.
{
  "model_source_check": "PASS",
  "reason": "<concise one-line verification summary>"
}"""

# -----------------------------------------------------------------------------
# e) get_prompt_version_hash() (PRD §6.8 Plan Event Audit Logging)
# -----------------------------------------------------------------------------
def get_prompt_version_hash(prompt_text: Optional[str] = None) -> str:
    """
    Computes the first 12 hex characters of SHA-256 hash.
    When called without arguments: hashes concatenated PROMPT_VERSION + PLAN_PROMPT +
    GEN_EXPLANATION_PROMPT + REFLECT_MODEL_SOURCE_CHECK_PROMPT per Item 7.1.e.
    When called with a prompt_text string: hashes f"{PROMPT_VERSION}:{prompt_text}"
    for backward compatibility with existing backend/graph/prompts.py.
    """
    if prompt_text is not None:
        content = f"{PROMPT_VERSION}:{prompt_text}"
    else:
        content = (
            f"{PROMPT_VERSION}"
            f"{PLAN_PROMPT}"
            f"{GEN_EXPLANATION_PROMPT}"
            f"{REFLECT_MODEL_SOURCE_CHECK_PROMPT}"
        )
    return hashlib.sha256(content.encode("utf-8")).hexdigest()[:12]


PLAN_PROMPT_HASH = get_prompt_version_hash(PLAN_PROMPT)
EXPLANATION_PROMPT_HASH = get_prompt_version_hash(GEN_EXPLANATION_PROMPT)
PROMPT_SUITE_HASH = get_prompt_version_hash()

# -----------------------------------------------------------------------------
# d) INTENT_MAPPER_SPEC & map_closed_intent() (FR-26 Closed Student Channel)
# -----------------------------------------------------------------------------
INTENT_MAPPER_SPEC = {
    "description": (
        "Deterministic rule-based intent mapper that projects raw student voice/text "
        "utterances onto a closed enum {TEACH_CONCEPT, REPEAT, HELP, UNKNOWN}. "
        "Raw text is strictly discarded and NEVER forwarded into an LLM prompt (FR-26)."
    ),
    "allowed_intents": ALLOWED_INTENTS,
    "allowed_concept_ids": ALLOWED_CONCEPT_IDS,
}

# Known injection and prompt leakage triggers (English & Odia)
INJECTION_KEYWORDS = [
    r"ignore.*(?:instructions|rules|prompt)",
    r"system\s*prompt",
    r"api\s*key",
    r"developer",
    r"politics",
    r"jailbreak",
    r"developer\s*mode",
    r"print.*key",
    r"reveal.*instructions",
    r"ନିୟମ\s*ଭୁଲି",
    r"ନିର୍ଦ୍ଦେଶ\s*ଭୁଲି",
    r"ସିଷ୍ଟମ୍\s*ପ୍ରମ୍ପ୍ଟ",
    r"ଗୁପ୍ତ\s*ଚାବି",
]

REPEAT_KEYWORDS = [
    "repeat",
    "again",
    "say again",
    "one more time",
    "pardon",
    "ଆଉଥରେ",
    "ପୁଣି କୁହ",
    "ଆଉ ଥରେ",
    "ଦୋହରାନ୍ତୁ",
]

HELP_KEYWORDS = [
    "help",
    "assist",
    "i don't understand",
    "explain",
    "confused",
    "ସାହାଯ୍ୟ",
    "ମଦତ",
    "ବୁଝିପାରୁନି",
    "ବୁଝାଇ ଦିଅନ୍ତୁ",
    "ସାହାଯ୍ୟ କର",
]

CONCEPT_KEYWORDS: Dict[str, List[str]] = {
    "distance_vs_displacement": [
        "distance",
        "displacement",
        "ଦୂରତା",
        "ବିସ୍ଥାପନ",
    ],
    "mass_vs_weight": [
        "mass",
        "weight",
        "ବସ୍ତୁତ୍ୱ",
        "ଓଜନ",
    ],
}


def map_closed_intent(raw_text: str) -> str:
    """
    Deterministic rule fallback mapper (FR-26).
    Maps Odia and English student utterances strictly to the closed enum:
      - 'TEACH_CONCEPT' (or 'TEACH_CONCEPT:<concept_id>')
      - 'REPEAT'
      - 'HELP'
      - 'UNKNOWN'

    Discards raw_text immediately. If any injection pattern, adversarial token,
    or unmapped query is detected, safely returns 'UNKNOWN'.
    """
    if not raw_text or not isinstance(raw_text, str):
        return "UNKNOWN"

    normalized = raw_text.strip().lower()

    # 1. Adversarial & Injection Filter: Immediate abstention
    for pat in INJECTION_KEYWORDS:
        if re.search(pat, normalized, re.IGNORECASE):
            return "UNKNOWN"

    # 2. Benign Repeat Keywords
    for kw in REPEAT_KEYWORDS:
        if kw in normalized:
            return "REPEAT"

    # 3. Benign Help Keywords
    for kw in HELP_KEYWORDS:
        if kw in normalized:
            return "HELP"

    # 4. Closed Concept Queries
    for concept_id, keywords in CONCEPT_KEYWORDS.items():
        for kw in keywords:
            if kw in normalized:
                return f"TEACH_CONCEPT:{concept_id}"

    # 5. Default Fallback
    return "UNKNOWN"


def build_plan_input(
    candidate_concept_ids: List[str],
    mastery_bucket: str,
    tier_history: List[int],
) -> Dict[str, Any]:
    """
    Constructs privacy-preserving PLAN input payload conforming to PRD §6.8.
    NO profile_id, NO device_id, NO names, NO voice transcripts.
    """
    # Validation against closed enum
    validated_candidates = [
        cid for cid in candidate_concept_ids if cid in ALLOWED_CONCEPT_IDS
    ]
    return {
        "candidate_concept_ids": validated_candidates,
        "mastery_bucket": mastery_bucket,
        "tier_history": list(tier_history),
    }
