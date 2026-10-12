"""
PRD v4.0 §4.4, §4.5, §4.9, §4.10, §5.1 Pure Python 3.11+ Mirror
Matches TypeScript engine in /app/src/engine/ exactly.
"""

from typing import List, Optional, Tuple, Dict, Any, Union
import math


def mulberry32(seed: int):
    """
    32-bit PRNG generating floats in [0, 1), identical to TypeScript implementation.
    """
    s = seed & 0xFFFFFFFF

    def rnd() -> float:
        nonlocal s
        s = (s + 0x6D2B79F5) & 0xFFFFFFFF
        t = s
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return rnd


def seeded_shuffle(items: List[Any], seed: int) -> List[Any]:
    """
    Fisher-Yates shuffle over an array with mulberry32 PRNG.
    """
    result = list(items)
    rnd = mulberry32(seed)
    for i in range(len(result) - 1, 0, -1):
        j = int(rnd() * (i + 1))
        result[i], result[j] = result[j], result[i]
    return result


def probe_order(seed: int) -> List[str]:
    """
    Shuffle for probe modalities ['P', 'A', 'T'].
    """
    return seeded_shuffle(["P", "A", "T"], seed)


TABLE: Dict[str, str] = {
    "1,1,1": "RESOLVED",
    "1,1,0": "READING_GAP_CANDIDATE",
    "1,0,0": "LANGUAGE_OR_TERM_GAP_CANDIDATE",
    "0,0,0": "CONCEPT_GAP_CANDIDATE",
}


def candidate_of(pattern: List[Optional[int]]) -> str:
    """
    Maps [P, A, T] pattern (1=pass, 0=fail, None=unavailable) to Candidate.
    Any pattern with None (e.g. audio unavailable) yields INCONSISTENT.
    """
    if None in pattern:
        return "INCONSISTENT"
    key = f"{pattern[0]},{pattern[1]},{pattern[2]}"
    return TABLE.get(key, "INCONSISTENT")


def resolve(candidate: str, confirm_passed: bool) -> str:
    """
    Resolves Candidate and targeted confirmation result into SetLabel.
    """
    if candidate == "LANGUAGE_OR_TERM_GAP_CANDIDATE":
        return "LISTENING_OR_COMPREHENSION" if confirm_passed else "TERM_GAP"
    elif candidate == "READING_GAP_CANDIDATE":
        return "INCONSISTENT" if confirm_passed else "READING_GAP"
    elif candidate == "CONCEPT_GAP_CANDIDATE":
        return "INCONSISTENT" if confirm_passed else "CONCEPT_GAP"
    elif candidate == "RESOLVED":
        return "RESOLVED"
    else:
        return "INCONSISTENT"


def final_label(sets: List[str], threshold: int) -> Dict[str, Any]:
    """
    PRD §4.5 Agreement rule state machine.
    Threshold 1 = demo, 2 = production.
    """
    n = len(sets)
    if threshold == 1:
        first = next((s for s in sets if s != "INCONSISTENT"), None)
        if first is not None:
            return {
                "done": True,
                "label": first,
                "status": "provisional",
                "agreement": f"1/{n}",
            }
        return (
            {"done": False}
            if n < 3
            else {
                "done": True,
                "label": "INCONSISTENT",
                "status": "abstained",
                "agreement": f"0/{n}",
            }
        )

    # threshold == 2 (production)
    if sets and sets[0] == "RESOLVED":
        return {
            "done": True,
            "label": "RESOLVED",
            "status": "confirmed",
            "agreement": "1/1",
        }

    counts: Dict[str, int] = {}
    for s in sets:
        if s != "INCONSISTENT":
            counts[s] = counts.get(s, 0) + 1

    for label, c in counts.items():
        if c >= 2:
            return {
                "done": True,
                "label": label,
                "status": "confirmed",
                "agreement": f"{c}/{n}",
            }

    return (
        {"done": False}
        if n < 3
        else {
            "done": True,
            "label": "INCONSISTENT",
            "status": "abstained",
            "agreement": f"0/{n}",
        }
    )


def bkt_step(
    p: float,
    correct: bool,
    s: float = 0.10,
    g: float = 0.25,
    t: float = 0.15,
) -> float:
    """
    Single step BKT posterior update + transition.
    wrong:   P' = P·s / (P·s + (1−P)(1−g))
    correct: P' = P(1−s) / (P(1−s) + (1−P)·g)
    learn:   P_next = P' + (1−P')·t
    """
    if correct:
        num = p * (1.0 - s)
        den = num + (1.0 - p) * g
        p_prime = num / den
    else:
        num = p * s
        den = num + (1.0 - p) * (1.0 - g)
        p_prime = num / den

    p_next = p_prime + (1.0 - p_prime) * t
    return p_next


def update_concept_mastery(
    current: float, correct: bool, n_options: int = 4
) -> float:
    """
    Concept mastery update: s=0.10, g=1/n_options, t=0.15
    """
    g = 1.0 / n_options
    return bkt_step(current, correct, s=0.10, g=g, t=0.15)


def update_term_mastery(
    current: float, correct: bool, n_options: int = 4
) -> float:
    """
    Term mastery update: s=0.10, g=1/n_options, t=0.10
    """
    g = 1.0 / n_options
    return bkt_step(current, correct, s=0.10, g=g, t=0.10)
