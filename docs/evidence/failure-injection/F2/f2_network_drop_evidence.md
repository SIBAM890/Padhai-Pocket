# F2 — Network Drop Mid-Sync Evidence

## Test Setup
- Date: [TO BE FILLED]
- Device: [TO BE FILLED]
- Profile: prof_demo_01
- Baseline event count: [TO BE FILLED]

## Procedure
1. [Sibam will run this — you document the steps]
2. Toggle airplane mode ON mid-sync
3. Observe PENDING events
4. Toggle airplane mode OFF
5. Verify ACKED

## Expected Results
- Events stay PENDING during offline window
- retry_count increments
- No data loss, no seq gaps
- On reconnect: events transition to ACKED

## Actual Results
[TO BE FILLED BY SIBAM AFTER EXECUTION]

## Screenshots
[Placeholders — Sibam adds PNGs]

## Verdict
[TO BE FILLED]