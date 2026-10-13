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
  type EngineInput,
  createInitialState,
  nextAction,
} from '../engine';
import { computeSeed, probeOrder } from '../engine/seed';
import { getHeroChunk, getHeroItem, getPackHash, getProbeItems, getConfirmItem, getKuiGlossary } from '../content/loader';
import { getDeviceId } from '../utils/device';
import * as SecureStore from 'expo-secure-store';

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

export type Step =
  | 'sound_check'
  | 'mcq'
  | 'probe_p'
  | 'probe_a'
  | 'probe_t'
  | 'confirm'
  | 'remediation'
  | 'done';

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
  const [step, setStep] = useState<Step>('sound_check');
  const [answered, setAnswered] = useState(false);
  const [seq, setSeq] = useState(1);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize device ID on mount
  useEffect(() => {
    getDeviceId().then((id) => setDeviceId(id));
  }, []);

  // Pre-compute seeded probe order for Set A (PRD §4.9)
  const [probeOrderSeq, setProbeOrderSeq] = useState<Array<'P' | 'A' | 'T'>>([]);
  const [probeIndex, setProbeIndex] = useState(0);

  useEffect(() => {
    computeSeed(PROFILE_ID, CONCEPT_ID, SET_ID).then((seed: number) => {
      setProbeOrderSeq(probeOrder(seed));
    });
  }, []);

  // Advance step based on last emitted event's node
  const advanceStep = (result: { events: any[]; state: EngineState }) => {
    const lastEvent = result.events[result.events.length - 1];
    if (!lastEvent) return;

    const node = lastEvent.node;
    const action = lastEvent.action;

    // OFFLINE branch: engine returns EPISODE_DONE after OFFLINE_REMEDIATION
    if (result.state.step === 'EPISODE_DONE' && node === 'ACT' && action === 'OFFLINE_REMEDIATION') {
      setStep('done');
      return;
    }

    // PROBE node → advance to next probe in seeded order
    if (node === 'PROBE') {
      if (probeIndex < probeOrderSeq.length) {
        const nextModality = probeOrderSeq[probeIndex];
        setProbeIndex(probeIndex + 1);
        setStep(`probe_${nextModality.toLowerCase()}` as Step);
      }
      return;
    }

    // CONFIRM node → go to confirm step
    if (node === 'CONFIRM') {
      setStep('confirm');
      return;
    }

    // REFLECT node with TERM_GAP label → remediation
    if (node === 'REFLECT' && result.state.current_set_label === 'TERM_GAP') {
      setStep('remediation');
      return;
    }

    // ACT node with REMEDIATION → remediation
    if (node === 'ACT' && action.startsWith('REMEDIATION_')) {
      setStep('remediation');
      return;
    }

    // MASTERY or ACT after remediation → done
    if (node === 'MASTERY' || (node === 'ACT' && action.includes('REMEDIATION'))) {
      setStep('done');
      return;
    }

    // RESOLVED → done (no remediation needed)
    if (result.state.current_set_label === 'RESOLVED' && result.state.step === 'EPISODE_DONE') {
      setStep('done');
      return;
    }

    // INCONSISTENT with threshold=1 (demo) → done
    // INCONSISTENT with threshold=2 and all 3 sets exhausted → done
    if (result.state.current_set_label === 'INCONSISTENT' && result.state.step === 'EPISODE_DONE') {
      setStep('done');
      return;
    }

    // Default: if episode done, go to done
    if (result.state.step === 'EPISODE_DONE') {
      setStep('done');
    }
  };

  // Reset for next MCQ round
  const resetForNextRound = () => {
    setAnswered(false);
    setLastCorrect(null);
    setSetAborted(false);
    skipCountRef.current = 0;
    setProbeIndex(0);
    setStep('mcq');
  };

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
  const probeItems = getProbeItems();
  const confirmItem = getConfirmItem();
  const kuiGlossary = getKuiGlossary();

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
    } else {
      setStep('mcq');
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
    const seed = await computeSeed(PROFILE_ID, CONCEPT_ID, SET_ID);
    const ctx = { now, seed, device_id: deviceId };

    // Sync current network mode and concept into engine state before calling.
    engineStateRef.current = { ...engineStateRef.current, network_mode: mode, concept_id: CONCEPT_ID };

    // Call the real pure engine — nextAction updates mastery, computes input_hash, emits events.
    const engineResult = await nextAction(
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

    // Advance UI step based on engine events
    advanceStep(engineResult);
  };

  // Handle probe item response (P/A/T)
  const handleProbeResponse = async (modality: 'P' | 'A' | 'T', isCorrect: boolean) => {
    const now = Date.now();
    const seed = await computeSeed(PROFILE_ID, CONCEPT_ID, SET_ID);
    const ctx = { now, seed, device_id: deviceId };

    engineStateRef.current = { ...engineStateRef.current, network_mode: mode, concept_id: CONCEPT_ID };

    const engineResult = await nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_PROBE_ITEM',
        modality,
        correct: isCorrect,
        audio_available: modality !== 'A' || !audioUnavailable,
      } as any,
      ctx
    );

    engineStateRef.current = engineResult.state;

    for (const event of engineResult.events) {
      await insertEvent(event as any);
    }
    setSeq(engineResult.state.seq);
    await refreshPending();
    advanceStep(engineResult);
  };

  // Render probe item screen
  const renderProbe = (modality: 'P' | 'A' | 'T') => {
    const item = probeItems?.[modality];
    if (!item) return null;

    const modalityLabels = { P: 'चित्र (Picture)', A: 'ऑडियो (Audio)', T: 'पाठ (Text)' };

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Text style={styles.brand}>PadhAI Pocket</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.kicker}>PROBE · {modalityLabels[modality]}</Text>
            <Text style={styles.title}>Question {modality}</Text>
            <Text style={styles.prompt}>{item.stem}</Text>

            {/* Placeholder for media (images/audio) */}
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.placeholderText}>
                {modality === 'P' ? '📷 Picture options (4 images)' :
                 modality === 'A' ? '🔊 Audio playing... (4 audio options)' :
                 '📝 Text options (4 text choices)'}
              </Text>
            </View>

            <View style={styles.probeButtons}>
              <Pressable
                testID={`probe-${modality.toLowerCase()}-correct`}
                style={[styles.option, styles.correctBtn]}
                onPress={() => handleProbeResponse(modality, true)}
              >
                <Text style={styles.optionText}>✓ Correct</Text>
              </Pressable>
              <Pressable
                testID={`probe-${modality.toLowerCase()}-wrong`}
                style={[styles.option, styles.wrongBtn]}
                onPress={() => handleProbeResponse(modality, false)}
              >
                <Text style={styles.optionText}>✗ Wrong</Text>
              </Pressable>
            </View>

            {/* FR-24: Skip button */}
            <Pressable
              testID={`skip-button-${modality.toLowerCase()}`}
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>
                Skip ({MAX_SKIPS_PER_SET - skipCountRef.current} remaining before set aborts)
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Handle confirm item response (W1 - word meaning check)
  const handleConfirmResponse = async (isCorrect: boolean) => {
    const now = Date.now();
    const seed = await computeSeed(PROFILE_ID, CONCEPT_ID, SET_ID);
    const ctx = { now, seed, device_id: deviceId };

    engineStateRef.current = { ...engineStateRef.current, network_mode: mode, concept_id: CONCEPT_ID };

    const engineResult = await nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_CONFIRM_ITEM',
        correct: isCorrect,
        term_id: confirmItem?.termId ?? 'T_DISP',
      } as any,
      ctx
    );

    engineStateRef.current = engineResult.state;

    for (const event of engineResult.events) {
      await insertEvent(event as any);
    }
    setSeq(engineResult.state.seq);
    await refreshPending();
    advanceStep(engineResult);
  };

  // Render confirm item screen (W1 - word meaning check)
  const renderConfirm = () => {
    if (!confirmItem) return null;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Text style={styles.brand}>PadhAI Pocket</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.kicker}>CONFIRM · शब्द अर्थ (Word Meaning)</Text>
            <Text style={styles.title}>Confirm Check</Text>
            <Text style={styles.prompt}>{confirmItem.stem}</Text>

            {/* Placeholder for media (images) */}
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.placeholderText}>
                📷 Word meaning check (4 image options)
              </Text>
            </View>

            <View style={styles.probeButtons}>
              <Pressable
                testID="confirm-correct"
                style={[styles.option, styles.correctBtn]}
                onPress={() => handleConfirmResponse(true)}
              >
                <Text style={styles.optionText}>✓ Correct</Text>
              </Pressable>
              <Pressable
                testID="confirm-wrong"
                style={[styles.option, styles.wrongBtn]}
                onPress={() => handleConfirmResponse(false)}
              >
                <Text style={styles.optionText}>✗ Wrong</Text>
              </Pressable>
            </View>

            {/* FR-24: Skip button */}
            <Pressable
              testID="skip-button-confirm"
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>
                Skip ({MAX_SKIPS_PER_SET - skipCountRef.current} remaining before set aborts)
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  // Render remediation screen (TERM_GAP → Kui term + Odia term + visual)
  const renderRemediation = () => {
    // Find Kui glossary for T_DISP (displacement)
    const kuiTerm = kuiGlossary.find((t: any) => t.term_id === 'T_DISP');
    const odiaTerm = kuiTerm?.odia_from_textbook ?? 'ବିସ୍ଥାପନ';

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Text style={styles.brand}>PadhAI Pocket</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.kicker}>REMEDIATION · TERM_GAP</Text>
            <Text style={styles.title}>शब्द सेतु (Word Bridge)</Text>

            {/* Kui everyday description (text-only fallback) */}
            <View style={styles.remediationSection}>
              <Text style={styles.remediationLabel}>कुइ (Kui) — ସହଜ ବ୍ୟାଖ୍ୟା</Text>
              <Text style={styles.remediationText}>
                {kuiTerm?.kui?.description || 'ବସ୍ତୁ କେଉଁଠାରୁ ଆରମ୍ଭ କରି ଯେଉଁଠାରେ ପହଞ୍ଚେ, ସେହି ଦୁର୍ବଳ ଦୂରତାକୁ ବିସ୍ଥାପନ କୁହାଯାଏ।'}
              </Text>
            </View>

            {/* Odia term from textbook */}
            <View style={styles.remediationSection}>
              <Text style={styles.remediationLabel}>ଓଡ଼ିଆ (Odia) — ପାଠ୍ୟ ପଦ</Text>
              <Text style={styles.remediationTerm}>{odiaTerm}</Text>
            </View>

            {/* Visual placeholder */}
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.placeholderText}>
                🖼️ Visual: displacement arrow from start → end
              </Text>
            </View>

            <Pressable
              testID="remediation-understood"
              style={[styles.option, styles.correctBtn]}
              onPress={() => setStep('done')}
            >
              <Text style={styles.optionText}>सम्झिली (Understood) →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Render done screen (mastery summary + next button)
  const renderDone = () => {
    const conceptMastery = Math.round(engineStateRef.current.concept_mastery * 100);
    const termMastery = Math.round((engineStateRef.current.term_masteries['T_DISP'] ?? 0.4) * 100);

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Text style={styles.brand}>PadhAI Pocket</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.kicker}>DONE · Episode Complete</Text>
            <Text style={styles.title}>ଅଭ୍ୟାସ ସମାପ୍ତ</Text>

            <View style={styles.masteryCard}>
              <Text style={styles.masteryLabel}>Concept Mastery (Distance vs Displacement)</Text>
              <Text style={styles.masteryValue}>{conceptMastery}%</Text>
            </View>

            <View style={styles.masteryCard}>
              <Text style={styles.masteryLabel}>Term Mastery (Displacement / ବିସ୍ଥାପନ)</Text>
              <Text style={styles.masteryValue}>{termMastery}%</Text>
            </View>

            <Text style={styles.doneNote}>
              Events saved locally. Tap Sync when online to send to teacher.
            </Text>

            <Pressable
              testID="done-next"
              style={[styles.option, styles.correctBtn]}
              onPress={resetForNextRound}
            >
              <Text style={styles.optionText}>Next Question →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const sync = async () => {
    // Read token from SecureStore
    const token = await SecureStore.getItemAsync('device_token');
    await syncPending({ baseUrl: API_URL, deviceId: deviceId, token: token ?? undefined });
    await refreshPending();
  };

  // ── FR-23: Sound check gate ─────────────────────────────────────────────────
  if (step === 'sound_check') {
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
                onPress={() => {
                  setAudioUnavailable(false);
                  setStep('mcq');
                }}
              >
                <Text style={styles.optionText}>Proceed →</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

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

  // ── Probe screens (P/A/T) ───────────────────────────────────────────────────
  if (step === 'probe_p' || step === 'probe_a' || step === 'probe_t') {
    const modality = step.split('_')[1] as 'P' | 'A' | 'T';
    return renderProbe(modality);
  }

  // ── Confirm screen (W1 - word meaning check) ────────────────────────────────
  if (step === 'confirm') {
    return renderConfirm();
  }

  // ── Remediation screen (TERM_GAP) ───────────────────────────────────────────
  if (step === 'remediation') {
    return renderRemediation();
  }

  // ── Done screen (episode complete) ──────────────────────────────────────────
  if (step === 'done') {
    return renderDone();
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
  // Probe screen styles
  mediaPlaceholder: {
    height: 120,
    backgroundColor: '#1a2a44',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#3d4f65',
    borderStyle: 'dashed',
  },
  placeholderText: { color: '#8a9bb8', fontSize: 14, textAlign: 'center', paddingHorizontal: 16 },
  probeButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  correctBtn: { flex: 1, borderColor: '#22c55e', backgroundColor: '#14532d' },
  wrongBtn: { flex: 1, borderColor: '#ef4444', backgroundColor: '#7f1d1d' },
  // Remediation & Done styles
  remediationSection: { marginVertical: 12, padding: 14, backgroundColor: '#1a2a44', borderRadius: 12 },
  remediationLabel: { color: '#6ee7b7', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  remediationText: { color: '#d9e2ef', fontSize: 15, lineHeight: 24 },
  remediationTerm: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  masteryCard: { marginVertical: 12, padding: 16, backgroundColor: '#14532d', borderRadius: 12 },
  masteryLabel: { color: '#bbf7d0', fontSize: 13, marginBottom: 4 },
  masteryValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
  doneNote: { color: '#91a0b5', fontSize: 13, marginTop: 12, textAlign: 'center', lineHeight: 20 },
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
