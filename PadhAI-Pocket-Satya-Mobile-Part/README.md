# PadhAI Pocket — Satya Mobile Slice

This package implements Satya's assigned mobile-side slice:

- Expo + React Native scaffold
- Learn / Trace / Raw Log screens
- SQLite persistence
- Event writer
- Pending/ACKED sync state
- Exponential-backoff sync client
- NetInfo-based network mode
- Demo airplane/offline toggle
- Trace rendered from SQLite rows

## Important

The repository already contains the team's engine under `app/src/engine/`. This package intentionally keeps the mobile layer independent of the engine implementation. The Learn screen currently emits a schema-shaped local MCQ event so the offline/SQLite/sync flow can be tested immediately.

Next integration step: replace `makeEvent()` in `app/src/screens/LearnScreen.tsx` with the real `nextAction(state, input, ctx)` call from the team's engine and persist every returned event through `insertEvent()`.

## Install

Inside `app/`:

```bash
npm install
npx expo start
```

For Android:

```bash
npx expo start
# or
npx expo run:android
```

If the team already has a pinned Expo SDK, keep that version and run:

```bash
npx expo install expo-sqlite expo-secure-store
npm install @react-native-community/netinfo @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

Do not blindly replace the team's existing lockfile.

## Backend

Set:

```bash
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000
```

The sync client uses:

- `GET /healthz`
- `POST /v1/sync/events`

matching `shared/openapi.yaml`.

## Current demo flow

1. Open Learn.
2. Toggle the offline demo switch.
3. Answer the MCQ.
4. Event is persisted locally.
5. Open Trace — the event is rendered from SQLite.
6. Open Raw Log — inspect the stored rows.
7. Turn offline mode off.
8. Press Sync when the backend is reachable.
9. The queue moves to ACKED for accepted/duplicate event IDs.

## One integration issue to discuss with Sibam

The current engine branch visible in the team repository creates event IDs in an `evt-...` format, while `shared/event.schema.json` requires UUID event IDs. Resolve that contract before wiring the engine directly to sync. Do not hide the mismatch in the UI layer.
