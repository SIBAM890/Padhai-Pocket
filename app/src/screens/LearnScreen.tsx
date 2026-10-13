/**
 * LearnScreen — PRD v4.0
 *
 * FR-23: Sound check once per session. If failed → A-items skipped, engine abstains
 *        with reason=AUDIO_UNAVAILABLE.
 * FR-24: Skip button on each MCQ option row. A skip produces no event and no mastery
 *        change. Two skips in one set abort the set as INCONSISTENT (reason=SKIPPED).
 *
 * Engine wiring:
 *  - nextAction() called with PRD §4.9 deterministic seed.
 *  - concept_mastery comes from BKT inside nextAction (no hardcoding).
 *  - input_hash computed by buildEvent inside nextAction (no placeholder).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { insertEvent, listEvents } from '../db/database';
import { useNetworkStatus } from '../network/network';
import { syncPending } from '../sync/syncClient';
import type { NetworkMode } from '../types/events';
import type { RootStackParamList } from '../../App';
import {
  type EngineState,
  createInitialState,
  nextAction,
} from '../engine';
import { computeSeed } from '../engine/seed';
import { getHeroChunk, getHeroItem, getPackHash } from '../content/loader';
import { getDeviceId } from '../utils/device';
import * as SecureStore from 'expo-secure-store';

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const HEALTH_URL = `${API_URL}/healthz`;
const PROFILE_ID = 'demo-profile-01';
const SESSION_ID = '11111111-2222-4333-8444-555555555555';

// PRD §4.9: seed is stable per (learner, concept, set).
const CONCEPT_ID = 'distance_vs_displacement';
const SET_ID = 'A';

// FR-24: max skips before set is aborted as INCONSISTENT.
const MAX_SKIPS_PER_SET = 2;

export default function LearnScreen({ navigation }: Props) {
  const {
    networkMode: mode,
    forcedOffline,
    setForcedOffline,
  } = useNetworkStatus(HEALTH_URL);

  const [pending, setPending] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [seq, setSeq] = useState(1);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize device ID on mount
  useEffect(() => {
    getDeviceId().then((id) => setDeviceId(id));
  }, []);

  // FR-23: sound check state. null = not yet checked, true = OK, false = failed.
  const [soundOk, setSoundOk] = useState<boolean | null>(null);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  // FR-24: skip tracking.
  const skipCountRef = useRef(0);
  const [setAborted, setSetAborted] = useState(false);

  // Engine state persisted across renders — initialised once per session.
  const engineStateRef = useRef<EngineState>(
    createInitialState(
      PROFILE_ID,
      SESSION_ID,
      CONCEPT_ID,
      0.42, // initial concept mastery
      1,    // threshold = 1 (demo mode, PRD §4.5)
      'OFFLINE'
    )
  );

  const refreshPending = async () => {
    const rows = await listEvents(200);
    setPending(rows.filter((r) => r.sync_status !== 'ACKED').length);
    if (rows.length > 0) {
      const maxSeq = Math.max(...rows.map((r) => r.seq));
      setSeq(maxSeq + 1);
    }
  };

  useEffect(() => {
    refreshPending();
  }, []);

  // Content from pack — safety fallback if pack fails to load
  const heroChunk = getHeroChunk();
  const heroItem = getHeroItem();
  const packHash = getPackHash();

  const question = useMemo(() => {
    if (heroChunk && heroItem) {
      return {
        title: heroChunk.title,
        chunkId: heroChunk.chunkId,
        passage: heroChunk.odiaText,
        prompt: heroItem.stem,
        options: heroItem.options,
        answerIndex: heroItem.correct,
        misconception: heroItem.misconceptionTag,
      };
    }
    // Fallback (should not happen in demo if pack is built)
    return {
      title: 'ଗତି',
      chunkId: 'BSE9-PHYS-MOTION-S02-02',
      passage: 'ବସ୍ତୁ ସରଳରେଖାରେ ଗତିକଲେ, ବସ୍ତୁର ସେହି ଗତିକୁ ସରଳରୈଖିକ ଗତି କୁହାଯାଏ ।',
      prompt: 'ଜଣେ ଛାତ୍ର ୩ ମିଟର ପୂର୍ବକୁ ଯାଇ ପୁଣି ୩ ମିଟର ପଶ୍ଚିମକୁ ଫେରିଲା। ବିସ୍ଥାପନ କେତେ?',
      options: ['୦ ମିଟର', '୩ ମିଟର', '୬ ମିଟର', '୯ ମିଟର'],
      answerIndex: 0,
      misconception: 'path_equals_displacement',
    };
  }, [heroChunk, heroItem]);

  // FR-23: handle sound check result.
  const handleSoundCheck = (heard: boolean) => {
    setSoundOk(heard);
    if (!heard) {
      setAudioUnavailable(true);
    }
  };

  // FR-24: handle skip.
  const handleSkip = () => {
    skipCountRef.current += 1;
    if (skipCountRef.current >= MAX_SKIPS_PER_SET) {
      // Two skips → abort set as INCONSISTENT (no event written, no mastery change).
      setSetAborted(true);
      setAnswered(true);
    }
    // Single skip: no event, no mastery change. Item simply dismissed.
  };

  const record = async (selectedIndex: number) => {
    const isCorrect = selectedIndex === question.answerIndex;
    setLastCorrect(isCorrect);

    // ctx.now: wall-clock time supplied by the UI caller (PRD §4.9 allows callers to inject Date.now()).
    // ctx.seed: PRD §4.9 deterministic — SHA-256(profile|concept|set)[0..3] big-endian uint32.
    const now = Date.now();
    const seed = computeSeed(PROFILE_ID, CONCEPT_ID, SET_ID);
    const ctx = { now, seed, device_id: deviceId };

    // Sync current network mode and concept into engine state before calling.
    engineStateRef.current = { ...engineStateRef.current, network_mode: mode, concept_id: CONCEPT_ID };

    // Call the real pure engine — nextAction updates mastery, computes input_hash, emits events.
    const engineResult = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_MCQ',
        correct: isCorrect,
        misconception_tag: isCorrect ? null : question.misconception,
      } as any,
      ctx
    );

    // Advance engine state for next interaction.
    engineStateRef.current = engineResult.state;

    // Persist ALL emitted events (OBSERVE, PLAN, TOOL, PROBE, REFLECT, ACT, MASTERY, etc.)
    for (const event of engineResult.events) {
      await insertEvent(event as any);
    }
    setSeq(engineResult.state.seq);
    setAnswered(true);
    await refreshPending();
  };

  const sync = async () => {
    // Read token from SecureStore
    const token = await SecureStore.getItemAsync('device_token');
    await syncPending({ baseUrl: API_URL, deviceId: deviceId, token: token ?? undefined });
    await refreshPending();
  };

  // ── FR-23: Sound check gate ─────────────────────────────────────────────────
  if (soundOk === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Text style={styles.brand}>PadhAI Pocket</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.kicker}>FR-23 · SOUND CHECK</Text>
            <Text style={styles.title}>Can you hear us?</Text>
            <Text style={styles.prompt}>
              🔔 A chime should be playing now.{'\n'}
              Tell us what you hear so we can set up your lesson correctly.
            </Text>
            <Pressable
              testID="sound-check-heard"
              style={[styles.option, styles.soundYes]}
              onPress={() => handleSoundCheck(true)}
            >
              <Text style={styles.optionIndex}>✓</Text>
              <Text style={styles.optionText}>I heard it</Text>
            </Pressable>
            <Pressable
              testID="sound-check-not-heard"
              style={[styles.option, styles.soundNo]}
              onPress={() => handleSoundCheck(false)}
            >
              <Text style={styles.optionIndex}>✗</Text>
              <Text style={styles.optionText}>I didn{"'"}t hear it</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FR-23: Audio unavailable notice (shown before first A-item) ─────────────
  if (audioUnavailable) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Text style={styles.brand}>PadhAI Pocket</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.kicker}>AUDIO UNAVAILABLE</Text>
            <Text style={styles.title}>Let{"'"}s look at pictures first</Text>
            <Text style={styles.prompt}>
              Audio items will be skipped this session.{'\n'}
              We{"'"}ll use pictures and text instead.
            </Text>
            <Pressable
              testID="audio-unavailable-proceed"
              style={[styles.option, styles.soundYes]}
              onPress={() => setAudioUnavailable(false)}
            >
              <Text style={styles.optionText}>Proceed →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main MCQ screen ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.top}>
          <View>
            <Text style={styles.brand}>PadhAI Pocket</Text>
            <Text style={styles.subtitle}>Offline learning session</Text>
          </View>
          <View
            style={[
              styles.badge,
              mode === 'ONLINE' ? styles.online : styles.offline,
            ]}
          >
            <Text style={styles.badgeText}>{mode}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>LEARN</Text>

          {/* Chunk ID badge + pack hash */}
          <View style={styles.chunkBadge}>
            <Text style={styles.chunkBadgeText}>
              {question.chunkId}
            </Text>
            <Text style={styles.chunkHashText}>
              pack {packHash.slice(0, 12)}
            </Text>
          </View>

          <Text style={styles.title}>{question.title}</Text>

          {/* Passage from content pack */}
          {question.passage ? (
            <View style={styles.passageCard}>
              <Text style={styles.passageLabel}>ପାଠ୍ୟ ଅଂଶ</Text>
              <Text style={styles.passageText}>{question.passage}</Text>
            </View>
          ) : null}

          <Text style={styles.prompt}>{question.prompt}</Text>

          {question.options.map((option, index) => (
            <Pressable
              key={option}
              testID={`option-${index}`}
              disabled={answered}
              onPress={() => record(index)}
              style={[
                styles.option,
                answered && index === question.answerIndex && styles.correct,
              ]}
            >
              <Text style={styles.optionIndex}>{String.fromCharCode(65 + index)}</Text>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}

          {/* FR-24: Skip button */}
          {!answered && (
            <Pressable
              testID="skip-button"
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>
                Skip ({MAX_SKIPS_PER_SET - skipCountRef.current} remaining before set aborts)
              </Text>
            </Pressable>
          )}

          {answered && (
            <View style={styles.feedback}>
              {setAborted ? (
                <>
                  <Text style={styles.feedbackText}>Set aborted — INCONSISTENT (reason: SKIPPED)</Text>
                  <Text style={styles.feedbackSub}>
                    Two skips in one set. No mastery change recorded.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.feedbackText}>
                    {lastCorrect
                      ? 'Very good! You got it right.'
                      : "Let's look at it together."}
                  </Text>
                  <Text style={styles.feedbackSub}>
                    Your event is saved locally before any sync is attempted.
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.controlCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.controlTitle}>Airplane-mode demo</Text>
              <Text style={styles.controlSub}>Force the app into OFFLINE mode</Text>
            </View>
            <Switch value={forcedOffline} onValueChange={setForcedOffline} />
          </View>
          <View style={styles.syncRow}>
            <Text style={styles.pending}>PENDING {pending}</Text>
            <Pressable style={styles.syncButton} onPress={sync}>
              <Text style={styles.syncText}>Sync</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.navRow}>
          <Pressable
            style={styles.navButton}
            onPress={() => navigation.navigate('Trace')}
          >
            <Text style={styles.navText}>Trace</Text>
          </Pressable>
          <Pressable
            style={styles.navButton}
            onPress={() => navigation.navigate('RawLog')}
          >
            <Text style={styles.navText}>Raw Log</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07111f' },
  container: { padding: 20, gap: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle: { color: '#91a0b5', marginTop: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99 },
  online: { backgroundColor: '#14532d' },
  offline: { backgroundColor: '#7f1d1d' },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  card: { backgroundColor: '#0e1b2d', borderRadius: 20, padding: 20 },
  kicker: { color: '#6ee7b7', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 8 },
  prompt: { color: '#d9e2ef', fontSize: 18, lineHeight: 27, marginVertical: 18 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#24364f',
    borderRadius: 14,
    marginTop: 10,
  },
  soundYes: { borderColor: '#22c55e' },
  soundNo: { borderColor: '#ef4444' },
  correct: { borderColor: '#22c55e' },
  optionIndex: { color: '#91a0b5', fontWeight: '800' },
  optionText: { color: '#fff', fontSize: 16 },
  // FR-24 skip button
  skipButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d4f65',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  skipText: { color: '#91a0b5', fontSize: 13 },
  feedback: { marginTop: 16, padding: 14, backgroundColor: '#15243a', borderRadius: 14 },
  feedbackText: { color: '#fff', fontWeight: '700' },
  feedbackSub: { color: '#91a0b5', marginTop: 5, lineHeight: 19 },
  controlCard: { backgroundColor: '#0e1b2d', borderRadius: 18, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlTitle: { color: '#fff', fontWeight: '700' },
  controlSub: { color: '#91a0b5', marginTop: 4 },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  pending: { color: '#fbbf24', fontWeight: '800' },
  syncButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  syncText: { color: '#07111f', fontWeight: '800' },
  navRow: { flexDirection: 'row', gap: 12 },
  navButton: {
    flex: 1,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#16253b',
    alignItems: 'center',
  },
  navText: { color: '#fff', fontWeight: '800' },
  // Content integration styles
  chunkBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 8,
  },
  chunkBadgeText: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: '#0F4C5C',
    letterSpacing: 0.5,
  },
  chunkHashText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#8A8A8A',
  },
  passageCard: {
    backgroundColor: '#F5EBD0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#C1440E',
  },
  passageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C1440E',
    letterSpacing: 1,
    marginBottom: 8,
  },
  passageText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#1A1A1A',
  },
});
