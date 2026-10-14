/**
 * Odia Child-Safe Strings Loader for Padhai Pocket.
 * Provides offline-first localization dictionary loading and string retrieval.
 * Conforms to PRD §3.6 and FR-16 (Zero network, affirmative copy).
 */

export type StringKey = string;

let cachedOdiaStrings: Record<StringKey, string> | null = null;

/**
 * Loads the child-safe Odia localization dictionary.
 * Searches bundled content/strings/strings.or.json or content/strings.or.json.
 * Silent fallback to empty object on error. Zero network calls.
 */
export async function loadStrings(
  locale: 'or' | 'en' = 'or'
): Promise<Record<StringKey, string>> {
  try {
    if (locale !== 'or') {
      // English or alternate locales return empty dictionary (UI falls back to default labels)
      return {};
    }

    if (cachedOdiaStrings) {
      return cachedOdiaStrings;
    }

    let loaded: Record<StringKey, string> = {};

    try {
      // Primary location: content/strings.or.json
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      loaded = require('../../../content/strings.or.json');
    } catch {
      try {
        // Fallback nested location: content/strings/strings.or.json
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        loaded = require('../../../content/strings/strings.or.json');
      } catch {
        loaded = {};
      }
    }

    cachedOdiaStrings = loaded && typeof loaded === 'object' ? loaded : {};
    return cachedOdiaStrings;
  } catch {
    // Silent fallback on any error
    return {};
  }
}

/**
 * Translates a key using the provided strings map.
 * Returns the mapped string if present and non-empty, otherwise returns the fallback string.
 */
export function t(
  strings: Record<StringKey, string>,
  key: StringKey,
  fallback: string
): string {
  if (!strings || typeof strings !== 'object') {
    return fallback;
  }
  const value = strings[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return fallback;
}
