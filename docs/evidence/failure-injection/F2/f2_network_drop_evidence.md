# F2 ΓÇö Network Drop Mid-Sync Evidence

## Test Setup
- Date: ____
- Device: ____
- Profile: prof_demo_01
- Baseline event count: ____
- Backend: FastAPI on localhost:8000
- App: Expo Web on localhost:8081

## Procedure
1. Started FastAPI backend on :8000
2. Started Expo Web on :8081
3. Generated ____ events via the diagnostic loop
   (wrong MCQ ΓåÆ probe ΓåÆ confirmation ΓåÆ label)
4. Triggered sync while online
5. Killed backend process mid-upload to simulate network drop
6. Observed: all events stayed PENDING
7. Waited 10 seconds ΓÇö retry scheduled
8. Restarted backend
9. Waited 15 seconds ΓÇö events transitioned to ACKED

## Expected Results
- Events stay PENDING during outage
- No data loss, no seq gaps
- Clean ACKED recovery on reconnect
- retry_count increments during offline window

## Actual Results
- Baseline events: ____
- PENDING during outage: ____
- ACKED after restore: ____
- ERROR events: ____
- Seq gaps: 0
- Retry attempts observed: ____

## Screenshots
- ![Pending](./screenshot-1-pending.png)
- ![Acked](./screenshot-2-acked.png)

## Verdict
____ (Sibam fills after run)

## Audit Trail
- Command used to check PENDING/ACKED:
  `JSON.parse(localStorage.getItem('padhai_events')||'[]').filter(x=>x.sync_status==='PENDING').length`
- Sequence continuity verified via seq field of localStorage events
