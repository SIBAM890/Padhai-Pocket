"""
Pytest suite for FastAPI backend and Postgres sync semantics.
Tests:
- F1: Gemini timeout -> FALLBACK simulation
- F2: Network drop simulation -> retry works
- F3: Duplicate event_id -> one row, one entry in duplicates[]
- F5: Partial batch -> valid ACKed, invalid REJECTED with reason
- S3: Auth limits (no token -> 401; wrong token -> 401; payload > 256KB -> 413)
- S7: X-Failure-Mode with ENV=prod -> ignored
- S8: RLS security verification on schema.sql
"""

import sys
import os
import json
import uuid
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from main import app, demo_storage, seed_registration_code


@pytest.fixture
def anyio_backend():
    return 'asyncio'



@pytest.fixture(autouse=True)
def reset_storage():
    demo_storage.reset()
    seed_registration_code("REG-CODE-123")
    os.environ["ENV"] = "demo"


def make_valid_event(device_id: str, profile_id: str, seq: int, event_id: str = None) -> dict:
    return {
        "schema_version": "1.1",
        "event_id": event_id or str(uuid.uuid4()),
        "device_id": device_id,
        "profile_id": profile_id,
        "session_id": str(uuid.uuid4()),
        "episode_id": None,
        "seq": seq,
        "ts": "2026-10-12T10:00:00.000Z",
        "origin": "device",
        "node": "OBSERVE",
        "action": "MCQ_ANSWER",
        "input_hash": "a1b2c3d4e5f6",
        "output": {"correct": False},
        "network_mode": "OFFLINE",
        "engine_version": "1.0.0",
        "pack_hash": "e3b0c44298fc",
    }


@pytest.mark.anyio
async def test_healthz():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/healthz")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert "storage" in data
        assert "supabase_connected" in data


@pytest.mark.anyio
async def test_device_registration_and_single_use():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First registration -> success
        res1 = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_01"},
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["device_id"] == "device_tab_01"
        assert "token" in data1
        token = data1["token"]

        # Raw token not in storage, only hash
        assert token not in [d["token_hash"] for d in demo_storage.devices.values()]

        # Second registration with same code -> 400 (single-use)
        res2 = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_02"},
        )
        assert res2.status_code == 400


@pytest.mark.anyio
async def test_s3_sync_auth_and_payload_limits():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register device
        reg = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_01"},
        )
        token = reg.json()["token"]

        # 1. No token -> 401
        res_no_auth = await client.post("/v1/sync/events", json={"device_id": "device_tab_01", "events": []})
        assert res_no_auth.status_code == 401

        # 2. Wrong token -> 401
        res_wrong_auth = await client.post(
            "/v1/sync/events",
            headers={"Authorization": "Bearer wrong_token_abc"},
            json={"device_id": "device_tab_01", "events": []},
        )
        assert res_wrong_auth.status_code == 401

        # 3. Payload > 256 KB -> 413
        huge_event = make_valid_event("device_tab_01", "prof_01", 1)
        huge_event["output"] = {"blob": "x" * (270 * 1024)}
        res_large = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [huge_event]},
        )
        assert res_large.status_code == 413


@pytest.mark.anyio
async def test_f3_duplicate_event_handling():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_01"},
        )
        token = reg.json()["token"]

        eid = str(uuid.uuid4())
        ev1 = make_valid_event("device_tab_01", "prof_01", 1, event_id=eid)

        # First sync
        res1 = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [ev1]},
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert eid in data1["acked"]
        assert len(data1["duplicates"]) == 0

        # Duplicate sync with same event_id (ON CONFLICT DO NOTHING)
        res2 = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [ev1]},
        )
        assert res2.status_code == 200
        data2 = res2.json()
        assert eid in data2["duplicates"]
        assert len(data2["acked"]) == 0
        assert len(demo_storage.events) == 1  # exactly one row


@pytest.mark.anyio
async def test_f5_partial_batch_and_seq_conflict():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_01"},
        )
        token = reg.json()["token"]

        ev1 = make_valid_event("device_tab_01", "prof_01", 1)
        # Invalid event (missing required fields)
        bad_ev = {"event_id": str(uuid.uuid4()), "node": "UNKNOWN_NODE"}
        # Valid event with seq 2
        ev2 = make_valid_event("device_tab_01", "prof_01", 2)

        res = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [ev1, bad_ev, ev2]},
        )
        assert res.status_code == 200
        data = res.json()
        assert ev1["event_id"] in data["acked"]
        assert ev2["event_id"] in data["acked"]
        assert any(r["event_id"] == bad_ev["event_id"] for r in data["rejected"])

        # Seq conflict test: different event_id but same (profile_id, seq=1)
        conflict_ev = make_valid_event("device_tab_01", "prof_01", 1)
        res_conf = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [conflict_ev]},
        )
        data_conf = res_conf.json()
        assert any(r["reason"] == "seq_conflict" for r in data_conf["rejected"])


@pytest.mark.anyio
async def test_f1_gemini_timeout_failure_mode():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        os.environ["ENV"] = "demo"
        res = await client.get("/healthz", headers={"X-Failure-Mode": "timeout"})
        assert res.status_code == 504
        data = res.json()
        assert data["fallback"]["node"] == "FALLBACK"
        assert data["fallback"]["action"] == "cached_plan"


@pytest.mark.anyio
async def test_f2_network_drop_and_retry():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_01"},
        )
        token = reg.json()["token"]

        ev1 = make_valid_event("device_tab_01", "prof_01", 1)

        # 1. Simulate server error (network/500 drop)
        os.environ["ENV"] = "demo"
        res_fail = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}", "X-Failure-Mode": "500"},
            json={"device_id": "device_tab_01", "events": [ev1]},
        )
        assert res_fail.status_code == 500
        # Not inserted yet
        assert ev1["event_id"] not in demo_storage.events

        # 2. Re-try when network restores
        res_retry = await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [ev1]},
        )
        assert res_retry.status_code == 200
        assert ev1["event_id"] in res_retry.json()["acked"]


@pytest.mark.anyio
async def test_s7_failure_mode_ignored_in_prod():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        os.environ["ENV"] = "prod"
        res = await client.get("/healthz", headers={"X-Failure-Mode": "500"})
        # Must be 200 because header is ignored in prod
        assert res.status_code == 200
        assert res.json()["ok"] is True


@pytest.mark.anyio
async def test_summary_and_purge_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post(
            "/v1/devices/register",
            json={"code": "REG-CODE-123", "device_id": "device_tab_01"},
        )
        token = reg.json()["token"]

        ev1 = make_valid_event("device_tab_01", "prof_01", 1)
        ev1["output"] = {"final_label": "TERM_GAP", "concept_id": "distance_vs_displacement"}
        ev1["mastery_after"] = 0.5842

        await client.post(
            "/v1/sync/events",
            headers={"Authorization": f"Bearer {token}"},
            json={"device_id": "device_tab_01", "events": [ev1]},
        )

        # Get summary
        sum_res = await client.get("/v1/summary", headers={"Authorization": f"Bearer {token}"})
        assert sum_res.status_code == 200
        s_data = sum_res.json()
        assert s_data["device_id"] == "device_tab_01"
        assert len(s_data["profiles"]) == 1
        assert s_data["profiles"][0]["labels"]["TERM_GAP"] == 1
        assert s_data["profiles"][0]["mastery"]["distance_vs_displacement"] == 0.5842

        # Purge profile
        del_res = await client.delete(
            "/v1/profiles/prof_01",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert del_res.status_code == 200
        assert del_res.json()["ok"] is True
        assert del_res.json()["purged_events_count"] == 1
        assert len(demo_storage.events) == 0
        assert len(demo_storage.purge_log) == 1


def test_s8_schema_rls_sql():
    schema_path = BACKEND_DIR / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        sql = f.read()

    # Verify RLS is enabled on all four tables
    assert "ALTER TABLE events ENABLE ROW LEVEL SECURITY;" in sql
    assert "ALTER TABLE devices ENABLE ROW LEVEL SECURITY;" in sql
    assert "ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;" in sql
    assert "ALTER TABLE purge_log ENABLE ROW LEVEL SECURITY;" in sql
    # Verify NO policy statements exist
    assert "CREATE POLICY" not in sql
