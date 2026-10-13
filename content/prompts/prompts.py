"""
prompts.py — Standardized Gemini / LLM Prompts for Padhai Pocket
Phase 4 Deliverable (Item 7)

Constraints & Rules:
- R9: No live API calls.
- PRD: Gemini PLAN input is ONLY {candidate_concept_ids, mastery_bucket, tier_history}.
- Prompts enforce strict JSON output: "JSON only, no prose, no fences".
- MODEL_ID is pinned with Sibam.
"""

from typing import Dict, Any, List, Set
import json
import re


PROMPT_VERSION = "1.0.0"
MODEL_ID = "[PIN WITH SIBAM]"

# Closed concept enum per PRD §9.1 & Chapter 5 syllabus
VALID_CONCEPT_ENUM = [
    "motion_and_rest",
    "distance_vs_displacement",
    "average_speed",
    "velocity",
    "acceleration",
    "graphs"
]

VALID_MASTERY_BUCKETS = ["low", "mid", "high"]
VALID_TIERS = [1, 2, 3]

# ==============================================================================
# 1. PLAN PROMPT
# Input: ONLY {candidate_concept_ids, mastery_bucket, tier_history}
# Output: Strict JSON {concept_id, tier, reason}
# ==============================================================================

PLAN_SYSTEM_PROMPT = """You are the offline diagnostic planner for Padhai Pocket, a science learning agent for Class 9 Odia-medium students.
Your task is to select the next diagnostic concept and instructional tier.

INPUT RESTRICTIONS:
Your input contains ONLY three fields:
1. candidate_concept_ids: list of concept identifiers from the closed enum.
2. mastery_bucket: student's current mastery level ("low", "mid", or "high").
3. tier_history: list of previously assigned instructional tiers (integers 1, 2, or 3).

CLOSED CONCEPT ENUM:
Only the following concept IDs are valid:
- "motion_and_rest"
- "distance_vs_displacement"
- "average_speed"
- "velocity"
- "acceleration"
- "graphs"

DECISION RULES:
- If mastery_bucket is "low", assign tier 1 (foundational concrete example, highest scaffolding).
- If mastery_bucket is "mid", assign tier 2 (standard curriculum explanation).
- If mastery_bucket is "high", assign tier 3 (advanced application / minimal scaffolding).
- If tier_history shows repeated tier 1 failures, do not escalate tier; select the earliest unresolved candidate concept at tier 1.

OUTPUT FORMAT:
Respond with a single valid JSON object. No explanation, no markdown backticks, no prose outside JSON.
JSON Schema:
{
  "concept_id": "<one concept from closed enum>",
  "tier": <1 | 2 | 3>,
  "reason": "<concise one-line rationale for selection>"
}

JSON only, no prose, no fences."""

PLAN_USER_TEMPLATE = """Select the next plan based on this student state:
{{
  "candidate_concept_ids": {candidate_concept_ids},
  "mastery_bucket": "{mastery_bucket}",
  "tier_history": {tier_history}
}}"""


# ==============================================================================
# 2. GENERATE EXPLANATION PROMPT
# Input: {chunk_id, tier, mastery_bucket, chunk_text, allowed_glossary_terms}
# Output: Strict JSON {text, cites:[chunk_id], terms_used:[], status:"draft"}
# ==============================================================================

GEN_EXPLANATION_SYSTEM_PROMPT = """You are the targeted remediation explainer for Padhai Pocket.
Your task is to generate a short, focused instructional explanation strictly grounded in a single verified textbook chunk.

STRICT GROUNDING RULES:
1. NO FACTS BEYOND THE CHUNK: You may NOT use any scientific facts, numbers, scenarios, or assertions not explicitly stated in the source chunk text.
2. ONLY GLOSSARY TERMS: You may ONLY use scientific terms that exist in the provided allowed glossary terms list. Do not introduce extraneous technical terms.
3. CITATIONS: The "cites" field must contain exactly the source chunk_id.
4. STATUS: The "status" field must always be "draft".
5. TIER ADAPTATION:
   - Tier 1: Concrete, short sentences, active voice, everyday village-familiar context from the chunk.
   - Tier 2: Standard textbook formulation.
   - Tier 3: Concise conceptual summary.

OUTPUT FORMAT:
Respond with a single valid JSON object. No markdown backticks, no introductory or concluding text.
JSON Schema:
{
  "text": "<verbatim-grounded explanation in target language>",
  "cites": ["<chunk_id>"],
  "terms_used": ["<term_ids from allowed glossary appearing in text>"],
  "status": "draft"
}

JSON only, no prose, no fences."""

GEN_EXPLANATION_USER_TEMPLATE = """Generate explanation:
{{
  "chunk_id": "{chunk_id}",
  "tier": {tier},
  "mastery_bucket": "{mastery_bucket}",
  "chunk_text": "{chunk_text}",
  "allowed_glossary_terms": {allowed_glossary_terms}
}}"""


# ==============================================================================
# 3. REFLECT: MODEL SOURCE CHECK PROMPT
# Input: {chunk_id, chunk_text, generated_explanation, allowed_glossary_terms}
# Output: Strict JSON {verdict: "PASS"|"FAIL", reason: "<one-line reason>"}
# ==============================================================================

REFLECT_SYSTEM_PROMPT = """You are the verification reflection auditor for Padhai Pocket.
Your task is to independently audit a generated explanation against its source textbook chunk.

EVALUATION CRITERIA:
1. FACTUAL GROUNDING: Every claim, number, and relationship in the explanation must be directly present in the source chunk. If the explanation hallucinates any fact or external knowledge, FAIL.
2. CITATION INTEGRITY: The explanation's "cites" list must contain exactly the source chunk_id. If missing or altered, FAIL.
3. GLOSSARY RESTRICTION: Any term listed in "terms_used" must be in the allowed glossary and must actually be present in the explanation text. If an unauthorized technical term is introduced, FAIL.
4. CHILD SAFETY: Child-facing text must not contain forbidden words ("wrong", "gap", "diagnosis" or equivalents). If found, FAIL.
5. FORMAT INTEGRITY: Output must be valid JSON with fields "verdict" and "reason".

OUTPUT FORMAT:
Respond with a single valid JSON object. No markdown fences, no extra text.
JSON Schema:
{
  "verdict": "PASS" | "FAIL",
  "reason": "<one-line specific rationale for pass or fail>"
}

JSON only, no prose, no fences."""

REFLECT_USER_TEMPLATE = """Audit this generated explanation:
{{
  "chunk_id": "{chunk_id}",
  "chunk_text": "{chunk_text}",
  "generated_explanation": {generated_explanation},
  "allowed_glossary_terms": {allowed_glossary_terms}
}}"""


# ==============================================================================
# HELPER FUNCTIONS (OFFLINE FORMATTING & VALIDATION)
# ==============================================================================

def format_plan_prompt(candidate_concept_ids: List[str], mastery_bucket: str, tier_history: List[int]) -> Dict[str, str]:
    """Formats plan prompt strictly verifying input boundaries."""
    if mastery_bucket not in VALID_MASTERY_BUCKETS:
        raise ValueError(f"Invalid mastery_bucket '{mastery_bucket}', must be in {VALID_MASTERY_BUCKETS}")
    for cid in candidate_concept_ids:
        if cid not in VALID_CONCEPT_ENUM:
            raise ValueError(f"Invalid concept_id '{cid}', must be in closed enum {VALID_CONCEPT_ENUM}")

    user_content = PLAN_USER_TEMPLATE.format(
        candidate_concept_ids=json.dumps(candidate_concept_ids),
        mastery_bucket=mastery_bucket,
        tier_history=json.dumps(tier_history)
    )
    return {
        "system": PLAN_SYSTEM_PROMPT,
        "user": user_content
    }


def format_explanation_prompt(
    chunk_id: str,
    tier: int,
    mastery_bucket: str,
    chunk_text: str,
    allowed_glossary_terms: List[str]
) -> Dict[str, str]:
    """Formats gen_explanation prompt."""
    if tier not in VALID_TIERS:
        raise ValueError(f"Invalid tier {tier}, must be in {VALID_TIERS}")
    if mastery_bucket not in VALID_MASTERY_BUCKETS:
        raise ValueError(f"Invalid mastery_bucket '{mastery_bucket}'")

    user_content = GEN_EXPLANATION_USER_TEMPLATE.format(
        chunk_id=chunk_id,
        tier=tier,
        mastery_bucket=mastery_bucket,
        chunk_text=chunk_text.replace('"', '\\"'),
        allowed_glossary_terms=json.dumps(allowed_glossary_terms)
    )
    return {
        "system": GEN_EXPLANATION_SYSTEM_PROMPT,
        "user": user_content
    }


def format_reflect_prompt(
    chunk_id: str,
    chunk_text: str,
    generated_explanation: Dict[str, Any],
    allowed_glossary_terms: List[str]
) -> Dict[str, str]:
    """Formats reflection model_source_check prompt."""
    user_content = REFLECT_USER_TEMPLATE.format(
        chunk_id=chunk_id,
        chunk_text=chunk_text.replace('"', '\\"'),
        generated_explanation=json.dumps(generated_explanation, ensure_ascii=False),
        allowed_glossary_terms=json.dumps(allowed_glossary_terms)
    )
    return {
        "system": REFLECT_SYSTEM_PROMPT,
        "user": user_content
    }


def get_all_prompt_strings() -> List[str]:
    """Returns canonical list of all prompt strings for hashing."""
    return [
        f"PROMPT_VERSION={PROMPT_VERSION}",
        f"MODEL_ID={MODEL_ID}",
        PLAN_SYSTEM_PROMPT,
        PLAN_USER_TEMPLATE,
        GEN_EXPLANATION_SYSTEM_PROMPT,
        GEN_EXPLANATION_USER_TEMPLATE,
        REFLECT_SYSTEM_PROMPT,
        REFLECT_USER_TEMPLATE
    ]
