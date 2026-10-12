import React, { useEffect, useMemo, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const HEALTH_URL = `${API_URL}/healthz`;
const DEVICE_ID = 'demo-device-01';
const PROFILE_ID = 'demo-profile-01';
const SESSION_ID = '11111111-2222-4333-8444-555555555555';

/**
 * Derives a deterministic uint32 seed from an epoch-ms timestamp.
 * Uses the low 32 bits of `now` — no Math.random(), per PRD §4.9.
 */
function seedFromNow(now: number): number {
  return now >>> 0;
}

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

  // Engine state persisted across renders — initialised once per session.
  const engineStateRef = React.useRef<EngineState>(
    createInitialState(
      PROFILE_ID,
      SESSION_ID,
      'distance_vs_displacement',
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

  const question = useMemo(
    () => ({
      title: 'Motion',
      prompt: 'A student walks 3 m east and then 3 m west. What is the displacement?',
      options: ['0 m', '3 m', '6 m', '9 m'],
      answerIndex: 0,
    }),
    []
  );

  const record = async (selectedIndex: number) => {
    const isCorrect = selectedIndex === question.answerIndex;
    setLastCorrect(isCorrect);

    // ctx.now: real wall-clock time injected from the UI layer (PRD §4.9 allows caller to use Date.now()).
    // ctx.seed: deterministic derivation from now — no Math.random() (PRD §4.9).
    const now = Date.now();
    const ctx = { now, seed: seedFromNow(now) };

    // Sync current network mode into engine state before calling.
    engineStateRef.current = { ...engineStateRef.current, network_mode: mode };

    // Call the real pure engine — nextAction updates mastery, computes input_hash, emits events.
    const engineResult = nextAction(
      engineStateRef.current,
      {
        type: 'OBSERVE_MCQ',
        correct: isCorrect,
        misconception_tag: isCorrect ? null : 'path_equals_displacement',
      } as any,
      ctx
    );

    // Advance engine state for next interaction.
    engineStateRef.current = engineResult.state;

    // Persist first emitted event (OBSERVE) to local SQLite.
    if (engineResult.events.length > 0) {
      await insertEvent(engineResult.events[0] as any);
    }
    setSeq(engineResult.state.seq);
    setAnswered(true);
    await refreshPending();
  };

  const sync = async () => {
    await syncPending({ baseUrl: API_URL, deviceId: DEVICE_ID });
    await refreshPending();
  };

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
          <Text style={styles.title}>{question.title}</Text>
          <Text style={styles.prompt}>{question.prompt}</Text>

          {question.options.map((option, index) => (
            <Pressable
              key={option}
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

          {answered && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>
                {lastCorrect
                  ? 'Very good! You got it right.'
                  : "Let's look at it together."}
              </Text>
              <Text style={styles.feedbackSub}>
                Your event is saved locally before any sync is attempted.
              </Text>
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
  correct: { borderColor: '#22c55e' },
  optionIndex: { color: '#91a0b5', fontWeight: '800' },
  optionText: { color: '#fff', fontSize: 16 },
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
});
