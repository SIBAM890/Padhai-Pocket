"""
PRD Appendix D Reference Simulation
Tests the decision logic (§4.4–4.5) under assumed noise on synthetic personas.
20,000 runs per persona per setting.
"""

import sys
import random
import numpy as np
from typing import Dict, Any, Tuple, List
from mirror import candidate_of, resolve, final_label

# Synthetic learner definition
PERSONAS = {
    "concept_gap": {"c": 0, "k": 0, "l": 1, "r": 1, "target": "CONCEPT_GAP"},
    "term_gap": {"c": 1, "k": 0, "l": 1, "r": 1, "target": "TERM_GAP"},
    "reading_gap": {"c": 1, "k": 1, "l": 1, "r": 0, "target": "READING_GAP"},
    "listening_only": {
        "c": 1,
        "k": 1,
        "l": 0,
        "r": 1,
        "target": "INCONSISTENT",
    },
    "listening_reading": {
        "c": 1,
        "k": 1,
        "l": 0,
        "r": 0,
        "target": "INCONSISTENT",
    },
    "mastered": {"c": 1, "k": 1, "l": 1, "r": 1, "target": "RESOLVED"},
}


def can_do_item(modality: str, persona: Dict[str, int]) -> bool:
    c = persona["c"]
    k = persona["k"]
    l = persona["l"]
    r = persona["r"]

    if modality in ("P", "PX"):
        return bool(c)
    elif modality == "A":
        return bool(c and k and l)
    elif modality in ("T", "TX"):
        return bool(c and k and r)
    elif modality == "W":
        return bool(k and (l or r))
    else:
        raise ValueError(f"Unknown modality: {modality}")


def simulate_item(modality: str, persona: Dict[str, int], rng) -> int:
    """
    Pass probability: 0.90 if can do, 0.25 if not (slip 0.10, guess 0.25).
    """
    can_do = can_do_item(modality, persona)
    prob = 0.90 if can_do else 0.25
    return 1 if rng.random() < prob else 0


def run_single_probe_set(
    persona: Dict[str, int],
    confirm_depth: int,
    rng,
) -> Tuple[str, int]:
    """
    Runs one probe set (P, A, T) + targeted confirmation if candidate found.
    Returns (set_label, items_count).
    """
    # 3 items for P, A, T
    p_pass = simulate_item("P", persona, rng)
    a_pass = simulate_item("A", persona, rng)
    t_pass = simulate_item("T", persona, rng)
    items_used = 3

    candidate = candidate_of([p_pass, a_pass, t_pass])

    if candidate == "RESOLVED":
        return "RESOLVED", items_used
    elif candidate == "INCONSISTENT":
        return "INCONSISTENT", items_used

    # Needs targeted confirmation
    confirm_type = "W"
    if candidate == "READING_GAP_CANDIDATE":
        confirm_type = "TX"
    elif candidate == "CONCEPT_GAP_CANDIDATE":
        confirm_type = "PX"

    # All confirm items must pass
    all_confirm_passed = True
    for _ in range(confirm_depth):
        passed = simulate_item(confirm_type, persona, rng)
        items_used += 1
        if not passed:
            all_confirm_passed = False

    set_label = resolve(candidate, all_confirm_passed)
    return set_label, items_used


def simulate_episode(
    persona: Dict[str, int],
    setting: str,
    rng,
) -> Tuple[str, int]:
    """
    Runs an episode in either 'demo' (threshold=1, 1 confirm item, max 1 set)
    or 'production' (threshold=2, 2 confirm items, up to 3 sets).
    Returns (final_label, total_items_used).
    """
    threshold = 1 if setting == "demo" else 2
    confirm_depth = 1 if setting == "demo" else 2
    max_sets = 1 if setting == "demo" else 3

    set_labels: List[str] = []
    total_items = 0

    for _ in range(max_sets):
        s_label, items_used = run_single_probe_set(persona, confirm_depth, rng)
        set_labels.append(s_label)
        total_items += items_used

        verdict = final_label(set_labels, threshold)
        if verdict["done"]:
            return verdict["label"], total_items

    # If completed all sets without done
    verdict = final_label(set_labels, threshold)
    return (
        verdict["label"] if verdict["done"] else "INCONSISTENT",
        total_items,
    )


def simulate_set_consistency(
    persona: Dict[str, int],
    confirm_depth: int,
    runs: int,
    rng,
) -> float:
    """
    Evaluates set-to-set consistency for a clean learner as defined in PRD §4.8:
    (set A label equals set B label, both non-INCONSISTENT) across all runs.
    """
    agreed_non_inconsistent = 0

    for _ in range(runs):
        set_a, _ = run_single_probe_set(persona, confirm_depth, rng)
        set_b, _ = run_single_probe_set(persona, confirm_depth, rng)
        if set_a == set_b and set_a != "INCONSISTENT":
            agreed_non_inconsistent += 1

    return (agreed_non_inconsistent / runs) * 100.0


def run_full_simulation(num_runs: int = 20000, seed: int = 7) -> Dict[str, Any]:
    rng = random.Random(seed)
    results = {}

    for p_name, p_data in PERSONAS.items():
        results[p_name] = {}
        for setting in ["demo", "production"]:
            labels_count = {}
            items_list = []

            for _ in range(num_runs):
                lbl, items = simulate_episode(p_data, setting, rng)
                labels_count[lbl] = labels_count.get(lbl, 0) + 1
                items_list.append(items)

            items_arr = np.array(items_list)
            mean_items = float(np.mean(items_arr))
            p95_items = int(np.percentile(items_arr, 95))

            target = p_data["target"]
            correct_count = labels_count.get(target, 0)
            abstain_count = labels_count.get("INCONSISTENT", 0)

            # Other count = total - correct - abstain
            if target == "INCONSISTENT":
                other_count = num_runs - abstain_count
            else:
                other_count = num_runs - correct_count - abstain_count

            results[p_name][setting] = {
                "correct_pct": (correct_count / num_runs) * 100,
                "abstain_pct": (abstain_count / num_runs) * 100,
                "other_pct": (other_count / num_runs) * 100,
                "mean_items": mean_items,
                "p95_items": p95_items,
                "breakdown": {
                    k: (v / num_runs) * 100 for k, v in labels_count.items()
                },
            }

        # Set-to-set consistency (clean learners)
        consistency = simulate_set_consistency(
            p_data, confirm_depth=2, runs=num_runs, rng=rng
        )
        results[p_name]["consistency_pct"] = consistency

    return results


if __name__ == "__main__":
    runs = 20000
    print(f"Running simulation with {runs} iterations per persona/setting...")
    sim_data = run_full_simulation(num_runs=runs, seed=7)

    print("\n=== FINAL LABEL OUTCOMES ===")
    print(
        f"{'Persona':<18} | {'Setting':<10} | {'Correct %':<9} | {'Abstain %':<9} | {'Other %':<9} | {'Mean (p95)':<12}"
    )
    print("-" * 75)
    for p_name, settings in sim_data.items():
        for s_name in ["demo", "production"]:
            row = settings[s_name]
            print(
                f"{p_name:<18} | {s_name:<10} | {row['correct_pct']:<8.1f}% | {row['abstain_pct']:<8.1f}% | {row['other_pct']:<8.1f}% | {row['mean_items']:.1f} ({row['p95_items']})"
            )

    print("\n=== SET-TO-SET CONSISTENCY (clean learners) ===")
    for p_name, settings in sim_data.items():
        print(f"{p_name:<18}: {settings['consistency_pct']:.1f}%")
