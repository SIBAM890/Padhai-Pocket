# Backend Mode & Persistence Architecture

**Scope**: Hackathon Demo Architecture vs. Production Deployment  
**Author**: Sibam (Core Backend + Agent Owner)  
**Date**: 2026-10-12  

---

## 1. Demo Mode Architecture (Option B)
- **Status**: Active for NEXTECH 2.0 Hackathon Demo.
- **Backend Storage**: Ephemeral `demo_storage` in-memory store matching full Postgres table constraints (primary key idempotency on `event_id`, unique constraint on `(profile_id, seq)`, hashed token lookup, and purge logging).
- **Rationale**: Guarantees zero latency, zero cloud network dependency during stage demos, and instant resets across rehearsals without external connection risks.
- **Claims Impact**: 
  - Claim **K5 / C11 (Sync Integrity with 0 lost, 0 duplicated, 0 gaps)** is **not claimed for the live demo** on a hosted Postgres cluster.
  - Claim **K5 / C11** is claimed for the **post-hackathon pilot**.

---

## 2. Production Architecture (Supabase Postgres)
- **Status**: Production schema defined in `/backend/schema.sql`.
- **Target**: Supabase Postgres with connection pooling (`DATABASE_URL`).
- **Security & RLS**:
  - `ALTER TABLE events ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE devices ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE purge_log ENABLE ROW LEVEL SECURITY;`
  - Zero policies (`CREATE POLICY`) are applied, guaranteeing by default that requests via the anonymous public key (`anon`) are blocked (403), with read/write restricted strictly to the backend `service-role` key.
- **Deployment**: Will be provisioned and verified against the cloud cluster before field pilot rollout.
