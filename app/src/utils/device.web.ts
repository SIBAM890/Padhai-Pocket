/**
 * Device utilities — Web-compatible version using localStorage
 * Metro automatically picks .web.ts for web bundles.
 */

const DEVICE_ID_KEY = 'device_id';

/**
 * Generates a UUID v4 (RFC 4122).
 * Uses Math.random() — allowed because this produces an identifier, not a decision.
 */
export function uuidv4(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a stable device ID.
 * Persisted in localStorage so it survives page reloads.
 */
export async function getDeviceId(): Promise<string> {
  // Check localStorage first
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  // Generate new device ID (prefix + UUID v4)
  const deviceId = `dev-${uuidv4()}`;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

/**
 * Clears the device ID (for testing only).
 */
export async function clearDeviceId(): Promise<void> {
  localStorage.removeItem(DEVICE_ID_KEY);
}