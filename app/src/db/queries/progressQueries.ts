/**
 * progressQueries — derive dashboard state from the events table.
 *
 * PRD v4.0 FR-30: "mastery is a materialised view of events."
 * The `mastery` table does not exist. We replay events on demand.
 *
 * Rules:
 *   - Read-only
 *   - No network calls
 *   - Never returns forbidden strings to the child UI
 */

import type { StoredEvent } from '../../types/events';

export interface ProgressSnapshot {
  highWaterMastery: number;  // 0..1 — max mastery_after ever recorded
  currentMastery: number;    // 0..1 — latest mastery_after
  totalEvents: number;
  masteryEventCount: number;
  firstEventISO: string | null;
  lastEventISO: string | null;
  uniqueDays: number;
}

export type Phase = 'exploring' | 'learning' | 'practising' | 'confident';

const EMPTY: ProgressSnapshot = {
  highWaterMastery: 0,
  currentMastery: 0,
  totalEvents: 0,
  masteryEventCount: 0,
  firstEventISO: null,
  lastEventISO: null,
  uniqueDays: 0,
};

/**
 * Compute a ProgressSnapshot for a single profile from a list of events.
 * Caller passes events (from listEvents()) so this stays pure and testable.
 */
export function getProgressSnapshot(
  events: StoredEvent[],
  profileId: string
): ProgressSnapshot {
  if (!events || events.length === 0) return { ...EMPTY };

  const mine = events.filter((e) => e.profile_id === profileId);
  if (mine.length === 0) return { ...EMPTY };

  // Sort ascending by ts so "current" = last write wins
  const sorted = [...mine].sort((a, b) => a.ts.localeCompare(b.ts));

  let highWater = 0;
  let current = 0;
  let masteryCount = 0;

  for (const evt of sorted) {
    if (evt.node !== 'MASTERY') continue;
    const m = evt.mastery_after;
    if (typeof m !== 'number' || !Number.isFinite(m)) continue;
    masteryCount += 1;
    if (m > highWater) highWater = m;
    current = m;
  }

  const days = new Set<string>();
  for (const evt of sorted) days.add(evt.ts.slice(0, 10));

  return {
    highWaterMastery: highWater,
    currentMastery: current,
    totalEvents: mine.length,
    masteryEventCount: masteryCount,
    firstEventISO: sorted[0].ts,
    lastEventISO: sorted[sorted.length - 1].ts,
    uniqueDays: days.size,
  };
}

/** Map a mastery value to a child-friendly phase label. */
export function phaseFromMastery(p: number): Phase {
  if (p < 0.25) return 'exploring';
  if (p < 0.50) return 'learning';
  if (p < 0.75) return 'practising';
  return 'confident';
}
