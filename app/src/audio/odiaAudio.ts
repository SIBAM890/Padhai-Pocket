/**
 * PadhAI Pocket — Pure Odia Dialect Audio Service
 * Provides authentic Odia speech narration across Motion, Probes, Sound Check, and Remediation.
 */

import { Platform } from 'react-native';
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

export function playOdiaVoice({
  key,
  text,
  onStart,
  onEnd,
  onError,
}: PlayOdiaOptions): void {
  stopOdiaAudio();

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

  // Web Environment (Chrome, Edge, Safari, Firefox, Android Webview)
  if (typeof window !== 'undefined' && typeof (window as any).Audio !== 'undefined') {
    try {
      isAudioPlaying = true;
      onStart?.();

      const audio = new (window as any).Audio(ttsUrl);
      activeHtml5Audio = audio;

      audio.onended = () => {
        isAudioPlaying = false;
        activeHtml5Audio = null;
        onEnd?.();
      };

      audio.onerror = (e: any) => {
        console.warn('Odia audio playback error:', e);
        isAudioPlaying = false;
        activeHtml5Audio = null;
        onError?.(e);
        onEnd?.();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: any) => {
          console.warn('Audio play request blocked or failed:', err);
          isAudioPlaying = false;
          activeHtml5Audio = null;
          onError?.(err);
          onEnd?.();
        });
      }
      return;
    } catch (err) {
      console.warn('Failed to initialize HTML5 Audio for Odia voice:', err);
      isAudioPlaying = false;
      activeHtml5Audio = null;
      onError?.(err);
      onEnd?.();
      return;
    }
  }

  // Native Mobile fallback if expo-av is available
  try {
    const ExpoAV = require('expo-av');
    if (ExpoAV?.Audio?.Sound) {
      isAudioPlaying = true;
      onStart?.();
      ExpoAV.Audio.Sound.createAsync(
        { uri: ttsUrl },
        { shouldPlay: true }
      ).then(({ sound }: any) => {
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status?.didJustFinish) {
            isAudioPlaying = false;
            sound.unloadAsync().catch(() => {});
            onEnd?.();
          }
        });
      }).catch((e: any) => {
        console.warn('ExpoAV playAsync error:', e);
        isAudioPlaying = false;
        onError?.(e);
        onEnd?.();
      });
      return;
    }
  } catch {
    // expo-av not present
  }

  onEnd?.();
}
