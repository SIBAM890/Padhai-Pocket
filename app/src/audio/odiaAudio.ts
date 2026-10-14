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
let activeExpoSound: any = null;
let isAudioPlaying = false;

export function isOdiaAudioPlaying(): boolean {
  return isAudioPlaying;
}

export function stopOdiaAudio(): void {
  isAudioPlaying = false;
  if (activeHtml5Audio) {
    try {
      activeHtml5Audio.pause();
      activeHtml5Audio.currentTime = 0;
    } catch {}
    activeHtml5Audio = null;
  }
  if (activeExpoSound) {
    try {
      activeExpoSound.stopAsync().catch(() => {});
      activeExpoSound.unloadAsync().catch(() => {});
    } catch {}
    activeExpoSound = null;
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

async function playNativeAudio(
  soundSource: string,
  key?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  try {
    const ExpoAV = require('expo-av');
    if (!ExpoAV?.Audio?.Sound) {
      onEnd?.();
      return;
    }

    try {
      await ExpoAV.Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch {}

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

    isAudioPlaying = true;
    onStart?.();

    const { sound } = await ExpoAV.Audio.Sound.createAsync(
      { uri: playableUri },
      { shouldPlay: true }
    );
    activeExpoSound = sound;

    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status?.didJustFinish || status?.error) {
        isAudioPlaying = false;
        activeExpoSound = null;
        sound.unloadAsync().catch(() => {});
        onEnd?.();
      }
    });
  } catch (err) {
    console.warn('Native Audio.Sound error:', err);
    isAudioPlaying = false;
    activeExpoSound = null;
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

    const audio = new (window as any).Audio(soundSource);
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
