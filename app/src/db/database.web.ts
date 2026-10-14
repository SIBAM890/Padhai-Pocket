/**
 * Web-compatible in-memory database for Padhai Pocket
 * Uses module-level Maps instead of expo-sqlite.
 * Metro automatically picks .web.ts for web bundles.
 */

import type { PadhaiEvent, StoredEvent, SyncStatus } from '../types/events';

// In-memory storage
const eventsMap = new Map<string, StoredEvent>();
let seqCounter = 0;

export async function getDatabase(): Promise<void> {
  // No-op for web - we use in-memory Maps
  return;
}

export async function initDatabase(): Promise<void> {
  // No-op for web - in-memory is always ready
  eventsMap.clear();
  seqCounter = 0;
}

export async function insertEvent(
  event: PadhaiEvent,
  status: SyncStatus = 'PENDING'
): Promise<void> {
  const storedEvent: StoredEvent = {
    ...event,
    sync_status: status,
    retry_count: 0,
    next_retry_at: 0,
  };
  eventsMap.set(event.event_id, storedEvent);
}

export async function listEvents(limit = 200): Promise<StoredEvent[]> {
  const allEvents = Array.from(eventsMap.values());
  // Sort by seq descending, then ts descending
  allEvents.sort((a, b) => {
    if (b.seq !== a.seq) return b.seq - a.seq;
    return new Date(b.ts).getTime() - new Date(a.ts).getTime();
  });
  return allEvents.slice(0, limit);
}

export async function pendingEvents(limit = 200): Promise<PadhaiEvent[]> {
  const now = Date.now();
  const pending: PadhaiEvent[] = [];
  
  for (const event of eventsMap.values()) {
    if ((event.sync_status === 'PENDING' || event.sync_status === 'ERROR') && 
        event.next_retry_at <= now) {
      pending.push(event);
    }
  }
  
  // Sort by seq ascending
  pending.sort((a, b) => a.seq - b.seq);
  return pending.slice(0, limit);
}

export async function markAcked(ids: string[]): Promise<void> {
  for (const id of ids) {
    const event = eventsMap.get(id);
    if (event) {
      event.sync_status = 'ACKED';
      event.retry_count = 0;
      eventsMap.set(id, event);
    }
  }
}

export async function markError(ids: string[]): Promise<void> {
  for (const id of ids) {
    const event = eventsMap.get(id);
    if (event) {
      const retry = event.retry_count + 1;
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s max
      const delay = Math.min(60_000, 1_000 * 2 ** Math.min(retry - 1, 6));
      event.sync_status = 'ERROR';
      event.retry_count = retry;
      event.next_retry_at = Date.now() + delay;
      eventsMap.set(id, event);
    }
  }
}

export async function markRejected(ids: string[], reason: string): Promise<void> {
  for (const id of ids) {
    const event = eventsMap.get(id);
    if (event) {
      event.sync_status = 'REJECTED';
      (event as any).reject_reason = reason;
      eventsMap.set(id, event);
    }
  }
}

export async function purgeProfile(profileId: string): Promise<void> {
  for (const [id, event] of eventsMap.entries()) {
    if (event.profile_id === profileId) {
      eventsMap.delete(id);
    }
  }
}