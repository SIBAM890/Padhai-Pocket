/**
 * Audio Chimes Service for Padhai Pocket.
 * Provides auditory cues for student responses:
 * - playCorrectChime(): plays when a student gets an item correct
 * - playRetryChime(): plays when a student needs another try
 * - playCompleteChime(): plays when a lesson/episode is completed
 * - unloadAllChimes(): unloads sound instances to release audio resources
 *
 * NOTE: If expo-av is not present in package.json, this service gracefully
 * falls back to a zero-dependency stub that logs a warning in __DEV__ and resolves cleanly.
 */

declare const __DEV__: boolean;

interface SoundInstance {
  playAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
}

// In-memory cache for Audio.Sound instances to prevent redundant re-loading
const soundCache: Record<string, SoundInstance | null> = {
  correct: null,
  retry: null,
  complete: null,
};

let expoAudioModule: { Audio?: { Sound: { createAsync: (source: unknown) => Promise<{ sound: SoundInstance }> } } } | null = null;
let attemptedRequire = false;

function getAudioModule() {
  if (!attemptedRequire) {
    attemptedRequire = true;
    try {
      // Dynamic require ensures no build or compile errors when expo-av is uninstalled
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      expoAudioModule = require('expo-av');
    } catch {
      expoAudioModule = null;
    }
  }
  return expoAudioModule?.Audio;
}

/**
 * Plays the cheerful correct-answer chime.
 */
export async function playCorrectChime(): Promise<void> {
  try {
    const audio = getAudioModule();
    if (!audio) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[chimes] playCorrectChime: expo-av not in package.json, stubbed no-op.');
      }
      return Promise.resolve();
    }

    if (!soundCache.correct) {
      const { sound } = await audio.Sound.createAsync(
        require('./chimeAssets/correct.opus')
      );
      soundCache.correct = sound;
    }
    await soundCache.correct?.playAsync();
  } catch {
    // Silent fail on any error (no throw rule)
  }
}

/**
 * Plays the gentle retry/encouragement chime.
 */
export async function playRetryChime(): Promise<void> {
  try {
    const audio = getAudioModule();
    if (!audio) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[chimes] playRetryChime: expo-av not in package.json, stubbed no-op.');
      }
      return Promise.resolve();
    }

    if (!soundCache.retry) {
      const { sound } = await audio.Sound.createAsync(
        require('./chimeAssets/retry.opus')
      );
      soundCache.retry = sound;
    }
    await soundCache.retry?.playAsync();
  } catch {
    // Silent fail on any error (no throw rule)
  }
}

/**
 * Plays the celebratory lesson-complete chime.
 */
export async function playCompleteChime(): Promise<void> {
  try {
    const audio = getAudioModule();
    if (!audio) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[chimes] playCompleteChime: expo-av not in package.json, stubbed no-op.');
      }
      return Promise.resolve();
    }

    if (!soundCache.complete) {
      const { sound } = await audio.Sound.createAsync(
        require('./chimeAssets/complete.opus')
      );
      soundCache.complete = sound;
    }
    await soundCache.complete?.playAsync();
  } catch {
    // Silent fail on any error (no throw rule)
  }
}

/**
 * Releases all cached Audio.Sound instances.
 */
export async function unloadAllChimes(): Promise<void> {
  try {
    for (const key of Object.keys(soundCache)) {
      if (soundCache[key]) {
        await soundCache[key]?.unloadAsync().catch(() => {});
        soundCache[key] = null;
      }
    }
  } catch {
    // Silent fail
  }
}
