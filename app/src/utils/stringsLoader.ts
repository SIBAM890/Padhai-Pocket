/**
 * stringsLoader ΓÇö loads Odia UI strings from the bundled JSON.
 * Silent fallback to empty object on any error.
 */
import stringsOr from '../../../content/strings.or.json';

let cache: Record<string, string> | null = null;

export function getStrings(): Record<string, string> {
  if (cache) return cache;
  try {
    const raw = (stringsOr as unknown) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'string') out[k] = v;
    }
    cache = out;
    return cache;
  } catch {
    return {};
  }
}

export function t(key: string, fallback: string): string {
  try {
    const s = getStrings();
    const v = s[key];
    return typeof v === 'string' && v.length > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}
