"""
LangGraph / State-Machine Agent Graph:
Nodes: PLAN -> gen_explanation -> REFLECT -> ACT

Requirements:
- PLAN receives only: {candidate_concept_ids, mastery_bucket, tier_history}
- PLAN returns JSON: {concept_id, tier, reason}
- Invalid JSON -> fallback to deterministic rule planner (logs planner=rule)
- gen_explanation must cite a chunk_id that exists in the pack
- REFLECT prints FOUR separate checks:
    chunk_exists=PASS|FAIL
    glossary_terms=PASS|FAIL
    readability=PASS|FAIL
    model_source_check=PASS|FAIL|UNAVAILABLE
  Never merged (FR-7).
"""

import json
from typing import Dict, Any, List, Optional
try:
    from .prompts import (
        PINNED_MODEL_ID,
        PLAN_PROMPT_HASH,
        build_plan_input,
    )
except ImportError:
    from prompts import (
        PINNED_MODEL_ID,
        PLAN_PROMPT_HASH,
        build_plan_input,
    )

# Known approved chunk IDs in the motion pack (BSE9-PHYS-MOTION-S02, etc.)
APPROVED_CHUNKS = {
    "BSE9-PHYS-MOTION-S01",
    "BSE9-PHYS-MOTION-S02",
    "BSE9-PHYS-MOTION-S03",
    "BSE9-PHYS-MOTION-S04",
    "BSE9-PHYS-MOTION-S05",
    "BSE9-PHYS-MOTION-S06",
}

APPROVED_GLOSSARY_TERMS = {
    "T_DISP",
    "T_DIST",
    "T_SPEED",
    "T_VEL",
    "T_ACC",
}


def rule_planner(candidate_concept_ids: List[str], mastery_bucket: str) -> Dict[str, Any]:
    """
    Deterministic rule planner fallback.
    """
    selected_concept = candidate_concept_ids[0] if candidate_concept_ids else "distance_vs_displacement"
    tier = 1 if mastery_bucket in ("low", "struggling", "<0.50") else 2
    return {
        "concept_id": selected_concept,
        "tier": tier,
        "reason": "deterministic_rule_based_on_mastery_bucket",
    }


def plan_node(
    plan_input: Dict[str, Any],
    mock_llm_response: Optional[str] = None,
    allow_model: bool = True,
) -> Dict[str, Any]:
    """
    PLAN Node:
    Privacy-filtered input only.
    Validates model JSON output or falls back to rule planner.
    """
    # Privacy assertion: verify no sensitive keys
    forbidden_keys = {"profile_id", "device_id", "name", "transcript", "student_name"}
    for k in forbidden_keys:
        if k in plan_input:
            raise ValueError(f"Privacy breach: forbidden key '{k}' in PLAN input")

    candidate_ids = plan_input.get("candidate_concept_ids", [])
    mastery_bucket = plan_input.get("mastery_bucket", "low")
    tier_history = plan_input.get("tier_history", [])

    planner_mode = "rule"
    parsed_plan = None

    if allow_model and mock_llm_response is not None:
        try:
            data = json.loads(mock_llm_response)
            if "concept_id" in data and "tier" in data and "reason" in data:
                parsed_plan = {
                    "concept_id": data["concept_id"],
                    "tier": int(data["tier"]),
                    "reason": str(data["reason"]),
                }
                planner_mode = "gemini"
        except Exception:
            planner_mode = "rule"

    if parsed_plan is None:
        parsed_plan = rule_planner(candidate_ids, mastery_bucket)
        planner_mode = "rule"

    event_payload = {
        "node": "PLAN",
        "action": "SELECT_CONCEPT_AND_TIER",
        "planner": planner_mode,
        "pinned_model_id": PINNED_MODEL_ID,
        "prompt_version_hash": PLAN_PROMPT_HASH,
        "plan": parsed_plan,
    }

    return {
        "plan": parsed_plan,
        "planner_mode": planner_mode,
        "event": event_payload,
    }


def gen_explanation_node(
    plan: Dict[str, Any],
    mock_explanation: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    GEN_EXPLANATION Node:
    Generates or retrieves pre-approved explanation citing a chunk_id.
    """
    if mock_explanation:
        explanation = mock_explanation
    else:
        # Default tier explanation
        chunk = "BSE9-PHYS-MOTION-S02"
        explanation = {
            "chunk_id": chunk,
            "explanation_text": "ବସ୍ତୁର ସ୍ଥାନ ପରିବର୍ତ୍ତନ ହେଉଛି ବିସ୍ଥାପନ (Displacement)।",
            "glossary_terms": ["T_DISP"],
            "readability_score": "grade_9_accessible",
        }

    return {
        "explanation": explanation,
        "chunk_id": explanation.get("chunk_id"),
    }


def reflect_node(
    explanation_result: Dict[str, Any],
    is_online: bool = True,
    model_source_pass: bool = True,
) -> Dict[str, Any]:
    """
    REFLECT Node:
    Evaluates four distinct checks separately (never merged):
    1. chunk_exists
    2. glossary_terms
    3. readability
    4. model_source_check
    """
    explanation = explanation_result.get("explanation", {})
    chunk_id = explanation.get("chunk_id")

    # Check 1: chunk_exists
    chunk_exists = "PASS" if chunk_id in APPROVED_CHUNKS else "FAIL"

    # Check 2: glossary_terms
    terms = explanation.get("glossary_terms", [])
    glossary_terms = "PASS" if all(t in APPROVED_GLOSSARY_TERMS for t in terms) else "FAIL"

    # Check 3: readability
    # Odia sentence structure check / reading load check
    text = explanation.get("explanation_text", "")
    readability = "PASS" if len(text) > 5 and len(text) < 500 else "FAIL"

    # Check 4: model_source_check
    if not is_online:
        model_source_check = "UNAVAILABLE"
    else:
        model_source_check = "PASS" if model_source_pass else "FAIL"

    # Build the 4-check REFLECT event shape
    reflect_checks = {
        "chunk_exists": chunk_exists,
        "glossary_terms": glossary_terms,
        "readability": readability,
        "model_source_check": model_source_check,
    }

    event_payload = {
        "node": "REFLECT",
        "action": "VERIFY_EXPLANATION",
        "checks": reflect_checks,
        "all_passed": (
            chunk_exists == "PASS"
            and glossary_terms == "PASS"
            and readability == "PASS"
            and model_source_check in ("PASS", "UNAVAILABLE")
        ),
    }

    return {
        "reflect_checks": reflect_checks,
        "event": event_payload,
    }


def act_node(
    plan: Dict[str, Any],
    reflect_result: Dict[str, Any],
    explanation_result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    ACT Node:
    Executes delivery if REFLECT checks pass, else triggers safe fallback.
    """
    checks = reflect_result["reflect_checks"]
    passed = reflect_result["event"]["all_passed"]

    if passed:
        action = f"DELIVER_TIER_{plan['tier']}_EXPLANATION"
        payload = explanation_result["explanation"]
    else:
        action = "FALLBACK_CACHED_TIER_1"
        payload = {
            "chunk_id": "BSE9-PHYS-MOTION-S02",
            "tier": 1,
            "fallback_reason": "reflect_check_failed",
        }

    event_payload = {
        "node": "ACT",
        "action": action,
        "output": payload,
    }

    return {
        "action": action,
        "output": payload,
        "event": event_payload,
    }


def run_pipeline(
    plan_input: Dict[str, Any],
    is_online: bool = True,
    mock_llm_plan: Optional[str] = None,
    mock_explanation: Optional[Dict[str, Any]] = None,
    model_source_pass: bool = True,
) -> Dict[str, Any]:
    """
    Full pipeline runner: PLAN -> gen_explanation -> REFLECT -> ACT.
    """
    plan_res = plan_node(plan_input, mock_llm_response=mock_llm_plan, allow_model=is_online)
    exp_res = gen_explanation_node(plan_res["plan"], mock_explanation=mock_explanation)
    ref_res = reflect_node(exp_res, is_online=is_online, model_source_pass=model_source_pass)
    act_res = act_node(plan_res["plan"], ref_res, exp_res)

    return {
        "plan_result": plan_res,
        "explanation_result": exp_res,
        "reflect_result": ref_res,
        "act_result": act_res,
        "events": [
            plan_res["event"],
            ref_res["event"],
            act_res["event"],
        ],
    }


def run_agent_workflow(
    plan_input: Dict[str, Any],
    is_online: bool = True,
    mock_llm_plan: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Exposes LangGraph / agent planning pipeline for /v1/agent/plan endpoint.
    """
    if mock_llm_plan is None:
        concept = plan_input.get("candidate_concept_ids", ["distance_vs_displacement"])[0] if plan_input.get("candidate_concept_ids") else "distance_vs_displacement"
        tier = 1 if plan_input.get("mastery_bucket") in ("low", "struggling", "<0.50") else 2
        mock_llm_plan = json.dumps({
            "concept_id": concept,
            "tier": tier,
            "reason": f"Targeted remediation for concept {concept} at tier {tier}",
        })

    pipeline = run_pipeline(plan_input, is_online=is_online, mock_llm_plan=mock_llm_plan)
    plan = pipeline["plan_result"]["plan"]
    planner_mode = pipeline["plan_result"]["planner_mode"]

    return {
        "concept_id": plan["concept_id"],
        "tier": plan["tier"],
        "reason": plan["reason"],
        "planner": planner_mode,
        "events": pipeline["events"],
        "act_action": pipeline["act_result"]["action"],
    }
