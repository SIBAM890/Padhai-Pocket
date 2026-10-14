import { detectNetworkMode } from '../network/network';
import { markAcked, markError, pendingEvents, purgeProfile } from '../db/database';
import type { PadhaiEvent } from '../types/events';
import * as SecureStore from 'expo-secure-store';

export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const REGISTRATION_CODE = 'REG-DEMO-2026';

export interface SyncConfig {
  baseUrl?: string;
  deviceId?: string;
  token?: string;
}

export interface SyncResult {
  acked: number;
  duplicates: number;
  rejected: number;
  skipped: boolean;
  error?: string;
}

export interface RegisterResult {
  ok: boolean;
  deviceId?: string;
  token?: string;
  error?: string;
}

export interface TeacherSummaryResult {
  ok: boolean;
  deviceId?: string;
  profiles?: Array<{
    profile_id: string;
    labels: Record<string, number>;
    mastery: Record<string, number>;
  }>;
  error?: string;
}

export interface PurgeResult {
  ok: boolean;
  profileId: string;
  purgedEventsCount: number;
  error?: string;
}

/**
 * Global stored device credentials for active session
 */
let storedDeviceId = 'dev_tab_01';
let storedDeviceToken: string | undefined = undefined;

export function setDeviceCredentials(deviceId: string, token?: string) {
  storedDeviceId = deviceId;
  storedDeviceToken = token;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('device_token', token);
        window.localStorage.setItem(`device_token_${deviceId}`, token);
      }
    }
  } catch {}
}

export function getDeviceCredentials() {
  return { deviceId: storedDeviceId, token: storedDeviceToken };
}

/**
 * Helper to determine best backend URL:
 * - explicit config URL if supplied
 * - EXPO_PUBLIC_API_URL env var if supplied
 * - on web browser: window.location.origin (for Metro reverse-proxy to FastAPI)
 * - fallback: http://localhost:8000
 */
export function resolveApiBaseUrl(customUrl?: string): string {
  if (customUrl) return customUrl;
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // If served via static server (e.g. port 3000, 3001, 3005) or standalone web, backend is on port 8000
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.port && window.location.port !== '8000') {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    if (window.location.origin) {
      return window.location.origin;
    }
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Gets the stored device token, or automatically registers if missing.
 */
export async function getDeviceToken(
  baseUrl: string = DEFAULT_API_BASE_URL,
  deviceId: string = storedDeviceId
): Promise<string> {
  // 1. Check existing token in memory, SecureStore, or localStorage and validate
  try {
    const existing =
      storedDeviceToken ||
      (await SecureStore.getItemAsync('device_token').catch(() => null)) ||
      (typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(`device_token_${deviceId}`) ||
          window.localStorage.getItem('device_token')
        : null);

    if (existing && existing.startsWith('tok_')) {
      try {
        const probe = await fetch(`${baseUrl}/v1/summary`, {
          headers: { Authorization: `Bearer ${existing}` },
        });
        if (probe.ok || probe.status === 404) {
          storedDeviceToken = existing;
          return existing;
        }
      } catch {}
    }
  } catch {}

  // 2. Auto-register device with backend using standard or backup registration code
  try {
    let reg = await registerDevice(REGISTRATION_CODE, deviceId, baseUrl);
    if (!reg.ok) {
      // Try backup seeded registration code
      reg = await registerDevice('PADHAI-DEMO-2026', deviceId, baseUrl);
    }
    if (reg.ok && reg.token) {
      storedDeviceToken = reg.token;
      return reg.token;
    }
  } catch (e) {
    console.warn('Auto-registration failed or backend offline:', e);
  }

  // Pre-seeded demo device fallback matching backend seed_demo.py
  const DEMO_DEVICE = 'dev_tab_01';
  const DEMO_TOKEN = 'tok_dev_tab_01';
  setDeviceCredentials(DEMO_DEVICE, DEMO_TOKEN);
  return DEMO_TOKEN;
}

/**
 * Registers the device with the backend and stores the returned token.
 * Supports both signatures:
 *  - registerDevice(baseUrl, deviceId, code)
 *  - registerDevice(code, deviceId, baseUrl)
 */
export async function registerDevice(
  firstParam: string = REGISTRATION_CODE,
  deviceId: string = storedDeviceId,
  thirdParam?: string
): Promise<RegisterResult> {
  let baseUrl = DEFAULT_API_BASE_URL;
  let code = REGISTRATION_CODE;
  let devId = deviceId;

  if (firstParam.startsWith('http://') || firstParam.startsWith('https://')) {
    baseUrl = firstParam;
    code = thirdParam || REGISTRATION_CODE;
  } else {
    code = firstParam;
    if (thirdParam) baseUrl = thirdParam;
  }

  try {
    const response = await fetch(`${baseUrl}/v1/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, device_id: devId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: errData?.detail || errData?.message || `REGISTRATION_FAILED_${response.status}`,
      };
    }

    const data = (await response.json()) as { device_id?: string; token: string };
    const returnedDeviceId = data.device_id || devId;
    setDeviceCredentials(returnedDeviceId, data.token);

    try {
      await SecureStore.setItemAsync('device_token', data.token);
    } catch {}

    return { ok: true, deviceId: returnedDeviceId, token: data.token };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'NETWORK_ERROR' };
  }
}

/**
 * POST /v1/sync/events
 * Batch event upload with idempotency, ACKED/DUPLICATES handling, and 401/403 stop rules.
 */
export async function syncPending(config?: SyncConfig): Promise<SyncResult> {
  const baseUrl = config?.baseUrl || resolveApiBaseUrl();
  const deviceId = config?.deviceId || storedDeviceId;

  const mode = await detectNetworkMode(`${baseUrl}/healthz`);
  if (mode !== 'ONLINE') {
    return { acked: 0, duplicates: 0, rejected: 0, skipped: true };
  }

  const events = await pendingEvents(200);
  if (!events.length) {
    return { acked: 0, duplicates: 0, rejected: 0, skipped: false };
  }

  const ids = events.map((e) => e.event_id);
  try {
    const token = config?.token ?? (await getDeviceToken(baseUrl, deviceId));
    const response = await fetch(`${baseUrl}/v1/sync/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ device_id: deviceId, events }),
    });

    // Handle 401/403 auth errors: stop retries and clear stale token
    if (response.status === 401 || response.status === 403) {
      storedDeviceToken = undefined;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('device_token');
          window.localStorage.removeItem(`device_token_${deviceId}`);
        }
      } catch {}
      return {
        acked: 0,
        duplicates: 0,
        rejected: 0,
        skipped: true,
        error: `AUTH_${response.status}`,
      };
    }

    if (!response.ok) {
      throw new Error(`SYNC_${response.status}`);
    }

    const data = (await response.json()) as {
      acked?: string[];
      duplicates?: string[];
      rejected?: Array<{ event_id: string; reason: string }>;
    };

    // ACK both newly acknowledged and duplicate events
    const acked = [...(data.acked ?? []), ...(data.duplicates ?? [])];
    await markAcked(acked);

    // Mark rejected events
    const rejected = (data.rejected ?? []).map((x) => x.event_id);
    if (rejected.length > 0) {
      await markError(rejected);
    }

    return {
      acked: data.acked?.length ?? 0,
      duplicates: data.duplicates?.length ?? 0,
      rejected: rejected.length,
      skipped: false,
    };
  } catch (err: any) {
    await markError(ids);
    return {
      acked: 0,
      duplicates: 0,
      rejected: ids.length,
      skipped: false,
      error: err?.message,
    };
  }
}

/**
 * GET /v1/summary
 * Queries live diagnostic cohort summary from backend.
 */
export async function getTeacherSummary(
  config?: SyncConfig
): Promise<TeacherSummaryResult> {
  const baseUrl = config?.baseUrl || resolveApiBaseUrl();
  const deviceId = config?.deviceId || storedDeviceId;
  const token = config?.token || (await getDeviceToken(baseUrl, deviceId));

  try {
    const response = await fetch(`${baseUrl}/v1/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `SUMMARY_${response.status}`,
      };
    }

    const data = (await response.json()) as {
      device_id: string;
      profiles: Array<{
        profile_id: string;
        labels: Record<string, number>;
        mastery: Record<string, number>;
      }>;
    };

    return {
      ok: true,
      deviceId: data.device_id,
      profiles: data.profiles,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'NETWORK_ERROR',
    };
  }
}

/**
 * DELETE /v1/profiles/{id}
 * Server-side audit-logged purge & local event purge.
 */
export async function purgeProfileOnServer(
  profileId: string,
  config?: SyncConfig
): Promise<PurgeResult> {
  const baseUrl = config?.baseUrl || resolveApiBaseUrl();
  const deviceId = config?.deviceId || storedDeviceId;
  const token = config?.token || (await getDeviceToken(baseUrl, deviceId));

  try {
    const response = await fetch(`${baseUrl}/v1/profiles/${profileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        profileId,
        purgedEventsCount: 0,
        error: `PURGE_${response.status}`,
      };
    }

    const data = (await response.json()) as {
      ok: boolean;
      profile_id: string;
      purged_events_count: number;
    };

    // Also purge locally
    await purgeProfile(profileId);

    return {
      ok: true,
      profileId: data.profile_id,
      purgedEventsCount: data.purged_events_count,
    };
  } catch (err: any) {
    // Purge locally even if backend is offline
    await purgeProfile(profileId);
    return {
      ok: false,
      profileId,
      purgedEventsCount: 0,
      error: err?.message || 'NETWORK_ERROR',
    };
  }
}
