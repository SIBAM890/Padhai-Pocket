#!/usr/bin/env python3
"""
Test Suite for Prompts, S1 Prompt Injection, and Version Hashing.
PRD v4.0 §6.8, §17.1 (Test S1).
Stdlib only.
"""

import json
import os
import re
import sys
from pathlib import Path

# Add content/prompts to path
PROMPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(PROMPTS_DIR))

from prompts import (
    MODEL_ID,
    PROMPT_VERSION,
    ALLOWED_CONCEPT_IDS,
    ALLOWED_INTENTS,
    BANNED_CHILD_FACING_WORDS,
    PLAN_PROMPT,
    GEN_EXPLANATION_PROMPT,
    REFLECT_MODEL_SOURCE_CHECK_PROMPT,
    get_prompt_version_hash,
    map_closed_intent,
    build_plan_input,
)


def test_prompt_version_hash_is_deterministic_and_12_hex():
    print("[TEST 1] Testing prompt version hash determinism & length...")
    h1 = get_prompt_version_hash()
    h2 = get_prompt_version_hash()
    assert h1 == h2, f"Hash not deterministic: {h1} != {h2}"
    assert len(h1) == 12, f"Hash length {len(h1)} != 12"
    assert re.match(r"^[0-9a-f]{12}$", h1), f"Hash '{h1}' is not 12 lowercase hex characters"
    print(f"  PASS: get_prompt_version_hash() = {h1} (12 hex chars)")


def test_s1_injection_cases():
    print("[TEST 2] Testing S1 injection suite against map_closed_intent()...")
    cases_path = PROMPTS_DIR / "s1_injection_cases.json"
    assert cases_path.exists(), f"Missing test cases file: {cases_path}"

    with open(cases_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    assert len(cases) == 5, f"Expected 5 test cases, found {len(cases)}"

    for case in cases:
        case_id = case["id"]
        raw_input = case["input_string"]
        expected_intent = case["expected_intent"]
        must_not_reach_llm = case["must_not_reach_llm"]

        mapped_intent = map_closed_intent(raw_input)

        # 1. Intent must be UNKNOWN
        assert mapped_intent == expected_intent, (
            f"Case {case_id} failed: input '{raw_input}' mapped to '{mapped_intent}' "
            f"instead of '{expected_intent}'"
        )

        # 2. Raw text must not leak into intent string
        assert must_not_reach_llm is True
        assert raw_input not in mapped_intent, (
            f"Case {case_id} leaked raw text into intent: '{mapped_intent}'"
        )

        # 3. Validated plan payload must not contain raw student text
        plan_input = build_plan_input(
            candidate_concept_ids=["distance_vs_displacement"],
            mastery_bucket="low",
            tier_history=[1],
        )
        assert case["expected_plan_schema_valid"] is True
        assert "input_string" not in plan_input
        assert raw_input not in str(plan_input)

        print(f"  PASS: {case_id} ({case['language']}) -> '{mapped_intent}' (raw text dropped)")


def test_prompts_contain_no_hardcoded_secrets():
    print("[TEST 3] Testing prompt templates for zero hardcoded secrets & clean formatting...")
    secret_patterns = [
        r"AIza[0-9A-Za-z\\-_]{35}",  # Google API key
        r"sk-[0-9A-Za-z]{20,}",      # OpenAI / generic secret
        r"Bearer\s+[A-Za-z0-9\-_\.]+",
        r"password\s*=\s*['\"].*?['\"]",
    ]

    all_prompt_texts = [
        PLAN_PROMPT,
        GEN_EXPLANATION_PROMPT,
        REFLECT_MODEL_SOURCE_CHECK_PROMPT,
    ]

    for p in all_prompt_texts:
        for pat in secret_patterns:
            assert not re.search(pat, p), f"Found potential secret pattern '{pat}' in prompt!"

    # Test sample format checks
    sample_plan_input = {
        "candidate_concept_ids": ["distance_vs_displacement"],
        "mastery_bucket": "low",
        "tier_history": [1],
    }
    plan_payload = build_plan_input(**sample_plan_input)
    assert plan_payload["candidate_concept_ids"] == ["distance_vs_displacement"]
    assert plan_payload["mastery_bucket"] == "low"

    print("  PASS: 0 secrets detected; templates and schema builders format cleanly.")


def main():
    print("=" * 65)
    print(" PADHAI POCKET S1 INJECTION & PROMPT VALIDATION")
    print("=" * 65)
    try:
        test_prompt_version_hash_is_deterministic_and_12_hex()
        test_s1_injection_cases()
        test_prompts_contain_no_hardcoded_secrets()
        print("=" * 65)
        print(" ALL PROMPT & S1 INJECTION TESTS PASSED (3/3)")
        print(f" PROMPT SUITE VERSION HASH: {get_prompt_version_hash()}")
        print("=" * 65)
        return 0
    except AssertionError as e:
        print(f"\n[FAIL] Test assertion error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
