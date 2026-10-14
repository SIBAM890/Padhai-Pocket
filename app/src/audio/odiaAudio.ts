/**
 * PadhAI Pocket — Pure Odia Dialect Audio Service
 * Provides authentic Odia speech narration across Motion, Probes, Sound Check, and Remediation.
 * 100% offline-first: Pre-rendered base64 audio is embedded for instant playback on Web and Mobile.
 */

import { Platform } from 'react-native';
import { ODIA_AUDIO_BASE64 } from './odiaAudioData';
import { resolveApiBaseUrl } from '../sync/syncClient';

export type OdiaAudioKey =
  | 'motion'
  | 'sound_check'
  | 'probe_audio'
  | 'gravitation'
  | 'remediation'
  | 'chemistry'
  | 'biology'
  | 'maths';

let activeHtml5Audio: any = null;
let activeNativePlayer: any = null;
let isAudioPlaying = false;

export function isOdiaAudioPlaying(): boolean {
  return isAudioPlaying;
}

export function stopOdiaAudio(): void {
  isAudioPlaying = false;

  // Stop Web Audio
  if (activeHtml5Audio) {
    try {
      activeHtml5Audio.pause();
      activeHtml5Audio.currentTime = 0;
    } catch {}
    activeHtml5Audio = null;
  }

  // Stop Native Player (expo-audio)
  if (activeNativePlayer) {
    try {
      if (typeof activeNativePlayer.pause === 'function') {
        activeNativePlayer.pause();
      }
      if (typeof activeNativePlayer.remove === 'function') {
        activeNativePlayer.remove();
      }
    } catch {}
    activeNativePlayer = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export interface PlayOdiaOptions {
  key?: OdiaAudioKey;
  text?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Safely checks if the ExpoAudio native module is registered in the current native binary.
 * Uses requireOptionalNativeModule to avoid unhandled native exceptions.
 */
function isExpoAudioAvailable(): boolean {
  try {
    const { requireOptionalNativeModule } = require('expo-modules-core');
    if (typeof requireOptionalNativeModule === 'function') {
      const nativeMod = requireOptionalNativeModule('ExpoAudio');
      return !!nativeMod;
    }
  } catch {}
  return false;
}

/**
 * Safely resolves the expo-audio module if its native component is available.
 */
function getExpoAudio(): any {
  try {
    if (isExpoAudioAvailable()) {
      const mod = require('expo-audio');
      if (mod && (typeof mod.createAudioPlayer === 'function' || mod.AudioModule)) {
        return mod;
      }
    }
  } catch {}
  return null;
}

async function playNativeAudio(
  soundSource: string,
  key?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  try {
    const expoAudio = getExpoAudio();

    if (!expoAudio) {
      if (__DEV__) {
        console.warn('[odiaAudio] ExpoAudio native module not detected in this client. Gracefully skipping native playback.');
      }
      onEnd?.();
      return;
    }

    let playableUri = soundSource;

    // If source is a base64 data URI, write to local cache file for ExoPlayer
    if (soundSource.startsWith('data:audio')) {
      try {
        const FileSystem = require('expo-file-system');
        if (FileSystem?.cacheDirectory) {
          const match = soundSource.match(/data:audio\/[^;]+;base64,(.+)/);
          if (match && match[1]) {
            const fileName = key ? `odia_${key}.mp3` : `odia_${Date.now()}.mp3`;
            const targetPath = `${FileSystem.cacheDirectory}${fileName}`;
            const fileInfo = await FileSystem.getInfoAsync(targetPath);
            if (!fileInfo.exists) {
              await FileSystem.writeAsStringAsync(targetPath, match[1], {
                encoding: FileSystem.EncodingType.Base64,
              });
            }
            playableUri = targetPath;
          }
        }
      } catch (fsErr) {
        console.warn('FileSystem audio cache write warning:', fsErr);
      }
    }

    if (expoAudio && typeof expoAudio.createAudioPlayer === 'function') {
      isAudioPlaying = true;
      onStart?.();

      const player = expoAudio.createAudioPlayer(playableUri);
      activeNativePlayer = player;
      player.play();

      if (typeof player.addListener === 'function') {
        const sub = player.addListener('playbackStatusUpdate', (status: any) => {
          if (status?.didJustFinish || status?.playbackState === 'ended') {
            isAudioPlaying = false;
            activeNativePlayer = null;
            try { player.remove(); } catch {}
            try { sub.remove(); } catch {}
            onEnd?.();
          }
        });
      }
      return;
    }

    onEnd?.();
  } catch (err) {
    console.warn('playNativeAudio exception safely handled:', err);
    isAudioPlaying = false;
    activeNativePlayer = null;
    onError?.(err);
    onEnd?.();
  }
}

function playWebAudio(
  soundSource: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (typeof window === 'undefined' || typeof (window as any).Audio === 'undefined') {
    onEnd?.();
    return;
  }

  try {
    isAudioPlaying = true;
    onStart?.();

    const audio = new (window as any).Audio();
    audio.src = soundSource;
    audio.preload = 'auto';
    activeHtml5Audio = audio;

    audio.onended = () => {
      isAudioPlaying = false;
      activeHtml5Audio = null;
      onEnd?.();
    };

    audio.onerror = (e: any) => {
      console.warn('HTML5 Audio playback error:', e);
      isAudioPlaying = false;
      activeHtml5Audio = null;
      onError?.(e);
      onEnd?.();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err: any) => {
        console.warn('HTML5 Audio play failed or blocked by autoplay policy:', err);
        isAudioPlaying = false;
        activeHtml5Audio = null;
        onError?.(err);
        onEnd?.();
      });
    }
  } catch (err) {
    console.warn('Failed to initialize HTML5 Audio:', err);
    isAudioPlaying = false;
    activeHtml5Audio = null;
    onError?.(err);
    onEnd?.();
  }
}

export function playOdiaVoice({
  key,
  text,
  onStart,
  onEnd,
  onError,
}: PlayOdiaOptions): void {
  stopOdiaAudio();

  // 1. Instant Offline Playback via Pre-rendered Embedded Base64 Data URI
  if (key && ODIA_AUDIO_BASE64[key]) {
    const dataUri = ODIA_AUDIO_BASE64[key];
    if (Platform.OS === 'web') {
      playWebAudio(dataUri, onStart, onEnd, onError);
    } else {
      playNativeAudio(dataUri, key, onStart, onEnd, onError);
    }
    return;
  }

  // 2. Dynamic synthesis via Backend TTS endpoint
  const baseUrl = resolveApiBaseUrl();
  let ttsUrl = '';
  if (key) {
    ttsUrl = `${baseUrl}/v1/tts?key=${encodeURIComponent(key)}`;
  } else if (text) {
    ttsUrl = `${baseUrl}/v1/tts?text=${encodeURIComponent(text.trim())}`;
  } else {
    onEnd?.();
    return;
  }

  if (Platform.OS === 'web') {
    playWebAudio(ttsUrl, onStart, onEnd, onError);
  } else {
    playNativeAudio(ttsUrl, key, onStart, onEnd, onError);
  }
}
