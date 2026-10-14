/**
 * PadhAI Pocket — Web-Compatible Local Event Store
 * 
 * Implements full SQLite schema semantics over localStorage:
 * - Storage key: 'padhai_pocket_events_v1'
 * - Survives browser reload / page refresh
 * - Reactive subscription via subscribeDatabase()
 * - Exponential backoff: 2s -> 4s -> 8s -> 16s -> 30s cap
 */

import type { PadhaiEvent, StoredEvent, SyncStatus } from '../types/events';

export const STORAGE_KEY = 'padhai_events';

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeDatabase(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  for (const l of listeners) {
    try {
      l();
    } catch (e) {
      console.warn('Listener error', e);
    }
  }
}

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function persistEvents(map: Map<string, StoredEvent>): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem('padhai_events', JSON.stringify(Array.from(map.entries())));
  } catch (err) {
    console.warn('Failed to persist events to localStorage', err);
  }
}

// Module load: initialize eventsMap from localStorage ('padhai_events')
const stored = isLocalStorageAvailable() ? window.localStorage.getItem('padhai_events') : null;
let eventsMap: Map<string, StoredEvent> = new Map(stored ? JSON.parse(stored) : []);

export async function getDatabase(): Promise<void> {
  return;
}

export async function initDatabase(): Promise<void> {
  // Do NOT clear eventsMap — preserve persisted events across refresh
  if (isLocalStorageAvailable()) {
    const fresh = window.localStorage.getItem('padhai_events');
    if (fresh) {
      try {
        eventsMap = new Map(JSON.parse(fresh));
      } catch (err) {
        console.warn('Failed to parse padhai_events on init', err);
      }
    }
  }
  notifyListeners();
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
  persistEvents(eventsMap);
  notifyListeners();
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
    if (
      (event.sync_status === 'PENDING' || event.sync_status === 'ERROR') &&
      event.next_retry_at <= now
    ) {
      pending.push(event);
    }
  }

  // Sort by seq ascending for FIFO order upload
  pending.sort((a, b) => a.seq - b.seq);
  return pending.slice(0, limit);
}

export async function markAcked(ids: string[]): Promise<void> {
  if (!ids.length) return;

  for (const id of ids) {
    const event = eventsMap.get(id);
    if (event) {
      event.sync_status = 'ACKED';
      event.retry_count = 0;
      event.next_retry_at = 0;
      eventsMap.set(id, event);
    }
  }

  persistEvents(eventsMap);
  notifyListeners();
}

export async function markError(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const now = Date.now();

  for (const id of ids) {
    const event = eventsMap.get(id);
    if (event) {
      const retry = (event.retry_count ?? 0) + 1;
      // Exponential backoff: 2s -> 4s -> 8s -> 16s -> 30s max cap
      const delay = Math.min(30_000, 2_000 * 2 ** Math.min(retry - 1, 4));
      event.sync_status = 'ERROR';
      event.retry_count = retry;
      event.next_retry_at = now + delay;
      eventsMap.set(id, event);
    }
  }

  persistEvents(eventsMap);
  notifyListeners();
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

  persistEvents(eventsMap);
  notifyListeners();
}

export async function purgeProfile(profileId: string): Promise<void> {
  let deleted = false;

  for (const [id, event] of eventsMap.entries()) {
    if (event.profile_id === profileId) {
      eventsMap.delete(id);
      deleted = true;
    }
  }

  if (deleted) {
    persistEvents(eventsMap);
    notifyListeners();
  }
}

export async function clearAllEvents(): Promise<void> {
  eventsMap.clear();
  persistEvents(eventsMap);
  notifyListeners();
}