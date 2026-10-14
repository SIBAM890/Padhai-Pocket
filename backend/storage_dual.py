"""
Dual-Storage Adapter for Padhai Pocket.
Writes to local in-memory/edge storage (always succeeds),
and mirrors to Supabase over HTTPS (REST API) with a strict timeout.
Reads try Supabase with timeout first, then fallback to local storage.
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

from supabase_client import get_client, is_connected

logger = logging.getLogger("storage_dual")

class DualStorage:
    def __init__(self):
        # Local mirror (always available, fast, 100% resilient)
        self.devices: Dict[str, Dict[str, Any]] = {}
        self.registration_codes: Dict[str, Dict[str, Any]] = {}
        self.events: Dict[str, Dict[str, Any]] = {}
        self.profile_seqs: Dict[Tuple[str, int], str] = {}
        self.purge_log: List[Dict[str, Any]] = []

    def reset(self):
        self.devices.clear()
        self.registration_codes.clear()
        self.events.clear()
        self.profile_seqs.clear()
        self.purge_log.clear()

    # -------------------------------------------------------------------------
    # Devices
    # -------------------------------------------------------------------------
    async def write_device(self, device_id: str, token_hash: str, created_at: Optional[datetime] = None) -> None:
        created = created_at or datetime.now(timezone.utc)
        self.devices[device_id] = {
            "token_hash": token_hash,
            "created_at": created,
            "revoked_at": None,
        }

        client = get_client()
        if client:
            try:
                def _insert():
                    client.table("devices").upsert({
                        "device_id": device_id,
                        "token_hash": token_hash,
                        "created_at": created.isoformat(),
                        "revoked_at": None,
                    }).execute()
                await asyncio.wait_for(asyncio.to_thread(_insert), timeout=2.0)
            except Exception as e:
                logger.warning(f"[SUPABASE DUAL-WRITE] write_device failed: {e}")

    # -------------------------------------------------------------------------
    # Events
    # -------------------------------------------------------------------------
    async def write_event(self, event: Dict[str, Any]) -> None:
        eid = event["event_id"]
        prof_id = event["profile_id"]
        seq = event["seq"]
        self.events[eid] = event
        self.profile_seqs[(prof_id, seq)] = eid

        client = get_client()
        if client:
            try:
                def _insert():
                    # Format payload matching postgres schema
                    row = {
                        "event_id": eid,
                        "schema_version": event.get("schema_version", "1.1"),
                        "device_id": event.get("device_id"),
                        "profile_id": prof_id,
                        "session_id": event.get("session_id"),
                        "episode_id": event.get("episode_id"),
                        "seq": seq,
                        "ts": event.get("ts"),
                        "origin": event.get("origin", "device"),
                        "node": event.get("node", "OBSERVE"),
                        "action": event.get("action", "MCQ_ANSWER"),
                        "input_hash": event.get("input_hash"),
                        "output": event.get("output", {}),
                        "latency_ms": event.get("latency_ms", 0),
                        "network_mode": event.get("network_mode", "OFFLINE"),
                        "agreement": event.get("agreement"),
                        "confirm_threshold": event.get("confirm_threshold"),
                        "mastery_before": event.get("mastery_before"),
                        "mastery_after": event.get("mastery_after"),
                        "engine_version": event.get("engine_version", "1.0.0"),
                        "pack_hash": event.get("pack_hash", "e3b0c44298fc"),
                    }
                    client.table("events").insert(row).execute()
                await asyncio.wait_for(asyncio.to_thread(_insert), timeout=2.0)
            except Exception as e:
                logger.warning(f"[SUPABASE DUAL-WRITE] write_event failed: {e}")

    async def read_events_for_device(self, device_id: str) -> List[Dict[str, Any]]:
        client = get_client()
        if client:
            try:
                def _query():
                    res = client.table("events").select("*").eq("device_id", device_id).execute()
                    return res.data
                data = await asyncio.wait_for(asyncio.to_thread(_query), timeout=1.5)
                if data is not None:
                    return data
            except Exception as e:
                logger.warning(f"[SUPABASE DUAL-READ] read_events_for_device failed: {e}")

        # Fallback to local demo_storage
        return [ev for ev in self.events.values() if ev.get("device_id") == device_id]

    async def read_events_for_profile(self, profile_id: str) -> List[Dict[str, Any]]:
        client = get_client()
        if client:
            try:
                def _query():
                    res = client.table("events").select("*").eq("profile_id", profile_id).execute()
                    return res.data
                data = await asyncio.wait_for(asyncio.to_thread(_query), timeout=1.5)
                if data is not None:
                    return data
            except Exception as e:
                logger.warning(f"[SUPABASE DUAL-READ] read_events_for_profile failed: {e}")

        return [ev for ev in self.events.values() if ev.get("profile_id") == profile_id]

    # -------------------------------------------------------------------------
    # Purge Profile
    # -------------------------------------------------------------------------
    async def purge_profile(self, profile_id: str, device_id: str, profile_hash: str) -> int:
        to_delete = [
            eid for eid, ev in self.events.items()
            if ev.get("profile_id") == profile_id and ev.get("device_id") == device_id
        ]
        for eid in to_delete:
            ev = self.events.pop(eid, None)
            if ev:
                self.profile_seqs.pop((ev["profile_id"], ev["seq"]), None)

        now = datetime.now(timezone.utc)
        self.purge_log.append({
            "profile_hash": profile_hash,
            "purged_at": now,
            "event_count": len(to_delete),
        })

        client = get_client()
        if client:
            try:
                def _db_purge():
                    client.table("events").delete().eq("profile_id", profile_id).eq("device_id", device_id).execute()
                    client.table("purge_log").insert({
                        "profile_hash": profile_hash,
                        "purged_at": now.isoformat(),
                        "event_count": len(to_delete),
                    }).execute()
                await asyncio.wait_for(asyncio.to_thread(_db_purge), timeout=2.0)
            except Exception as e:
                logger.warning(f"[SUPABASE DUAL-WRITE] purge_profile failed: {e}")

        return len(to_delete)

storage_dual = DualStorage()
