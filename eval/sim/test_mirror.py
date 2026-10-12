"""
Unit tests for Python mirror against /shared/ probe and BKT vectors.
"""

import json
from pathlib import Path
import pytest
from mirror import (
    candidate_of,
    resolve,
    final_label,
    probe_order,
    update_concept_mastery,
    update_term_mastery,
)

SHARED_DIR = Path(__file__).resolve().parent.parent.parent / "shared"


@pytest.fixture
def probe_vectors():
    with open(SHARED_DIR / "probe_vectors.json", "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def bkt_vectors():
    with open(SHARED_DIR / "bkt_vectors.json", "r", encoding="utf-8") as f:
        return json.load(f)


def test_patterns_to_candidate(probe_vectors):
    for item in probe_vectors["patterns_to_candidate"]:
        got = candidate_of(item["pattern"])
        assert got == item["candidate"], f"Failed on pattern {item['pattern']}"


def test_candidate_confirmation_to_label(probe_vectors):
    for item in probe_vectors["candidate_confirmation_to_label"]:
        got = resolve(item["candidate"], item["confirm_passed"])
        assert (
            got == item["expected_label"]
        ), f"Failed on candidate {item['candidate']} confirm {item['confirm_passed']}"


def test_null_audio_cases(probe_vectors):
    for item in probe_vectors["null_audio_cases"]:
        got = candidate_of(item["pattern"])
        assert got == "INCONSISTENT", f"Failed on null audio pattern {item['pattern']}"


def test_final_label_sequences(probe_vectors):
    for item in probe_vectors["final_label_sequences"]:
        got = final_label(item["sets"], item["threshold"])
        assert got["done"] == item["expected"]["done"], f"Failed on sets {item['sets']}"
        if got["done"]:
            assert got["label"] == item["expected"]["label"]
            assert got["status"] == item["expected"]["status"]
            assert got["agreement"] == item["expected"]["agreement"]


def test_seeded_orders(probe_vectors):
    for item in probe_vectors["seeded_orders"]:
        got = probe_order(item["seed"])
        assert got == item["order"], f"Failed on seed {item['seed']}"


def test_bkt_vectors(bkt_vectors):
    tol = bkt_vectors["parameters"]["tolerance"]
    for vec in bkt_vectors["vectors"]:
        curr = vec["start"]
        is_term = vec["model_type"] == "term"
        update_fn = update_term_mastery if is_term else update_concept_mastery

        for step in vec["steps"]:
            curr = update_fn(curr, step["correct"])
            exp = step["expected_rounded"]
            diff = abs(curr - exp)
            assert (
                diff <= tol
            ), f"Vector {vec['id']} step {step} expected {exp}, got {curr}, diff {diff}"
