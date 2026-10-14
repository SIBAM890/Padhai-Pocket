"""
Padhai Pocket - FastAPI Backend
Implements the 5 endpoints from /shared/openapi.yaml:
  GET    /healthz
  POST   /v1/devices/register
  POST   /v1/sync/events
  GET    /v1/summary
  DELETE /v1/profiles/{id}
"""

import os
import json
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import jsonschema

from failure_hooks import FailureInjectionMiddleware

# Load Event JSON Schema
SHARED_DIR = Path(__file__).resolve().parent.parent / "shared"
SCHEMA_PATH = SHARED_DIR / "event.schema.json"

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    EVENT_SCHEMA = json.load(f)

app = FastAPI(
    title="Padhai Pocket Backend API",
    description="Backend and Sync API for offline-resilient diagnostic agent",
    version="1.0.0",
)

# Register Failure Hooks Middleware
app.add_middleware(FailureInjectionMiddleware)

# Register CORS Middleware as outermost middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# Ephemeral Demo Storage (Option B)
# Ephemeral demo-only backend. Production uses Supabase; see schema.sql.
# Matches Postgres table semantics:
# - UNIQUE (profile_id, seq)
# - PRIMARY KEY (event_id)
# - PRIMARY KEY (device_id) with token_hash
# - PRIMARY KEY (code_hash)
# ==============================================================================


class DemoStorage:
    def __init__(self):
        self.devices: Dict[str, Dict[str, Any]] = {}  # device_id -> {token_hash, created_at, revoked_at}
        self.registration_codes: Dict[str, Dict[str, Any]] = {}  # code_hash -> {expires_at, used_at}
        self.events: Dict[str, Dict[str, Any]] = {}  # event_id -> event dict
        self.profile_seqs: Dict[Tuple[str, int], str] = {}  # (profile_id, seq) -> event_id
        self.purge_log: List[Dict[str, Any]] = []

    def reset(self):
        self.devices.clear()
        self.registration_codes.clear()
        self.events.clear()
        self.profile_seqs.clear()
        self.purge_log.clear()


demo_storage = DemoStorage()



def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_profile(profile_id: str) -> str:
    return hashlib.sha256(profile_id.encode("utf-8")).hexdigest()


def seed_registration_code(code: str, hours_valid: int = 24):
    c_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=hours_valid)
    demo_storage.registration_codes[c_hash] = {
        "expires_at": expires_at,
        "used_at": None,
    }


# Seed default valid code for testing
seed_registration_code("REG-DEMO-2026")
seed_registration_code("PADHAI-DEMO-2026")


def verify_device_token(authorization: Optional[str]) -> str:
    """
    Validates Bearer token and returns authenticated device_id.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer token",
        )
    token = authorization.split("Bearer ", 1)[1].strip()
    t_hash = hash_token(token)

    for dev_id, dev_data in demo_storage.devices.items():
        if dev_data["token_hash"] == t_hash:
            if dev_data.get("revoked_at") is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Device token has been revoked",
                )
            return dev_id

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized device token",
    )


# ==============================================================================
# Endpoints
# ==============================================================================


from graph.graph import run_agent_workflow


@app.options("/healthz")
@app.get("/healthz")
async def healthz():
    """
    Network-mode probe; returns {ok: true} only. Fast, no auth, no DB hit.
    """
    return {"ok": True}


@app.post("/v1/agent/plan")
async def agent_plan(request: Request):
    """
    Exposes LangGraph planning pipeline to frontend / diagnostic agent.
    """
    body = await request.json()
    result = run_agent_workflow({
        "candidate_concept_ids": body.get("candidate_concept_ids", []),
        "mastery_bucket": body.get("mastery_bucket", "mid"),
        "tier_history": body.get("tier_history", []),
    })
    return result


@app.post("/v1/devices/register")
async def register_device(request: Request):
    """
    Validates single-use registration code, issues device token once,
    and server stores only token hash.
    """
    body = await request.json()
    code = body.get("code")
    device_id = body.get("device_id")

    if not code or not device_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="code and device_id are required",
        )

    code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
    reg = demo_storage.registration_codes.get(code_hash)

    if not reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid registration code",
        )

    if reg["used_at"] is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration code already used",
        )

    now = datetime.now(timezone.utc)
    if now > reg["expires_at"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration code expired",
        )

    # Mark code used (single-use)
    reg["used_at"] = now

    # Generate device bearer token
    raw_token = f"tok_{secrets.token_hex(24)}"
    token_h = hash_token(raw_token)

    demo_storage.devices[device_id] = {
        "token_hash": token_h,
        "created_at": now,
        "revoked_at": None,
    }

    return {"device_id": device_id, "token": raw_token}


@app.post("/v1/sync/events")
async def sync_events(request: Request, authorization: Optional[str] = Header(None)):
    """
    Batch event sync. Limits: 256 KB, 200 events.
    Returns {acked: [...], duplicates: [...], rejected: [...]}
    """
    auth_device_id = verify_device_token(authorization)

    raw_body = await request.body()
    # Check payload size (256 KB limit = 262,144 bytes)
    if len(raw_body) > 262144:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Payload exceeds 256 KB limit",
        )

    try:
        data = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    payload_device_id = data.get("device_id")
    if payload_device_id != auth_device_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="device_id does not match authenticated token",
        )

    events: List[Dict[str, Any]] = data.get("events", [])
    if len(events) > 200:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Batch exceeds maximum 200 events limit",
        )

    acked: List[str] = []
    duplicates: List[str] = []
    rejected: List[Dict[str, str]] = []

    for ev in events:
        eid = ev.get("event_id")
        if not eid:
            rejected.append({"event_id": "unknown", "reason": "Missing event_id"})
            continue

        # 1. Validate schema
        try:
            jsonschema.validate(instance=ev, schema=EVENT_SCHEMA)
        except jsonschema.ValidationError as err:
            rejected.append({"event_id": eid, "reason": f"Schema validation error: {err.message}"})
            continue

        # 2. Check primary key conflict (event_id) -> Idempotency: duplicate
        if eid in demo_storage.events:
            duplicates.append(eid)
            continue

        # 3. Check (profile_id, seq) uniqueness conflict
        prof_id = ev["profile_id"]
        seq = ev["seq"]
        existing_eid = demo_storage.profile_seqs.get((prof_id, seq))
        if existing_eid and existing_eid != eid:
            rejected.append({"event_id": eid, "reason": "seq_conflict"})
            continue

        # 4. Successful insert
        demo_storage.events[eid] = ev
        demo_storage.profile_seqs[(prof_id, seq)] = eid
        acked.append(eid)

    return {
        "acked": acked,
        "duplicates": duplicates,
        "rejected": rejected,
    }


@app.get("/v1/summary")
async def get_summary(authorization: Optional[str] = Header(None)):
    """
    Label counts and current mastery for that device's profiles.
    """
    auth_device_id = verify_device_token(authorization)

    # Aggregate events belonging to this device
    profiles_map: Dict[str, Dict[str, Any]] = {}

    for ev in demo_storage.events.values():
        if ev.get("device_id") == auth_device_id:
            pid = ev["profile_id"]
            if pid not in profiles_map:
                profiles_map[pid] = {
                    "profile_id": pid,
                    "labels": {},
                    "mastery": {},
                }

            # If event recorded an agreement/label
            label = ev.get("output", {}).get("final_label") or ev.get("output", {}).get("label")
            if label:
                profiles_map[pid]["labels"][label] = (
                    profiles_map[pid]["labels"].get(label, 0) + 1
                )

            # Latest mastery
            if "mastery_after" in ev and ev["mastery_after"] is not None:
                concept = ev.get("output", {}).get("concept_id", "default")
                profiles_map[pid]["mastery"][concept] = ev["mastery_after"]

    return {
        "device_id": auth_device_id,
        "profiles": list(profiles_map.values()),
    }


@app.delete("/v1/profiles/{id}")
async def purge_profile(id: str, authorization: Optional[str] = Header(None)):
    """
    Server-side purge for a profile of that device.
    Purges events and logs to purge_log with hashed profile id.
    """
    auth_device_id = verify_device_token(authorization)

    # Collect events for profile
    to_delete = [
        eid
        for eid, ev in demo_storage.events.items()
        if ev.get("profile_id") == id and ev.get("device_id") == auth_device_id
    ]

    for eid in to_delete:
        ev = demo_storage.events.pop(eid)
        demo_storage.profile_seqs.pop((ev["profile_id"], ev["seq"]), None)

    # Log to purge_log
    prof_h = hash_profile(id)
    demo_storage.purge_log.append({
        "profile_hash": prof_h,
        "purged_at": datetime.now(timezone.utc),
        "event_count": len(to_delete),
    })

    return {
        "ok": True,
        "profile_id": id,
        "purged_events_count": len(to_delete),
    }
