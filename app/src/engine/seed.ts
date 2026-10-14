/**
 * PRD v4.0 §4.9 Determinism Spec (mulberry32 and seeded Fisher-Yates)
 *
 * References:
 * seed   = uint32 from the first 4 bytes (big-endian) of SHA-256("<profile_id>|<concept_id>|<set_id>")
 * PRNG   = mulberry32(seed)
 * shuffle= Fisher-Yates over ["P","A","T"]:
 *          for i = 2 down to 1:
 *            j = floor(rnd() * (i+1));
 *            swap(a[i], a[j])
 */

import { sha256Bytes } from './sha256';

/**
 * PRD §4.9: compute deterministic probe seed.
 * seed = uint32 (big-endian first 4 bytes) of SHA-256("<profileId>|<conceptId>|<setId>").
 * Same learner, same concept, same set → same probe order every session.
 * Uses Web Crypto when available, with pure-JS SHA-256 fallback for Hermes / JSC / offline.
 *
 * Reference test: computeSeed('prof_demo_01','distance_vs_displacement','A') === 1806635391
 */
export async function computeSeed(
  profileId: string,
  conceptId: string,
  setId: string
): Promise<number> {
  const key = `${profileId}|${conceptId}|${setId}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(key);

  let hash: Uint8Array;

  // Prefer Web Crypto on Web / Node (fast, native)
  if (typeof crypto !== 'undefined' && crypto?.subtle?.digest) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      hash = new Uint8Array(hashBuffer);
    } catch {
      hash = sha256Bytes(data); // pure-JS fallback
    }
  } else {
    // Native Hermes/JSC: pure-JS SHA-256 (byte-identical to Web Crypto)
    hash = sha256Bytes(data);
  }

  // big-endian uint32 from first 4 bytes
  return ((hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3]) >>> 0;
}

/**
 * 32-bit PRNG generating floats in [0, 1)
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function (): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t ^= (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher-Yates shuffle over an array of modalities.
 * Does not mutate original array.
 */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  const rnd = mulberry32(seed);
  for (let i = result.length - 1; i >= 1; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/**
 * Standard probe modalities shuffle for ["P", "A", "T"]
 */
export function probeOrder(seed: number): Array<'P' | 'A' | 'T'> {
  return seededShuffle<'P' | 'A' | 'T'>(['P', 'A', 'T'], seed);
}