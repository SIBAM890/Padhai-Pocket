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

export const STORAGE_KEY = 'padhai_pocket_events_v1';

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
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function loadFromStorage(): Map<string, StoredEvent> {
  const map = new Map<string, StoredEvent>();
  if (!isLocalStorageAvailable()) return map;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredEvent[];
      if (Array.isArray(parsed)) {
        for (const ev of parsed) {
          if (ev && ev.event_id) {
            map.set(ev.event_id, ev);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load events from localStorage', err);
  }
  return map;
}

function saveToStorage(map: Map<string, StoredEvent>): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const arr = Array.from(map.values());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn('Failed to save events to localStorage', err);
  }
}

// In-memory cache synced with localStorage
let eventsMap: Map<string, StoredEvent> = loadFromStorage();

export async function getDatabase(): Promise<void> {
  return;
}

export async function initDatabase(): Promise<void> {
  eventsMap = loadFromStorage();
  notifyListeners();
}

export async function insertEvent(
  event: PadhaiEvent,
  status: SyncStatus = 'PENDING'
): Promise<void> {
  // Reload latest from storage in case another tab updated
  eventsMap = loadFromStorage();

  const storedEvent: StoredEvent = {
    ...event,
    sync_status: status,
    retry_count: 0,
    next_retry_at: 0,
  };

  eventsMap.set(event.event_id, storedEvent);
  saveToStorage(eventsMap);
  notifyListeners();
}

export async function listEvents(limit = 200): Promise<StoredEvent[]> {
  eventsMap = loadFromStorage();
  const allEvents = Array.from(eventsMap.values());

  // Sort by seq descending, then ts descending
  allEvents.sort((a, b) => {
    if (b.seq !== a.seq) return b.seq - a.seq;
    return new Date(b.ts).getTime() - new Date(a.ts).getTime();
  });

  return allEvents.slice(0, limit);
}

export async function pendingEvents(limit = 200): Promise<PadhaiEvent[]> {
  eventsMap = loadFromStorage();
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
  eventsMap = loadFromStorage();

  for (const id of ids) {
    const event = eventsMap.get(id);
    if (event) {
      event.sync_status = 'ACKED';
      event.retry_count = 0;
      event.next_retry_at = 0;
      eventsMap.set(id, event);
    }
  }

  saveToStorage(eventsMap);
  notifyListeners();
}

export async function markError(ids: string[]): Promise<void> {
  if (!ids.length) return;
  eventsMap = loadFromStorage();
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

  saveToStorage(eventsMap);
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
}

export async function purgeProfile(profileId: string): Promise<void> {
  eventsMap = loadFromStorage();
  let deleted = false;

  for (const [id, event] of eventsMap.entries()) {
    if (event.profile_id === profileId) {
      eventsMap.delete(id);
      deleted = true;
    }
  }

  if (deleted) {
    saveToStorage(eventsMap);
    notifyListeners();
  }
}

export async function clearAllEvents(): Promise<void> {
  eventsMap.clear();
  if (isLocalStorageAvailable()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  notifyListeners();
}