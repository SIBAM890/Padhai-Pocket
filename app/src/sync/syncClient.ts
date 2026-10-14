import { detectNetworkMode } from '../network/network';
import { markAcked, markError, pendingEvents, purgeProfile } from '../db/database';
import type { PadhaiEvent } from '../types/events';

export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

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
}

export function getDeviceCredentials() {
  return { deviceId: storedDeviceId, token: storedDeviceToken };
}

/**
 * POST /v1/devices/register
 */
export async function registerDevice(
  code: string,
  deviceId: string = storedDeviceId,
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<RegisterResult> {
  try {
    const response = await fetch(`${baseUrl}/v1/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, device_id: deviceId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: errData?.message || `REGISTRATION_FAILED_${response.status}`,
      };
    }

    const data = (await response.json()) as { device_id: string; token: string };
    setDeviceCredentials(data.device_id, data.token);
    return { ok: true, deviceId: data.device_id, token: data.token };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'NETWORK_ERROR' };
  }
}

/**
 * POST /v1/sync/events
 */
export async function syncPending(config?: SyncConfig): Promise<SyncResult> {
  const baseUrl = config?.baseUrl || DEFAULT_API_BASE_URL;
  const deviceId = config?.deviceId || storedDeviceId;
  const token = config?.token || storedDeviceToken;

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
    const response = await fetch(`${baseUrl}/v1/sync/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ device_id: deviceId, events }),
    });

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
    await markError(rejected);

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
 */
export async function getTeacherSummary(
  config?: SyncConfig
): Promise<TeacherSummaryResult> {
  const baseUrl = config?.baseUrl || DEFAULT_API_BASE_URL;
  const token = config?.token || storedDeviceToken;

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
 */
export async function purgeProfileOnServer(
  profileId: string,
  config?: SyncConfig
): Promise<PurgeResult> {
  const baseUrl = config?.baseUrl || DEFAULT_API_BASE_URL;
  const token = config?.token || storedDeviceToken;

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
    return {
      ok: false,
      profileId,
      purgedEventsCount: 0,
      error: err?.message || 'NETWORK_ERROR',
    };
  }
}
