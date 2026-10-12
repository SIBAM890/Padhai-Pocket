"""
Pytest suite for LangGraph graph pipeline:
- Test 1: Valid PLAN -> all four REFLECT checks run.
- Test 2: Invalid PLAN JSON -> falls back to rule planner (planner=rule).
- Test 3: Explanation missing chunk_id -> REFLECT fails chunk_exists.
- Test 4: model_source_check=UNAVAILABLE when offline.
"""

import sys
from pathlib import Path
import pytest

GRAPH_DIR = Path(__file__).resolve().parent.parent / "graph"
sys.path.insert(0, str(GRAPH_DIR))

from graph import run_pipeline, build_plan_input, plan_node, reflect_node, gen_explanation_node


def test_valid_plan_runs_all_four_reflect_checks():
    plan_input = build_plan_input(
        candidate_concept_ids=["distance_vs_displacement"],
        mastery_bucket="low",
        tier_history=[1],
    )
    mock_plan_json = '{"concept_id": "distance_vs_displacement", "tier": 1, "reason": "found gap in probe"}'

    result = run_pipeline(plan_input, is_online=True, mock_llm_plan=mock_plan_json)

    # 1. Planner was gemini
    assert result["plan_result"]["planner_mode"] == "gemini"
    assert result["plan_result"]["plan"]["tier"] == 1

    # 2. Four distinct REFLECT checks run
    checks = result["reflect_result"]["reflect_checks"]
    assert "chunk_exists" in checks
    assert "glossary_terms" in checks
    assert "readability" in checks
    assert "model_source_check" in checks

    assert checks["chunk_exists"] == "PASS"
    assert checks["glossary_terms"] == "PASS"
    assert checks["readability"] == "PASS"
    assert checks["model_source_check"] == "PASS"

    # 3. ACT delivers explanation
    assert result["act_result"]["action"] == "DELIVER_TIER_1_EXPLANATION"


def test_invalid_plan_json_falls_back_to_rule_planner():
    plan_input = build_plan_input(
        candidate_concept_ids=["distance_vs_displacement"],
        mastery_bucket="low",
        tier_history=[],
    )
    # Malformed / non-JSON response from LLM
    invalid_plan_json = "I think we should teach distance and displacement tier 1."

    result = run_pipeline(plan_input, is_online=True, mock_llm_plan=invalid_plan_json)

    # Must log planner=rule and still complete safely
    plan_event = result["plan_result"]["event"]
    assert result["plan_result"]["planner_mode"] == "rule"
    assert plan_event["planner"] == "rule"
    assert result["plan_result"]["plan"]["concept_id"] == "distance_vs_displacement"
    assert result["plan_result"]["plan"]["tier"] == 1


def test_explanation_missing_chunk_id_fails_reflect_chunk_exists():
    plan_input = build_plan_input(
        candidate_concept_ids=["distance_vs_displacement"],
        mastery_bucket="low",
        tier_history=[1],
    )
    # Explanation missing or citing non-existent chunk
    bad_explanation = {
        "chunk_id": "NON_EXISTENT_CHUNK_999",
        "explanation_text": "ବସ୍ତୁର ସ୍ଥାନ ପରିବର୍ତ୍ତନ ହେଉଛି ବିସ୍ଥାପନ।",
        "glossary_terms": ["T_DISP"],
    }

    result = run_pipeline(
        plan_input,
        is_online=True,
        mock_explanation=bad_explanation,
    )

    checks = result["reflect_result"]["reflect_checks"]
    assert checks["chunk_exists"] == "FAIL"

    # Because chunk_exists failed, ACT triggers fallback
    assert result["act_result"]["action"] == "FALLBACK_CACHED_TIER_1"


def test_model_source_check_unavailable_when_offline():
    plan_input = build_plan_input(
        candidate_concept_ids=["distance_vs_displacement"],
        mastery_bucket="low",
        tier_history=[],
    )

    # Run pipeline with is_online=False
    result = run_pipeline(plan_input, is_online=False)

    checks = result["reflect_result"]["reflect_checks"]
    assert checks["model_source_check"] == "UNAVAILABLE"
    assert checks["chunk_exists"] == "PASS"
    assert checks["glossary_terms"] == "PASS"
    assert checks["readability"] == "PASS"

    # Offline automatically used rule planner
    assert result["plan_result"]["planner_mode"] == "rule"
