# Decision Log

## 2026-10-13 — Revert async WebCrypto engine changes (553acdf)

Pritam proposed migrating engine/seed.ts to async crypto.subtle.
Approach is correct for production but conflicts with:
  - FR-21 (engine purity, sync contract)
  - Existing web build (sync polyfill works in browser)
  - Schema versioning not in place for device_id required change

Decision: revert for hackathon, revisit post-event.

Future refactor path:
  1. Version schema (v1.2) with device_id optional → required
  2. Move nextAction to async in a separate versioned API
  3. Keep sync polyfill for offline path