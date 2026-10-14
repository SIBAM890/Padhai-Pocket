import { detectNetworkMode } from '../network/network';
import { markAcked, markError, markRejected, pendingEvents } from '../db/database';
import type { PadhaiEvent } from '../types/events';
import * as SecureStore from 'expo-secure-store';

export interface SyncConfig {
  baseUrl: string;
  deviceId: string;
  token?: string;
}

export interface SyncResult {
  acked: number;
  duplicates: number;
  rejected: number;
  skipped: boolean;
}

const REGISTRATION_CODE = 'REG-DEMO-2026';

const isWeb = typeof window !== 'undefined';

async function getStoredToken(): Promise<string | null> {
  if (isWeb) {
    return window.localStorage.getItem('device_token');
  }
  return await SecureStore.getItemAsync('device_token');
}

async function storeToken(token: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem('device_token', token);
    return;
  }
  await SecureStore.setItemAsync('device_token', token);
}

/**
 * Registers the device with the backend and stores the returned token.
 * Call once per install (or when token is missing/expired).
 */
export async function registerDevice(
  baseUrl: string,
  deviceId: string,
  code: string = REGISTRATION_CODE
): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/devices/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device_id: deviceId }),
  });

  if (!response.ok) {
    throw new Error(`REGISTER_${response.status}`);
  }

  const data = (await response.json()) as { token: string };
  await storeToken(data.token);
  return data.token;
}

/**
 * Gets the stored device token, or registers if missing.
 * For demo, we skip registration and use a hardcoded dev token the backend accepts.
 * In production, this would call registerDevice().
 */
export async function getDeviceToken(baseUrl: string, deviceId: string): Promise<string> {
  const stored = await getStoredToken();
  if (stored) return stored;

  // Demo mode: use a dev token the backend accepts without registration
  // In production, uncomment the next line:
  // return registerDevice(baseUrl, deviceId);
  return 'dev-token-' + deviceId;
}

export async function syncPending(config: SyncConfig): Promise<SyncResult> {
  const mode = await detectNetworkMode(`${config.baseUrl}/healthz`);
  if (mode !== 'ONLINE') {
    return { acked: 0, duplicates: 0, rejected: 0, skipped: true };
  }

  const events = await pendingEvents(200);
  if (!events.length) {
    return { acked: 0, duplicates: 0, rejected: 0, skipped: false };
  }

  const ids = events.map((e) => e.event_id);
  try {
    const token = config.token ?? (await getDeviceToken(config.baseUrl, config.deviceId));
    const response = await fetch(`${config.baseUrl}/v1/sync/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ device_id: config.deviceId, events }),
    });

    if (response.status === 401 || response.status === 403) {
      await markRejected(ids, `AUTH_${response.status}`);
      return { acked: 0, duplicates: 0, rejected: ids.length, skipped: false };
    }

    if (!response.ok) {
      throw new Error(`SYNC_${response.status}`);
    }

    const data = (await response.json()) as {
      acked?: string[];
      duplicates?: string[];
      rejected?: Array<{ event_id: string; reason: string }>;
    };

    const acked = [...(data.acked ?? []), ...(data.duplicates ?? [])];
    await markAcked(acked);

    const rejected = (data.rejected ?? []).map((x) => x.event_id);
    if (rejected.length > 0) {
      await markRejected(rejected, 'SERVER_REJECTED');
    }

    return {
      acked: data.acked?.length ?? 0,
      duplicates: data.duplicates?.length ?? 0,
      rejected: rejected.length,
      skipped: false,
    };
  } catch (err: any) {
    // If not already marked rejected by 401/403
    await markError(ids);
    return { acked: 0, duplicates: 0, rejected: ids.length, skipped: false };
  }
}
