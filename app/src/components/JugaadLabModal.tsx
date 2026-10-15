import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Path, Circle, G, Polygon } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import {
  JUGAAD_EXPERIMENTS,
  ExperimentId,
  SubjectId,
  SensorSample,
  generateSyntheticSensorSamples,
  runJugaadExperimentTurn,
  JugaadExperimentTurnResult,
} from '../engine/jugaadLab';
import { EventData } from '../engine/eventBuilder';
import { colors, radius, shadows, spacing } from '../theme/theme';

export interface JugaadLabModalProps {
  visible: boolean;
  onClose: () => void;
  profileId: string;
  sessionId: string;
  currentMastery: number;
  onExperimentComplete?: (events: EventData[], newMastery: number) => void;
}

export function JugaadLabModal({
  visible,
  onClose,
  profileId,
  sessionId,
  currentMastery,
  onExperimentComplete,
}: JugaadLabModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('physics');
  const [selectedExpId, setSelectedExpId] = useState<ExperimentId>('EXP-MOTION-RAMP');
  const [selectedPresetInput, setSelectedPresetInput] = useState<number | null>(40);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>('opt_0');
  const [samples, setSamples] = useState<SensorSample[] | null>(null);
  const [trialResult, setTrialResult] = useState<JugaadExperimentTurnResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const experiment =
    JUGAAD_EXPERIMENTS.find((e) => e.id === selectedExpId) ?? JUGAAD_EXPERIMENTS[0];

  const subjectExperiments = JUGAAD_EXPERIMENTS.filter((e) => e.subject === selectedSubject);

  const handleSelectSubject = (sub: SubjectId) => {
    setSelectedSubject(sub);
    const firstExp = JUGAAD_EXPERIMENTS.find((e) => e.subject === sub) ?? JUGAAD_EXPERIMENTS[0];
    setSelectedExpId(firstExp.id);
    setSelectedPrediction(firstExp.options[0]?.id ?? null);
    setSelectedPresetInput(firstExp.preset_inputs?.[0]?.value ?? null);
    setSamples(null);
    setTrialResult(null);
  };

  const handleSelectExperiment = (id: ExperimentId) => {
    setSelectedExpId(id);
    const exp = JUGAAD_EXPERIMENTS.find((e) => e.id === id);
    if (exp) {
      setSelectedSubject(exp.subject);
      setSelectedPrediction(exp.options[0]?.id ?? null);
      setSelectedPresetInput(exp.preset_inputs?.[0]?.value ?? null);
    }
    setSamples(null);
    setTrialResult(null);
  };

  const executeTrial = (syntheticSamples: SensorSample[]) => {
    let finalSamples = syntheticSamples;

    // Apply interactive student input parameters
    if (selectedExpId === 'EXP-CHEM-TURMERIC') {
      const phVal = Number(selectedPresetInput ?? 11.5);
      finalSamples = syntheticSamples.map((s) => ({ ...s, ph: phVal }));
    } else if (selectedExpId === 'EXP-BIO-OSMOSIS') {
      const saltVal = Number(selectedPresetInput ?? 0);
      finalSamples = syntheticSamples.map((s) => ({ ...s, salt_pct: saltVal }));
    } else if (selectedExpId === 'EXP-MATH-SHADOW') {
      const ang = Number(selectedPresetInput ?? 45);
      const dist = ang === 30 ? 12 : ang === 60 ? 5 : 8;
      finalSamples = syntheticSamples.map((s) => ({ ...s, angle_deg: ang, distance_m: dist }));
    }

    setSamples(finalSamples);
    const correctOption = experiment.options.find((o) => o.correct);
    const isCorrect = selectedPrediction === correctOption?.id;

    const result = runJugaadExperimentTurn({
      experimentId: selectedExpId,
      samples: finalSamples,
      hypothesisCorrect: isCorrect,
      profileId,
      sessionId,
      deviceId: 'dev_phone_sensor',
      seqStart: Date.now() % 100000,
      now: Date.now(),
      currentMastery,
      networkMode: 'OFFLINE',
      packHash: 'jugaad_pack_v1',
    });

    setTrialResult(result);
    if (onExperimentComplete) {
      onExperimentComplete(result.events, result.masteryAfter);
    }
  };

  const handleCaptureLiveSensor = () => {
    setIsCapturing(true);

    if (
      typeof window !== 'undefined' &&
      'DeviceMotionEvent' in window &&
      typeof (window as any).DeviceMotionEvent !== 'undefined'
    ) {
      const captured: SensorSample[] = [];
      const startTime = Date.now();

      const motionHandler = (event: any) => {
        const t_ms = Math.min(2000, Date.now() - startTime);
        const ax = event.acceleration?.x ?? event.accelerationIncludingGravity?.x ?? 0;
        const ay = event.acceleration?.y ?? event.accelerationIncludingGravity?.y ?? 0;
        const az = event.acceleration?.z ?? event.accelerationIncludingGravity?.z ?? 9.8;
        captured.push({
          t_ms,
          ax: Number(ax.toFixed(3)),
          ay: Number(ay.toFixed(3)),
          az: Number(az.toFixed(3)),
        });
      };

      try {
        window.addEventListener('devicemotion', motionHandler);
      } catch {
        // Fallback gracefully
      }

      setTimeout(() => {
        try {
          window.removeEventListener('devicemotion', motionHandler);
        } catch {}

        setIsCapturing(false);
        if (captured.length >= 10) {
          executeTrial(captured);
        } else {
          // Desktop fallback: generate clean samples
          const fallbackClean = generateSyntheticSensorSamples(selectedExpId, 'clean');
          executeTrial(fallbackClean);
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setIsCapturing(false);
        const fallbackClean = generateSyntheticSensorSamples(selectedExpId, 'clean');
        executeTrial(fallbackClean);
      }, 600);
    }
  };

  const handleRunCleanTrial = () => {
    const cleanSamples = generateSyntheticSensorSamples(selectedExpId, 'clean');
    executeTrial(cleanSamples);
  };

  const handleRunShakyNoise = () => {
    const noisySamples = generateSyntheticSensorSamples(selectedExpId, 'shaky_noise');
    executeTrial(noisySamples);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropTouch} onPress={onClose} accessibilityLabel="Close backdrop" />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ · Offline STEM Lab (0% Internet)
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close Jugaad Lab">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* 4 Subjects Selector Pills */}
            <View style={styles.subjectTabsRow}>
              {(
                [
                  { id: 'physics', label: '⚡ ଭୌତିକ (Physics)', color: '#C2410C' },
                  { id: 'chemistry', label: '🧪 ରସାୟନ (Chemistry)', color: '#0F9D8A' },
                  { id: 'biology', label: '🌱 ଜୀବ (Biology)', color: '#16A34A' },
                  { id: 'maths', label: '📐 ଗଣିତ (Maths)', color: '#D97706' },
                ] as const
              ).map((sub) => {
                const isActive = sub.id === selectedSubject;
                return (
                  <Pressable
                    key={sub.id}
                    style={[styles.subjectTabPill, isActive && { backgroundColor: sub.color, borderColor: sub.color }]}
                    onPress={() => handleSelectSubject(sub.id)}
                  >
                    <Text style={[styles.subjectTabPillText, isActive && styles.subjectTabPillTextActive]}>
                      {sub.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Experiment Picker Pills for Active Subject */}
            <View style={styles.tabsRow}>
              {subjectExperiments.map((exp) => {
                const isActive = exp.id === selectedExpId;
                let shortTitle = exp.title_en;
                if (exp.id === 'EXP-MOTION-RAMP') shortTitle = '📐 ବହି ଢାଲୁ (Motion)';
                else if (exp.id === 'EXP-GRAV-PENDULUM') shortTitle = '🪨 ଦୋଳକ (Gravity g)';
                else if (exp.id === 'EXP-SOUND-CLAP') shortTitle = '👏 ତାଳି (Speed v)';
                else if (exp.id === 'EXP-CHEM-TURMERIC') shortTitle = '🧪 ହଳଦୀ କାଗଜ (Turmeric pH)';
                else if (exp.id === 'EXP-BIO-OSMOSIS') shortTitle = '🥔 ଆଳୁ ଅଭିସ୍ରବଣ (Osmosis)';
                else if (exp.id === 'EXP-MATH-SHADOW') shortTitle = '📐 ବାଡ଼ି ଛାଇ (Clinometer)';

                return (
                  <Pressable
                    key={exp.id}
                    style={[styles.tabPill, isActive && styles.tabPillActive]}
                    onPress={() => handleSelectExperiment(exp.id)}
                  >
                    <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                      {shortTitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* School Lab Missing vs Village Jugaad Replacement Card */}
            <View style={styles.jugaadCard}>
              <View style={styles.cagAuditBadge}>
                <Text style={styles.cagAuditBadgeText}>
                  🏛️ Grounded in Sept 30, 2026 CAG Audit Finding
                </Text>
              </View>
              <Text style={styles.cagAuditText}>
                54 audited Odisha high schools lack functional laboratories due to missing equipment and zero internet. Pocket Jugaad Lab turns budget phone hardware sensors + everyday village objects into an autonomous offline STEM lab.
              </Text>

              <Text style={styles.jugaadTitle}>School Lab Equipment vs. Village Jugaad</Text>

              <View style={styles.comparisonBox}>
                <View style={styles.missingCol}>
                  <Text style={styles.boxLabel}>School Lab Missing</Text>
                  <Text style={styles.boxText}>{experiment.missing_lab_gear}</Text>
                </View>
                <View style={styles.arrowCol}>
                  <Text style={styles.arrowIcon}>➔</Text>
                </View>
                <View style={styles.replacementCol}>
                  <Text style={styles.boxLabelGreen}>Village Jugaad Alternative</Text>
                  <Text style={styles.boxTextOr}>{experiment.village_jugaad_or}</Text>
                  <Text style={styles.boxTextSub}>{experiment.village_jugaad_en}</Text>
                </View>
              </View>
            </View>

            {/* Interactive Student Input Value Selector Card ("By Taking This Value...") */}
            {experiment.preset_inputs && experiment.preset_inputs.length > 0 && (
              <View style={styles.inputParameterCard}>
                <View style={styles.inputCardHeader}>
                  <Text style={styles.inputCardTitle}>
                    🎛️ {experiment.input_parameter_label_or ?? 'ପରୀକ୍ଷଣ ମୂଲ୍ୟ ବାଛନ୍ତୁ (Input Value)'}
                  </Text>
                  <Text style={styles.inputCardBadge}>Student Input</Text>
                </View>
                <Text style={styles.inputCardSub}>
                  {experiment.input_parameter_label_en ?? 'Select Input Value to Test Output'}
                </Text>

                <View style={styles.presetGrid}>
                  {experiment.preset_inputs.map((preset) => {
                    const isSelected =
                      (selectedPresetInput ?? experiment.preset_inputs![0].value) === preset.value;
                    return (
                      <Pressable
                        key={preset.id}
                        style={[styles.presetBtn, isSelected && styles.presetBtnSelected]}
                        onPress={() => setSelectedPresetInput(preset.value)}
                      >
                        <Text style={[styles.presetBtnText, isSelected && styles.presetBtnTextSelected]}>
                          {isSelected ? '✓ ' : '○ '}
                          {preset.label_or}
                        </Text>
                        <Text style={[styles.presetBtnSub, isSelected && styles.presetBtnSubSelected]}>
                          {preset.label_en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Pre-Experiment Prediction Prompt */}
            <View style={styles.predictionCard}>
              <Text style={styles.predictionKicker}>ପରୀକ୍ଷଣ ପୂର୍ବ ଅନୁମାନ (Pre-Trial Intuition)</Text>
              <Text style={styles.predictionPrompt}>{experiment.prediction_prompt_or}</Text>
              <Text style={styles.predictionPromptEn}>{experiment.prediction_prompt_en}</Text>

              <View style={styles.optionsRow}>
                {experiment.options.map((opt) => {
                  const isSelected = selectedPrediction === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                      onPress={() => setSelectedPrediction(opt.id)}
                    >
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {isSelected ? '✓ ' : '○ '}
                        {opt.label_or}
                      </Text>
                      <Text style={[styles.optionSub, isSelected && styles.optionSubSelected]}>
                        {opt.label_en}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                style={[styles.actionBtnPrimary, isCapturing && styles.actionBtnDisabled]}
                onPress={handleCaptureLiveSensor}
                disabled={isCapturing}
              >
                <Text style={styles.actionBtnPrimaryText}>
                  {isCapturing
                    ? '📡 ସେନ୍ସର୍ ତଥ୍ୟ ଗ୍ରହଣ ହେଉଛି...'
                    : experiment.subject === 'physics'
                    ? '📡 Capture Live Phone Sensor (50 Hz)'
                    : experiment.subject === 'chemistry'
                    ? '📸 Capture Camera Color / Color Sensor'
                    : experiment.subject === 'biology'
                    ? '🔬 Record Osmosis Liquid Measurement'
                    : '📐 Read Phone Tilt Angle Inclinometer'}
                </Text>
              </Pressable>

              <View style={styles.actionRowSecondary}>
                <Pressable style={styles.actionBtnClean} onPress={handleRunCleanTrial}>
                  <Text style={styles.actionBtnCleanText}>▶️ Run Trial (Calculate Output)</Text>
                </Pressable>

                <Pressable style={styles.actionBtnNoise} onPress={handleRunShakyNoise}>
                  <Text style={styles.actionBtnNoiseText}>📳 Shake / Noise (Test Gate)</Text>
                </Pressable>
              </View>
            </View>

            {/* Subject-Specific Visualizer */}
            {samples && (
              <View style={styles.waveformCard}>
                <Text style={styles.waveformTitle}>
                  {selectedSubject === 'physics' && `Sensor Signal Stream (${samples.length} frames @ 50 Hz)`}
                  {selectedSubject === 'chemistry' && `Turmeric Paper pH Color Reaction Swatch`}
                  {selectedSubject === 'biology' && `Potato Cavity Osmosis Cross-Section Diagram`}
                  {selectedSubject === 'maths' && `Clinometer Elevation Triangle & Tree Height Diagram`}
                </Text>

                <View style={styles.chartContainer}>
                  {/* 1. Physics Sensor Waveform */}
                  {selectedSubject === 'physics' && (
                    <Svg width="100%" height={120} viewBox="0 0 320 120">
                      <Rect x="0" y="0" width="320" height="120" fill="#F8FAFC" rx={8} />
                      <Line x1="10" y1="60" x2="310" y2="60" stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4, 4" />
                      <SvgText x="15" y="55" fontSize="9" fill="#94A3B8">0</SvgText>

                      {samples.map((s, idx) => {
                        const x = 15 + (idx / 39) * 290;
                        let val = 0;
                        if (selectedExpId === 'EXP-SOUND-CLAP') {
                          val = ((s.db ?? 35) - 35) / 55;
                          const y = 100 - val * 80;
                          return (
                            <Line
                              key={idx}
                              x1={x}
                              y1={100}
                              x2={x}
                              y2={y}
                              stroke={s.db && s.db > 60 ? '#C2410C' : '#94A3B8'}
                              strokeWidth={3}
                            />
                          );
                        } else {
                          val = Math.max(-30, Math.min(30, s.ax ?? 0));
                          const y = 60 - (val / 35) * 45;
                          return (
                            <Rect
                              key={idx}
                              x={x - 2}
                              y={Math.min(60, y)}
                              width={4}
                              height={Math.max(2, Math.abs(60 - y))}
                              fill={Math.abs(val) > 25 ? '#F59E0B' : '#0F9D8A'}
                              rx={1}
                            />
                          );
                        }
                      })}
                    </Svg>
                  )}

                  {/* 2. Chemistry Turmeric Indicator SVG */}
                  {selectedSubject === 'chemistry' && (
                    <Svg width="100%" height={120} viewBox="0 0 320 120">
                      <Rect x="0" y="0" width="320" height="120" fill="#F8FAFC" rx={8} />
                      {/* pH gradient scale bar */}
                      <Rect x="20" y="20" width="80" height="18" fill="#EF4444" rx={3} />
                      <Rect x="100" y="20" width="80" height="18" fill="#FACC15" rx={3} />
                      <Rect x="180" y="20" width="120" height="18" fill="#8B5CF6" rx={3} />
                      <SvgText x="25" y="33" fontSize="9" fill="#FFFFFF" fontWeight="bold">pH 1–6 Acid</SvgText>
                      <SvgText x="110" y="33" fontSize="9" fill="#713F12" fontWeight="bold">pH 7 Neutral</SvgText>
                      <SvgText x="200" y="33" fontSize="9" fill="#FFFFFF" fontWeight="bold">pH 8–14 Base</SvgText>

                      {/* Turmeric Paper Strip */}
                      <SvgText x="20" y="60" fontSize="11" fill="#334155" fontWeight="bold">Turmeric Paper Strip Result:</SvgText>
                      <Rect
                        x="20"
                        y="68"
                        width="280"
                        height="36"
                        fill={(samples[0]?.ph ?? 11.5) > 8 ? '#DC2626' : '#FACC15'}
                        rx={6}
                        stroke="#B45309"
                        strokeWidth={1.5}
                      />
                      <SvgText
                        x="160"
                        y="91"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill={(samples[0]?.ph ?? 11.5) > 8 ? '#FFFFFF' : '#713F12'}
                      >
                        {(samples[0]?.ph ?? 11.5) > 8
                          ? '🔴 Reddish-Brown (Basic: Dianion Formed)'
                          : '🟡 Yellow (Acidic / Neutral: Protonated)'}
                      </SvgText>
                    </Svg>
                  )}

                  {/* 3. Biology Potato Osmometer SVG */}
                  {selectedSubject === 'biology' && (
                    <Svg width="100%" height={120} viewBox="0 0 320 120">
                      <Rect x="0" y="0" width="320" height="120" fill="#F8FAFC" rx={8} />
                      {/* Beaker */}
                      <Rect x="30" y="30" width="260" height="80" fill="#E0F2FE" rx={6} stroke="#0284C7" strokeWidth={1.5} />
                      {/* Potato Body */}
                      <Rect x="80" y="45" width="160" height="60" fill="#D97706" rx={14} />
                      {/* Cavity */}
                      <Rect x="120" y="50" width="80" height="45" fill="#FEF3C7" rx={6} stroke="#92400E" strokeWidth={1} />
                      {/* Cavity Liquid Level */}
                      <Rect
                        x="125"
                        y={(samples[0]?.salt_pct ?? 0) <= 2 ? 60 : 80}
                        width="70"
                        height={(samples[0]?.salt_pct ?? 0) <= 2 ? 32 : 12}
                        fill="#38BDF8"
                        rx={3}
                      />
                      <SvgText x="160" y="35" textAnchor="middle" fontSize="10" fill="#0369A1" fontWeight="bold">
                        {(samples[0]?.salt_pct ?? 0) <= 2
                          ? '💧 Water enters cavity (Endosmosis) ➔ Level Rises to 16.8mm'
                          : '💧 Water leaves cavity (Exosmosis) ➔ Level Drops to 4.5mm'}
                      </SvgText>
                    </Svg>
                  )}

                  {/* 4. Maths Clinometer SVG */}
                  {selectedSubject === 'maths' && (
                    <Svg width="100%" height={120} viewBox="0 0 320 120">
                      <Rect x="0" y="0" width="320" height="120" fill="#F8FAFC" rx={8} />
                      {/* Ground line */}
                      <Line x1="30" y1="105" x2="290" y2="105" stroke="#64748B" strokeWidth={2} />
                      <SvgText x="160" y="116" textAnchor="middle" fontSize="9" fill="#64748B">
                        Ground Distance d = {samples[0]?.distance_m ?? 8} m
                      </SvgText>

                      {/* Tree line */}
                      <Line x1="260" y1="105" x2="260" y2="20" stroke="#16A34A" strokeWidth={4} />
                      <Circle cx="260" cy="20" r="14" fill="#22C55E" />
                      <SvgText x="278" y="24" fontSize="10" fill="#15803D" fontWeight="bold">
                        H = {trialResult?.metrics?.calculated_height_m ?? 9.2}m
                      </SvgText>

                      {/* Eye / Observer */}
                      <Line x1="50" y1="105" x2="50" y2="85" stroke="#0284C7" strokeWidth={3} />
                      <Circle cx="50" cy="80" r="5" fill="#0284C7" />
                      <SvgText x="20" y="85" fontSize="8" fill="#0284C7">Eye 1.2m</SvgText>

                      {/* Sight line (Hypotenuse) */}
                      <Line x1="50" y1="80" x2="260" y2="20" stroke="#E11D48" strokeWidth={1.5} strokeDasharray="3, 3" />
                      <SvgText x="85" y="75" fontSize="10" fill="#E11D48" fontWeight="bold">
                        θ = {samples[0]?.angle_deg ?? 45}°
                      </SvgText>
                    </Svg>
                  )}
                </View>
              </View>
            )}

            {/* 4 Reflection Physical Gates */}
            {trialResult && (
              <View style={styles.reflectSection}>
                <Text style={styles.sectionHeader}>4 Reflection Physical & Scientific Gates</Text>

                <View style={styles.checksGrid}>
                  <View
                    style={[
                      styles.checkCard,
                      trialResult.reflectChecks.sensor_calibrated === 'PASS'
                        ? styles.checkCardPass
                        : styles.checkCardRetry,
                    ]}
                  >
                    <Text style={styles.checkTitle}>୧. ସେନ୍ସର୍ କାଲିବ୍ରେସନ୍</Text>
                    <Text style={styles.checkSub}>Calibration & Samples</Text>
                    <Text
                      style={
                        trialResult.reflectChecks.sensor_calibrated === 'PASS'
                          ? styles.statusPass
                          : styles.statusRetry
                      }
                    >
                      {trialResult.reflectChecks.sensor_calibrated === 'PASS' ? '✓ PASS' : 'ଆଉଥରେ ଚେଷ୍ଟା'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCard,
                      trialResult.reflectChecks.signal_to_noise === 'PASS'
                        ? styles.checkCardPass
                        : styles.checkCardRetry,
                    ]}
                  >
                    <Text style={styles.checkTitle}>୨. ସିଗ୍ନାଲ୍ ଗୁଣବତ୍ତା</Text>
                    <Text style={styles.checkSub}>Signal-to-Noise (SNR)</Text>
                    <Text
                      style={
                        trialResult.reflectChecks.signal_to_noise === 'PASS'
                          ? styles.statusPass
                          : styles.statusRetry
                      }
                    >
                      {trialResult.reflectChecks.signal_to_noise === 'PASS' ? '✓ PASS' : 'ଆଉଥରେ ଚେଷ୍ଟା'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCard,
                      trialResult.reflectChecks.physical_bounds === 'PASS'
                        ? styles.checkCardPass
                        : styles.checkCardRetry,
                    ]}
                  >
                    <Text style={styles.checkTitle}>୩. ଭୌତିକ ସୀମା</Text>
                    <Text style={styles.checkSub}>Scientific Bounds</Text>
                    <Text
                      style={
                        trialResult.reflectChecks.physical_bounds === 'PASS'
                          ? styles.statusPass
                          : styles.statusRetry
                      }
                    >
                      {trialResult.reflectChecks.physical_bounds === 'PASS' ? '✓ PASS' : 'ଆଉଥରେ ଚେଷ୍ଟା'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCard,
                      trialResult.reflectChecks.hypothesis_match === 'PASS'
                        ? styles.checkCardPass
                        : styles.checkCardRetry,
                    ]}
                  >
                    <Text style={styles.checkTitle}>୪. ଅନୁମାନ ମେଳ</Text>
                    <Text style={styles.checkSub}>Intuition Match</Text>
                    <Text
                      style={
                        trialResult.reflectChecks.hypothesis_match === 'PASS'
                          ? styles.statusPass
                          : styles.statusRetry
                      }
                    >
                      {trialResult.reflectChecks.hypothesis_match === 'PASS' ? '✓ PASS' : 'ଆଉଥରେ ଚେଷ୍ଟା'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Measured Physics & STEM Output Card */}
            {trialResult && (
              <View style={styles.outputCard}>
                <Text style={styles.outputTitle}>Measured Observations & Derivations</Text>

                {selectedExpId === 'EXP-MOTION-RAMP' && (
                  <View style={styles.metricsBox}>
                    <Text style={styles.metricItem}>
                      ମୋଟ ଦୂରତା (Total Distance): {trialResult.metrics.total_distance_m ?? 0.8} m
                    </Text>
                    <Text style={styles.metricHighlight}>
                      ନିଟ୍ ବିସ୍ଥାପନ (Net Displacement): {trialResult.metrics.net_displacement_m ?? 0.0} m
                    </Text>
                  </View>
                )}

                {selectedExpId === 'EXP-GRAV-PENDULUM' && (
                  <View style={styles.metricsBox}>
                    <Text style={styles.metricItem}>
                      ଦୋଳନ ସମୟ (Period T): {trialResult.metrics.measured_period_s ?? 1.42} s
                    </Text>
                    <Text style={styles.metricHighlight}>
                      ମାଧ୍ୟାକର୍ଷଣ ତ୍ୱରଣ (Measured g): {trialResult.metrics.measured_g_ms2 ?? 9.79} m/s²
                    </Text>
                  </View>
                )}

                {selectedExpId === 'EXP-SOUND-CLAP' && (
                  <View style={styles.metricsBox}>
                    <Text style={styles.metricItem}>
                      ସମୟ ବ୍ୟବଧାନ (Δt): {trialResult.metrics.delta_t_s ?? 1.5} s
                    </Text>
                    <Text style={styles.metricHighlight}>
                      ହାରାହାରି ବେଗ (Speed v): {trialResult.metrics.measured_speed_ms ?? 2.0} m/s
                    </Text>
                  </View>
                )}

                {selectedExpId === 'EXP-CHEM-TURMERIC' && (
                  <View style={styles.metricsBox}>
                    <Text style={styles.metricItem}>
                      ଦ୍ରବଣର pH ମୂଲ୍ୟ: {trialResult.metrics.ph_value ?? 11.5} ({trialResult.metrics.solution_nature_or})
                    </Text>
                    <Text style={styles.metricHighlight}>
                      ପରିଲକ୍ଷିତ ରଙ୍ଗ (Color Observed): {trialResult.metrics.observed_color_or} ({trialResult.metrics.observed_color})
                    </Text>
                  </View>
                )}

                {selectedExpId === 'EXP-BIO-OSMOSIS' && (
                  <View style={styles.metricsBox}>
                    <Text style={styles.metricItem}>
                      ଆରମ୍ଭ ଜଳସ୍ତର: {trialResult.metrics.initial_height_mm ?? 10} mm ➔ ଶେଷ ସ୍ତର: {trialResult.metrics.final_height_mm ?? 16.8} mm ({trialResult.metrics.delta_height_mm && trialResult.metrics.delta_height_mm > 0 ? `+${trialResult.metrics.delta_height_mm}` : trialResult.metrics.delta_height_mm} mm)
                    </Text>
                    <Text style={styles.metricHighlight}>
                      ଅଭିସ୍ରବଣ ପ୍ରକାର (Osmosis Type): {trialResult.metrics.osmosis_type_or} ({trialResult.metrics.turgidity_state_or})
                    </Text>
                  </View>
                )}

                {selectedExpId === 'EXP-MATH-SHADOW' && (
                  <View style={styles.metricsBox}>
                    <Text style={styles.metricItem}>
                      ଭୂମି ଦୂରତା d = {trialResult.metrics.distance_m ?? 8} m, କୋଣ θ = {trialResult.metrics.tilt_angle_deg ?? 45}° (tan θ = {trialResult.metrics.tan_theta ?? 1.0})
                    </Text>
                    <Text style={styles.metricHighlight}>
                      ହିସାବିତ ଗଛ ଉଚ୍ଚତା (Calculated Height): {trialResult.metrics.calculated_height_m ?? 9.2} meters
                    </Text>
                  </View>
                )}

                {/* DEDICATED STUDENT-FRIENDLY "BY TAKING THIS VALUE, YOU GET THIS" CARD */}
                <View style={styles.takeawayCard}>
                  <View style={styles.takeawayHeader}>
                    <Text style={styles.takeawayBadge}>💡 ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ବୁଝାମଣା · STUDENT TAKEAWAY</Text>
                  </View>

                  <View style={styles.takeawayGrid}>
                    <View style={styles.takeawayColInput}>
                      <Text style={styles.takeawayColLabel}>📥 ଆପଣ ନେଇଥିବା ମୂଲ୍ୟ (Input Taken)</Text>
                      <Text style={styles.takeawayColValue}>
                        {selectedExpId === 'EXP-MOTION-RAMP' && `ଆଗକୁ 40cm + ପଛକୁ 40cm (Total 80cm)`}
                        {selectedExpId === 'EXP-GRAV-PENDULUM' && `ସୂତା ଲମ୍ବ L = 0.50m (L = 50cm)`}
                        {selectedExpId === 'EXP-SOUND-CLAP' && `ଦୂରତା d = 3.0m, ବ୍ୟବଧାନ Δt = ${trialResult.metrics.delta_t_s ?? 1.5}s`}
                        {selectedExpId === 'EXP-CHEM-TURMERIC' && `pH = ${trialResult.metrics.ph_value ?? 11.5} (${trialResult.metrics.solution_nature_or})`}
                        {selectedExpId === 'EXP-BIO-OSMOSIS' && `ବାହାରେ ଲୁଣ = ${trialResult.metrics.salt_pct ?? 0}%`}
                        {selectedExpId === 'EXP-MATH-SHADOW' && `କୋଣ = ${trialResult.metrics.tilt_angle_deg ?? 45}°, ଦୂରତା = ${trialResult.metrics.distance_m ?? 8}m`}
                      </Text>
                    </View>

                    <View style={styles.takeawayColArrow}>
                      <Text style={styles.takeawayArrowText}>➔</Text>
                    </View>

                    <View style={styles.takeawayColOutput}>
                      <Text style={styles.takeawayColLabel}>➡️ ମିଳିଥିବା ଫଳାଫଳ (Output Derived)</Text>
                      <Text style={styles.takeawayColValueHighlight}>
                        {selectedExpId === 'EXP-MOTION-RAMP' && `ଦୂରତା = 0.80m, ବିସ୍ଥାପନ = 0.00m`}
                        {selectedExpId === 'EXP-GRAV-PENDULUM' && `ମାଧ୍ୟାକର୍ଷଣ g = ${trialResult.metrics.measured_g_ms2 ?? 9.79} m/s²`}
                        {selectedExpId === 'EXP-SOUND-CLAP' && `ବେଗ v = ${trialResult.metrics.measured_speed_ms ?? 2.0} m/s`}
                        {selectedExpId === 'EXP-CHEM-TURMERIC' && `ରଙ୍ଗ = ${trialResult.metrics.observed_color_or} (${trialResult.metrics.solution_nature})`}
                        {selectedExpId === 'EXP-BIO-OSMOSIS' && `ସ୍ତର = ${trialResult.metrics.final_height_mm}mm (${trialResult.metrics.osmosis_type_or})`}
                        {selectedExpId === 'EXP-MATH-SHADOW' && `ଉଚ୍ଚତା H = ${trialResult.metrics.calculated_height_m} meters`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.takeawayExplanationBox}>
                    <Text style={styles.takeawayExplanationTextOr}>
                      {trialResult.metrics.student_takeaway_or}
                    </Text>
                    <Text style={styles.takeawayExplanationTextEn}>
                      {trialResult.metrics.student_takeaway_en}
                    </Text>
                  </View>
                </View>

                {/* Supportive Copy */}
                <View
                  style={[
                    styles.feedbackBanner,
                    trialResult.allPassed ? styles.feedbackBannerSuccess : styles.feedbackBannerSteady,
                  ]}
                >
                  <Text style={styles.feedbackOr}>
                    {trialResult.allPassed
                      ? 'ଅଭିନନ୍ଦନ! ଆପଣଙ୍କ ପରୀକ୍ଷଣ ସଫଳ ହେଲା ଏବଂ ବୈଜ୍ଞାନିକ ତଥ୍ୟ ସଠିକ୍ ଆସିଲା ।'
                      : 'ଚାଲ ହାତ ସ୍ଥିର ରଖି ଆଉଥରେ ଚେଷ୍ଟା କରିବା'}
                  </Text>
                  <Text style={styles.feedbackEn}>
                    {trialResult.allPassed
                      ? 'Great trial! Measurements aligned with scientific theory.'
                      : "Let's hold steady and try once more"}
                  </Text>
                </View>

                {/* Concept Mastery % Display */}
                <View style={styles.masteryRow}>
                  <Text style={styles.masteryLabel}>Concept Mastery (BKT):</Text>
                  <Text style={styles.masteryValue}>
                    {Math.round(trialResult.masteryAfter * 100)}%
                  </Text>
                  {trialResult.masteryAfter > trialResult.masteryBefore && (
                    <Text style={styles.masteryBoost}>
                      (+{Math.round((trialResult.masteryAfter - trialResult.masteryBefore) * 100)}%)
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    width: '100%',
    maxWidth: 640,
    height: Math.min(760, Math.max(500, SCREEN_HEIGHT * 0.88)),
    maxHeight: '92%',
    padding: spacing.md,
    flexDirection: 'column',
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flex: 1,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMuted,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollArea: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  subjectTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  subjectTabPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  subjectTabPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subjectTabPillTextActive: {
    color: '#FFFFFF',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  jugaadCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cagAuditBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  cagAuditBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  cagAuditText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  jugaadTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missingCol: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  arrowCol: {
    paddingHorizontal: 2,
  },
  arrowIcon: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '800',
  },
  replacementCol: {
    flex: 1.4,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  boxLabelGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  boxText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  boxTextOr: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  boxTextSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  inputParameterCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  inputCardBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  inputCardSub: {
    fontSize: 11,
    color: '#0284C7',
    marginBottom: spacing.xs,
  },
  presetGrid: {
    gap: 6,
  },
  presetBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  presetBtnSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetBtnTextSelected: {
    color: '#FFFFFF',
  },
  presetBtnSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  presetBtnSubSelected: {
    color: '#E0F2FE',
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.subtle,
  },
  predictionKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  predictionPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  predictionPromptEn: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  optionsRow: {
    gap: 6,
  },
  optionBtn: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  optionBtnSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  optionSubSelected: {
    color: '#1D4ED8',
  },
  actionsContainer: {
    marginBottom: spacing.sm,
    gap: 6,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.button,
    alignItems: 'center',
    ...shadows.subtle,
  },
  actionBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionRowSecondary: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtnClean: {
    flex: 1,
    backgroundColor: '#0F9D8A',
    paddingVertical: 8,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  actionBtnCleanText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnNoise: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  actionBtnNoiseText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  waveformCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  waveformTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectSection: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  checksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  checkCard: {
    width: '48%',
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
  },
  checkCardPass: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkCardRetry: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  checkTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  checkSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statusPass: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  statusRetry: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  outputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  outputTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  takeawayCard: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  takeawayHeader: {
    marginBottom: 4,
  },
  takeawayBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  takeawayGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  takeawayColInput: {
    flex: 1,
  },
  takeawayColArrow: {
    paddingHorizontal: 4,
  },
  takeawayArrowText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
  },
  takeawayColOutput: {
    flex: 1,
  },
  takeawayColLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  takeawayColValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  takeawayColValueHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6D28D9',
  },
  takeawayExplanationBox: {
    paddingTop: 2,
  },
  takeawayExplanationTextOr: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    lineHeight: 17,
  },
  takeawayExplanationTextEn: {
    fontSize: 10,
    color: '#6D28D9',
    marginTop: 2,
    lineHeight: 14,
  },
  feedbackBanner: {
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedbackBannerSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  feedbackBannerSteady: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  feedbackOr: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  feedbackEn: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  masteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masteryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  masteryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  masteryBoost: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 4,
  },
});
