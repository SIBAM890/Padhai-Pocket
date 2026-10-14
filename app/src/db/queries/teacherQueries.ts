/**
 * teacherQueries — derive classroom telemetry, diagnostic label counts,
 * and concept/term mastery from the immutable events table.
 *
 * Follows PRD v4.0 FR-30 & FR-15.
 *
 * Rules:
 *   - Read-only pure functions. Never writes, never throws.
 *   - Derived completely from local SQLite stored events.
 *   - Zero network calls in getTeacherSnapshot.
 *   - getOnlineSummary fetches server /v1/summary and returns null on any error.
 */

import type { StoredEvent } from '../../types/events';

export interface TeacherSnapshot {
  perConceptMastery: Array<{ conceptId: string; mastery: number; ts: string }>;
  perTermMastery: Array<{ termId: string; mastery: number; ts: string }>;
  labelCounts: {
    provisional: Record<string, number>;
    confirmed: Record<string, number>;
    abstained: number;
  };
  syncStatus: { PENDING: number; ACKED: number; ERROR: number; REJECTED: number };
  totalEvents: number;
  totalEpisodes: number;
  packHash: string | null;
  engineVersion: string | null;
}

const EMPTY_SNAPSHOT: TeacherSnapshot = {
  perConceptMastery: [],
  perTermMastery: [],
  labelCounts: {
    provisional: {},
    confirmed: {},
    abstained: 0,
  },
  syncStatus: { PENDING: 0, ACKED: 0, ERROR: 0, REJECTED: 0 },
  totalEvents: 0,
  totalEpisodes: 0,
  packHash: null,
  engineVersion: null,
};

/**
 * Compute TeacherSnapshot from event stream for a single profile.
 * Pure function: never throws, never mutates inputs, returns new copies.
 */
export function getTeacherSnapshot(
  events: StoredEvent[],
  profileId: string
): TeacherSnapshot {
  if (!events || events.length === 0) {
    return {
      perConceptMastery: [],
      perTermMastery: [],
      labelCounts: { provisional: {}, confirmed: {}, abstained: 0 },
      syncStatus: { PENDING: 0, ACKED: 0, ERROR: 0, REJECTED: 0 },
      totalEvents: 0,
      totalEpisodes: 0,
      packHash: null,
      engineVersion: null,
    };
  }

  const mine = events.filter((e) => e && e.profile_id === profileId);
  if (mine.length === 0) {
    return {
      perConceptMastery: [],
      perTermMastery: [],
      labelCounts: { provisional: {}, confirmed: {}, abstained: 0 },
      syncStatus: { PENDING: 0, ACKED: 0, ERROR: 0, REJECTED: 0 },
      totalEvents: 0,
      totalEpisodes: 0,
      packHash: null,
      engineVersion: null,
    };
  }

  // Sort ascending by timestamp for deterministic replay
  const sorted = [...mine].sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));

  const conceptMap = new Map<string, { mastery: number; ts: string }>();
  const termMap = new Map<string, { mastery: number; ts: string }>();

  const provisional: Record<string, number> = {};
  const confirmed: Record<string, number> = {};
  let abstainedCount = 0;

  const syncCounts = { PENDING: 0, ACKED: 0, ERROR: 0, REJECTED: 0 };
  const distinctEpisodes = new Set<string>();
  let latestPackHash: string | null = null;
  let latestEngineVersion: string | null = null;

  for (const evt of sorted) {
    // 1. Metadata & sync status
    if (evt.pack_hash) latestPackHash = evt.pack_hash;
    if (evt.engine_version) latestEngineVersion = evt.engine_version;
    if (evt.episode_id) distinctEpisodes.add(evt.episode_id);

    const st = evt.sync_status ?? 'PENDING';
    if (st in syncCounts) {
      syncCounts[st as keyof typeof syncCounts] += 1;
    } else {
      syncCounts.PENDING += 1;
    }

    // 2. Mastery updates (Adjustment 2: prefer top-level mastery_after over output.after)
    if (evt.node === 'MASTERY') {
      const mastery =
        typeof evt.mastery_after === 'number' && Number.isFinite(evt.mastery_after)
          ? evt.mastery_after
          : typeof evt.output?.after === 'number' && Number.isFinite(evt.output.after)
          ? evt.output.after
          : null;

      if (mastery !== null) {
        if (evt.action === 'CONCEPT_UPDATE') {
          const conceptId =
            (evt.output?.concept_id as string) || 'distance_vs_displacement';
          conceptMap.set(conceptId, { mastery, ts: evt.ts });
        } else if (evt.action === 'TERM_UPDATE') {
          const termId = (evt.output?.term_id as string) || 'T_DISP';
          termMap.set(termId, { mastery, ts: evt.ts });
        }
      }
    }

    // 3. Final labels (Adjustment 3: ACT:REMEDIATION_ASSIGNED)
    if (evt.node === 'ACT' && evt.action === 'REMEDIATION_ASSIGNED') {
      const finalLabel = (evt.output?.final_label as string) || '';
      const threshold = evt.confirm_threshold ?? 1;

      if (finalLabel === 'INCONSISTENT') {
        abstainedCount += 1;
      } else if (threshold === 1) {
        provisional[finalLabel] = (provisional[finalLabel] ?? 0) + 1;
      } else if (threshold === 2) {
        confirmed[finalLabel] = (confirmed[finalLabel] ?? 0) + 1;
      } else {
        // Fallback for demo threshold
        provisional[finalLabel] = (provisional[finalLabel] ?? 0) + 1;
      }
    }
  }

  const perConceptMastery = Array.from(conceptMap.entries()).map(
    ([conceptId, item]) => ({
      conceptId,
      mastery: item.mastery,
      ts: item.ts,
    })
  );

  const perTermMastery = Array.from(termMap.entries()).map(
    ([termId, item]) => ({
      termId,
      mastery: item.mastery,
      ts: item.ts,
    })
  );

  return {
    perConceptMastery,
    perTermMastery,
    labelCounts: {
      provisional,
      confirmed,
      abstained: abstainedCount,
    },
    syncStatus: syncCounts,
    totalEvents: mine.length,
    totalEpisodes: distinctEpisodes.size,
    packHash: latestPackHash,
    engineVersion: latestEngineVersion,
  };
}

/**
 * Fetch online classroom summary from FastAPI /v1/summary.
 *
 * NOTE ON SERVER CONTRACT:
 * The backend /v1/summary endpoint returns:
 *   { device_id, profiles: [{ profile_id, labels, mastery }] }
 * It does NOT return per-term mastery, sync status, or episode counts.
 * Consequently, getOnlineSummary can only enrich:
 *   - labelCounts (from .labels)
 *   - perConceptMastery (from .mastery)
 * All other snapshot fields remain local.
 */
export async function getOnlineSummary(
  profileId: string,
  deviceToken: string,
  baseUrl: string = 'http://localhost:8000'
): Promise<Partial<TeacherSnapshot> | null> {
  try {
    const url = `${baseUrl}/v1/summary?profile_id=${encodeURIComponent(profileId)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (deviceToken) {
      headers['Authorization'] = `Bearer ${deviceToken}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const profile = Array.isArray(data?.profiles)
      ? data.profiles.find((p: any) => p.profile_id === profileId)
      : null;

    if (!profile) return null;

    const perConceptMastery: Array<{ conceptId: string; mastery: number; ts: string }> = [];
    if (profile.mastery && typeof profile.mastery === 'object') {
      for (const [conceptId, m] of Object.entries(profile.mastery)) {
        if (typeof m === 'number') {
          perConceptMastery.push({
            conceptId,
            mastery: m,
            ts: new Date().toISOString(),
          });
        }
      }
    }

    const labelCounts = {
      provisional: {} as Record<string, number>,
      confirmed: (profile.labels as Record<string, number>) || {},
      abstained: 0,
    };

    return {
      perConceptMastery,
      labelCounts,
    };
  } catch {
    // Graceful offline fallback: never throw
    return null;
  }
}
