"""
Prompts and schemas for Gemini PLAN and gen_explanation.
Follows PRD §6.4, §7.1:
- Pinned model ID
- Prompt version hash
- Closed privacy inputs: PLAN receives only candidate_concept_ids, mastery_bucket, tier_history.
  NO profile_id, NO device_id, NO names, NO transcripts.
"""

import hashlib
from typing import Dict, Any, List

PINNED_MODEL_ID = "gemini-1.5-flash-002"
PROMPT_VERSION = "v1.0.0"

PLAN_SYSTEM_PROMPT = """You are a pedagogical planner for Class 9 science in Odisha.
Given candidate concept IDs, the learner's current mastery bucket, and past tier history,
pick the next concept_id, remediation tier (1 or 2), and a short reason.
Output strictly JSON in this schema:
{
  "concept_id": "<string>",
  "tier": 1 | 2,
  "reason": "<short pedagogical rationale>"
}
Do not output markdown code blocks. Output plain JSON only."""

EXPLANATION_SYSTEM_PROMPT = """You are generating a simpler explanation in Odia for Class 9 students.
You must cite a chunk_id from the approved textbook content pack.
Output strictly JSON in this schema:
{
  "chunk_id": "<valid chunk_id e.g. BSE9-PHYS-MOTION-S02>",
  "explanation_text": "<clear Odia explanation>",
  "glossary_terms": ["<term1>", "<term2>"]
}
Do not output markdown code blocks. Output plain JSON only."""


def get_prompt_version_hash(prompt_text: str) -> str:
    h = hashlib.sha256(f"{PROMPT_VERSION}:{prompt_text}".encode("utf-8")).hexdigest()
    return h[:12]


PLAN_PROMPT_HASH = get_prompt_version_hash(PLAN_SYSTEM_PROMPT)
EXPLANATION_PROMPT_HASH = get_prompt_version_hash(EXPLANATION_SYSTEM_PROMPT)


def build_plan_input(
    candidate_concept_ids: List[str],
    mastery_bucket: str,
    tier_history: List[int],
) -> Dict[str, Any]:
    """
    Constructs privacy-preserving PLAN input payload.
    NO profile_id, NO device_id, NO names, NO transcripts.
    """
    return {
        "candidate_concept_ids": list(candidate_concept_ids),
        "mastery_bucket": mastery_bucket,
        "tier_history": list(tier_history),
    }
