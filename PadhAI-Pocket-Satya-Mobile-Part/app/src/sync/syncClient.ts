import {detectNetworkMode} from '../network/network';
import {markAcked, markError, pendingEvents} from '../db/database';
import type {PadhaiEvent} from '../types/events';

export interface SyncConfig {
  baseUrl: string;
  deviceId: string;
  token?: string;
}

export async function syncPending(config: SyncConfig) {
  const mode = await detectNetworkMode(`${config.baseUrl}/healthz`);
  if (mode !== 'ONLINE') return {acked: 0, duplicates: 0, skipped: true};

  const events = await pendingEvents(200);
  if (!events.length) return {acked: 0, duplicates: 0, skipped: false};

  const ids = events.map(e => e.event_id);
  try {
    const response = await fetch(`${config.baseUrl}/v1/sync/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.token ? {Authorization: `Bearer ${config.token}`} : {}),
      },
      body: JSON.stringify({device_id: config.deviceId, events}),
    });

    if (!response.ok) throw new Error(`SYNC_${response.status}`);

    const data = await response.json() as {
      acked?: string[];
      duplicates?: string[];
      rejected?: Array<{event_id: string; reason: string}>;
    };

    const acked = [...(data.acked ?? []), ...(data.duplicates ?? [])];
    await markAcked(acked);
    const rejected = (data.rejected ?? []).map(x => x.event_id);
    await markError(rejected);
    return {
      acked: data.acked?.length ?? 0,
      duplicates: data.duplicates?.length ?? 0,
      rejected: rejected.length,
      skipped: false,
    };
  } catch {
    await markError(ids);
    return {acked: 0, duplicates: 0, rejected: ids.length, skipped: false};
  }
}
