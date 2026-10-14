"""
Seed script for Padhai Pocket demo.
Populates both local storage_dual and Supabase with golden vectors and demo events for:
1. Sunita (prof_demo_01):
   - 5 days of events (Thu through Wed)
   - Wrong MCQ -> probe -> term gap
   - Reading gap
   - Term gap (Kui bridge)
   - Mastery confirmation
   - BKT chain: 0.42 -> 0.2248 -> 0.5842 -> 0.8597
   - Term mastery: 0.40 -> 0.1735 -> 0.4873
2. Ramesh (prof_demo_02): CONCEPT_GAP, BKT 0.35
3. Kavita (prof_demo_03): ABSTAIN with teacher flag
"""

import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

from storage_dual import storage_dual

def _make_event(
    device_id: str,
    profile_id: str,
    seq: int,
    node: str,
    action: str,
    output: Dict[str, Any],
    ts: datetime,
    mastery_before: float = None,
    mastery_after: float = None,
    agreement: str = None,
) -> Dict[str, Any]:
    return {
        "schema_version": "1.1",
        "event_id": str(uuid.uuid4()),
        "device_id": device_id,
        "profile_id": profile_id,
        "session_id": str(uuid.uuid4()),
        "episode_id": str(uuid.uuid4()),
        "seq": seq,
        "ts": ts.isoformat(),
        "origin": "device",
        "node": node,
        "action": action,
        "input_hash": hashlib.sha256(f"{profile_id}:{seq}".encode()).hexdigest()[:12],
        "output": output,
        "latency_ms": 120,
        "network_mode": "OFFLINE",
        "agreement": agreement,
        "confirm_threshold": 1,
        "mastery_before": mastery_before,
        "mastery_after": mastery_after,
        "engine_version": "1.0.0",
        "pack_hash": "c94a1f34f7b1",
    }

async def seed_all() -> int:
    base_time = datetime.now(timezone.utc) - timedelta(days=6)
    events: List[Dict[str, Any]] = []

    # 1. Register devices
    devices = ["dev_tab_01", "dev_tab_02", "dev_tab_03"]
    for dev in devices:
        t_hash = hashlib.sha256(f"tok_{dev}".encode()).hexdigest()
        await storage_dual.write_device(dev, t_hash)

    # -------------------------------------------------------------------------
    # Student 1: Sunita (prof_demo_01) - 5 days, golden BKT progression
    # -------------------------------------------------------------------------
    p1 = "prof_demo_01"
    d1 = "dev_tab_01"
    
    # Day 1: Wrong MCQ + Probes -> Candidate Language/Term Gap
    t1 = base_time + timedelta(days=1, hours=10)
    events.append(_make_event(d1, p1, 1, "OBSERVE", "MCQ_ANSWER", {"correct": False, "concept_id": "distance_vs_displacement", "misconception_tag": "path_equals_displacement"}, t1, 0.42, 0.2248))
    events.append(_make_event(d1, p1, 2, "PROBE", "PROBE_ITEM_P", {"modality": "P", "correct": True}, t1 + timedelta(minutes=1)))
    events.append(_make_event(d1, p1, 3, "PROBE", "PROBE_ITEM_A", {"modality": "A", "correct": False}, t1 + timedelta(minutes=2)))
    events.append(_make_event(d1, p1, 4, "PROBE", "PROBE_ITEM_T", {"modality": "T", "correct": False}, t1 + timedelta(minutes=3)))
    events.append(_make_event(d1, p1, 5, "REFLECT", "CANDIDATE_RESOLVE", {"candidate": "LANGUAGE_OR_TERM_GAP_CANDIDATE", "pattern": [1, 0, 0]}, t1 + timedelta(minutes=4)))

    # Day 2: Reading Gap exploration
    t2 = base_time + timedelta(days=2, hours=11)
    events.append(_make_event(d2:=d1, p1, 6, "OBSERVE", "MCQ_ANSWER", {"correct": False, "concept_id": "distance_vs_displacement"}, t2, 0.2248, 0.2248))
    events.append(_make_event(d1, p1, 7, "PROBE", "PROBE_ITEM_P", {"modality": "P", "correct": True}, t2 + timedelta(minutes=1)))
    events.append(_make_event(d1, p1, 8, "PROBE", "PROBE_ITEM_A", {"modality": "A", "correct": True}, t2 + timedelta(minutes=2)))
    events.append(_make_event(d1, p1, 9, "PROBE", "PROBE_ITEM_T", {"modality": "T", "correct": False}, t2 + timedelta(minutes=3)))
    events.append(_make_event(d1, p1, 10, "REFLECT", "CANDIDATE_RESOLVE", {"candidate": "READING_GAP_CANDIDATE", "pattern": [1, 1, 0]}, t2 + timedelta(minutes=4)))

    # Day 3: Term gap with Kui Bridge confirmation
    t3 = base_time + timedelta(days=3, hours=9)
    events.append(_make_event(d1, p1, 11, "OBSERVE", "CONFIRM_ITEM", {"term_id": "T_DISP", "correct": False}, t3, mastery_before=0.40, mastery_after=0.1735))
    events.append(_make_event(d1, p1, 12, "ACT", "REMEDIATION_TERM_GAP", {"final_label": "TERM_GAP", "term_id": "T_DISP", "resource_id": "RES-KUI-DISP-01"}, t3 + timedelta(minutes=2), agreement="1/1"))

    # Day 4: Post-remediation vocabulary check (correct)
    t4 = base_time + timedelta(days=4, hours=10)
    events.append(_make_event(d1, p1, 13, "OBSERVE", "REMEDIATION_W", {"term_id": "T_DISP", "correct": True}, t4, mastery_before=0.1735, mastery_after=0.4873))
    events.append(_make_event(d1, p1, 14, "ACT", "BRIDGE_COMPLETE", {"status": "RESOLVED"}, t4 + timedelta(minutes=2)))

    # Day 5: Post-remediation concept mastery verification (correct -> 0.5842 -> 0.8597)
    t5 = base_time + timedelta(days=5, hours=10)
    events.append(_make_event(d1, p1, 15, "OBSERVE", "MCQ_ANSWER", {"correct": True, "concept_id": "distance_vs_displacement"}, t5, mastery_before=0.2248, mastery_after=0.5842))
    events.append(_make_event(d1, p1, 16, "OBSERVE", "POST_REMEDIATION_MCQ", {"correct": True, "concept_id": "distance_vs_displacement"}, t5 + timedelta(minutes=5), mastery_before=0.5842, mastery_after=0.8597))

    # -------------------------------------------------------------------------
    # Student 2: Ramesh (prof_demo_02) - Concept Gap
    # -------------------------------------------------------------------------
    p2 = "prof_demo_02"
    d2 = "dev_tab_02"
    tr = base_time + timedelta(days=4, hours=14)
    events.append(_make_event(d2, p2, 1, "OBSERVE", "MCQ_ANSWER", {"correct": False, "concept_id": "distance_vs_displacement"}, tr, 0.42, 0.2248))
    events.append(_make_event(d2, p2, 2, "PROBE", "PROBE_ITEM_P", {"modality": "P", "correct": False}, tr + timedelta(minutes=1)))
    events.append(_make_event(d2, p2, 3, "PROBE", "PROBE_ITEM_A", {"modality": "A", "correct": False}, tr + timedelta(minutes=2)))
    events.append(_make_event(d2, p2, 4, "PROBE", "PROBE_ITEM_T", {"modality": "T", "correct": False}, tr + timedelta(minutes=3)))
    events.append(_make_event(d2, p2, 5, "ACT", "REMEDIATION_CONCEPT_GAP", {"final_label": "CONCEPT_GAP", "concept_id": "distance_vs_displacement"}, tr + timedelta(minutes=4), mastery_after=0.35, agreement="1/1"))

    # -------------------------------------------------------------------------
    # Student 3: Kavita (prof_demo_03) - Abstain with teacher flag
    # -------------------------------------------------------------------------
    p3 = "prof_demo_03"
    d3 = "dev_tab_03"
    tk = base_time + timedelta(days=4, hours=16)
    events.append(_make_event(d3, p3, 1, "OBSERVE", "MCQ_ANSWER", {"correct": False, "concept_id": "distance_vs_displacement"}, tk, 0.42, 0.2248))
    events.append(_make_event(d3, p3, 2, "ACT", "ABSTAIN", {"final_label": "INCONSISTENT", "teacher_flag": True, "reason": "No consensus across sets"}, tk + timedelta(minutes=3), agreement="0/3"))

    # Write all events through storage_dual
    for ev in events:
        await storage_dual.write_event(ev)

    return len(events)
