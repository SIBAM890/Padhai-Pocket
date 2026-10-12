# Padhai Pocket — Engineering Handoff Package

**Author**: Sibam (Core Backend + Agent Engine Owner)  
**Date**: 2026-10-12  

---

## 1. TO SATYA (Frontend & Middle Backend)

### API & Contracts
- **OpenAPI Specification**: `/shared/openapi.yaml`
- **Event JSON Schema**: `/shared/event.schema.json`
- **Engine Exports (TypeScript)**: `/app/src/engine/index.ts` (`nextAction(state, input, ctx)`)

### Backend Endpoints Available
1. `GET /healthz` — Network-mode probe returning `{"ok": true}`.
2. `POST /v1/devices/register` — Single-use registration code exchange returning `{"device_id": "...", "token": "..."}`.
3. `POST /v1/sync/events` — Batch upload (Bearer token in `Authorization` header, max 256 KB, max 200 events).
4. `GET /v1/summary` — Returns label counts and latest mastery per profile.
5. `DELETE /v1/profiles/{id}` — Server-side audit-logged purge.

### Sync Client Behavior Rules (PRD §7.4)
- **Retry Policy**: Exponential backoff (2s, 4s, 8s, cap at 30s).
- **Trigger**: Retry triggered only on connectivity status changes or app foregrounding — **NEVER poll**.
- **Pending vs. Acked State**:
  - Mark local events `ACKED` **only** if their `event_id` appears in `response.acked` $\cup$ `response.duplicates`.
  - Mark as `REJECTED` if listed in `response.rejected` (flag for teacher review; never loop retry).
  - Otherwise, maintain local state as `PENDING` in SQLite `sync_queue`.
  - On `401` or `403`, immediately stop retrying and display auth flag (FR-32).
  - Never delete a pending event from device SQLite.

### Backend Storage Caveat (Option B Deferral)
- The backend server currently runs with `demo_storage` (in-memory, strictly enforcing Postgres schema constraints and idempotency).
- Production Postgres DDL is located at `/backend/schema.sql` with full RLS enabled.
- For the live hackathon demo, state is held in `demo_storage` to ensure zero connection flakiness on venue Wi-Fi.

---

## 2. TO PRITAM (Content, AI & Automation)

### Content Pack Contract
- **Pack JSON Schema**: `/shared/pack.schema.json`
- **Target File**: `/content/motion_pack.json`

### Chunk ID Formatting
- **Standard Format**: `BSE9-PHYS-MOTION-S02`
- **Strict Rule**: Do **not** encode textbook chapter numbers into chunk IDs (e.g., use `S02` for section order within the Motion chapter, not chapter numbers).
- **Status Machine Enum**: `draft` | `reviewed` | `approved` | `demo_approved`  
  *(Child-facing UI renders only `demo_approved` or `approved` content).*

### Modality Enum
- Supported item modalities: `P`, `A`, `T`, `W`, `TX`, `PX`, `MCQ`.

### Audio Specifications
- **Format**: Opus (~16 kbps) with AAC fallback.
- **Kui Audio**: Every term must include native speaker audio or explicitly `null` if unrecorded.
- **Sampling / Quality**: 16 kHz or 24 kHz mono Opus is sufficient for vocal comprehension on low-cost Android hardware.
