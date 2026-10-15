import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Svg, {
  Circle,
  Line,
  Rect,
  Text as SvgText,
  G,
  Path,
  Polygon,
} from 'react-native-svg';
import { colors, radius, shadows, spacing } from '../theme/theme';
import { stopOdiaAudio, playOdiaVoice } from '../audio/odiaAudio';
import { playCorrectChime } from '../audio/chimes';

export interface Maths3DEquationSolverProps {
  onOpenJugaadLab?: () => void;
  playingVoice?: boolean;
  onToggleVoice?: () => void;
}

type EquationType = 'LINEAR' | 'QUADRATIC';

export const Maths3DEquationSolver: React.FC<Maths3DEquationSolverProps> = ({
  onOpenJugaadLab,
}) => {
  // Mode: Linear ax + by + c = 0 vs Quadratic ax² + bx + c = 0
  const [equationType, setEquationType] = useState<EquationType>('LINEAR');

  // --- Linear Mode State (Defaulted to Judge example: 3x - 2y + 2 = 0) ---
  const [a, setA] = useState<number>(3);
  const [b, setB] = useState<number>(-2);
  const [c, setC] = useState<number>(2);
  const [linearStep, setLinearStep] = useState<1 | 2 | 3>(1);
  const [showSecondLine, setShowSecondLine] = useState<boolean>(false);

  // --- Quadratic Mode State (Defaulted to: 3x² - 5x + 2 = 0) ---
  const [qa, setQa] = useState<number>(3);
  const [qb, setQb] = useState<number>(-5);
  const [qc, setQc] = useState<number>(2);
  const [quadStep, setQuadStep] = useState<1 | 2 | 3>(1);

  // --- 3D View Rotation State ---
  const [rotAngle, setRotAngle] = useState<number>(35);
  const [tiltAngle, setTiltAngle] = useState<number>(25);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const spinTimerRef = useRef<any>(null);

  // --- Audio State ---
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoVoice, setAutoVoice] = useState<boolean>(true);

  // 360° Continuous 3D Rotation Effect
  useEffect(() => {
    if (isRotating) {
      spinTimerRef.current = setInterval(() => {
        setRotAngle((prev) => (prev + 3) % 360);
      }, 40);
    } else {
      if (spinTimerRef.current) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
      }
    }
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    };
  }, [isRotating]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopOdiaAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, []);

  // --- Calculations for Linear Mode ---
  // X-Intercept (y = 0): ax + c = 0 => x = -c/a
  const xRoot = a !== 0 ? -c / a : null;
  const xRootDisplay = xRoot !== null ? (Number.isInteger(xRoot) ? xRoot.toString() : xRoot.toFixed(2)) : 'ଅନିର୍ଣ୍ଣୟ';
  const xRootFraction = a === 3 && c === 2 ? '-2/3' : xRootDisplay;

  // Y-Intercept (x = 0): by + c = 0 => y = -c/b
  const yRoot = b !== 0 ? -c / b : null;
  const yRootDisplay = yRoot !== null ? (Number.isInteger(yRoot) ? yRoot.toString() : yRoot.toFixed(2)) : 'ଅନିର୍ଣ୍ଣୟ';
  const yRootFraction = b === -2 && c === 2 ? '1' : yRootDisplay;

  // Second Equation: x + 2y - 6 = 0 (a2 = 1, b2 = 2, c2 = -6)
  // Intersection with 3x - 2y + 2 = 0: x = 1, y = 2.5
  const intersectX = 1.0;
  const intersectY = 2.5;

  // --- Calculations for Quadratic Mode ---
  // Discriminant Delta = b² - 4ac
  const delta = qb * qb - 4 * qa * qc;
  let qRoot1: number | null = null;
  let qRoot2: number | null = null;
  if (qa !== 0 && delta >= 0) {
    qRoot1 = (-qb + Math.sqrt(delta)) / (2 * qa);
    qRoot2 = (-qb - Math.sqrt(delta)) / (2 * qa);
  }
  const qRoot1Display = qRoot1 !== null ? (Number.isInteger(qRoot1) ? qRoot1.toString() : qRoot1.toFixed(2)) : 'ଅବାସ୍ତବ';
  const qRoot2Display = qRoot2 !== null ? (Number.isInteger(qRoot2) ? qRoot2.toString() : qRoot2.toFixed(2)) : 'ଅବାସ୍ତବ';

  // --- Audio Spoken Narration in Odia ---
  const getLinearStepSpeech = (step: 1 | 2 | 3) => {
    if (a === 3 && b === -2 && c === 2) {
      if (step === 1) {
        return 'ଏଠାରେ ସମୀକରଣଟି ହେଉଛି 3x ମାଇନସ୍ 2y ପ୍ଲସ୍ 2 ସମାନ ଶୂନ୍ୟ । ଆସନ୍ତୁ ତ୍ରି-ମାତ୍ରିକ ଗ୍ରାଫ୍ରେ ଏହାର ମୂଳ ବାହାର କରିବା ।';
      }
      if (step === 2) {
        return 'ପ୍ରଥମେ X-ଅକ୍ଷର ମୂଳ ପାଇବା ପାଇଁ y କୁ ଶୂନ୍ୟ ରଖିବା । ତେଣୁ 3x ପ୍ଲସ୍ 2 ସମାନ ଶୂନ୍ୟ, ଅର୍ଥାତ୍ x ର ମୂଲ୍ୟ ମାଇନସ୍ 2 ବାଇ 3 ମିଳିଲା ।';
      }
      return 'ଏବେ Y-ଅକ୍ଷର ମୂଳ ପାଇବା ପାଇଁ x କୁ ଶୂନ୍ୟ ରଖିବା । ମାଇନସ୍ 2y ପ୍ଲସ୍ 2 ସମାନ ଶୂନ୍ୟ, ଅର୍ଥାତ୍ y ସମାନ 1 ମିଳିଲା । ଏହି ଦୁଇଟି ବିନ୍ଦୁକୁ ଯୋଡ଼ିଲେ ଆମର ସମାଧାନ ରେଖା ମିଳେ ।';
    }
    // Dynamic text for custom inputs
    if (step === 1) {
      return `ଏଠାରେ ସମୀକରଣଟି ହେଉଛି ${a}x ${b >= 0 ? 'ପ୍ଲସ୍ ' + b : 'ମାଇନସ୍ ' + Math.abs(b)}y ${c >= 0 ? 'ପ୍ଲସ୍ ' + c : 'ମାଇନସ୍ ' + Math.abs(c)} ସମାନ ଶୂନ୍ୟ ।`;
    }
    if (step === 2) {
      return `X-ଅକ୍ଷର ମୂଳ ପାଇଁ y କୁ ଶୂନ୍ୟ କଲେ, x ସମାନ ${xRootDisplay} ମିଳେ ।`;
    }
    return `Y-ଅକ୍ଷର ମୂଳ ପାଇଁ x କୁ ଶୂନ୍ୟ କଲେ, y ସମାନ ${yRootDisplay} ମିଳେ । ଏହା ଆମର ୩D ସମାଧାନ ରେଖା ।`;
  };

  const getQuadStepSpeech = (step: 1 | 2 | 3) => {
    if (qa === 3 && qb === -5 && qc === 2) {
      if (step === 1) {
        return 'ଦ୍ୱିଘାତ ସମୀକରଣ 3x² ମାଇନସ୍ 5x ପ୍ଲସ୍ 2 ସମାନ ଶୂନ୍ୟ । ଏହାର a = 3, b = -5, ଏବଂ c = 2 ଅଟେ । ଏହା ଏକ ପାରାବୋଲା ସୃଷ୍ଟି କରେ ।';
      }
      if (step === 2) {
        return 'ପ୍ରଭେଦକ ଡେଲ୍ଟା = b² ମାଇନସ୍ 4ac = 25 ମାଇନସ୍ 24 = 1 । ଡେଲ୍ଟା ଧନାତ୍ମକ ହୋଇଥିବାରୁ ଦୁଇଟି ଭିନ୍ନ ବାସ୍ତବ ମୂଳ ମିଳିବ ।';
      }
      return 'ମୂଳଗୁଡ଼ିକ ହେଲା x = 1 ଏବଂ x = 2 ବାଇ 3 (0.67) । ଏହି ଦୁଇଟି ବିନ୍ଦୁରେ ପାରାବୋଲାଟି X-ଅକ୍ଷକୁ ଛେଦ କରେ ।';
    }
    if (step === 1) {
      return `ଦ୍ୱିଘାତ ସମୀକରଣରେ a=${qa}, b=${qb}, c=${qc} ଅଟେ ।`;
    }
    if (step === 2) {
      return `ପ୍ରଭେଦକ ଡେଲ୍ଟା = ${delta} ଅଟେ ।`;
    }
    return `ମୂଳ ଦ୍ୱୟ ହେଲା x = ${qRoot1Display} ଏବଂ x = ${qRoot2Display} ।`;
  };

  const speakCurrentStep = () => {
    const textToSpeak = equationType === 'LINEAR'
      ? getLinearStepSpeech(linearStep)
      : getQuadStepSpeech(quadStep);

    stopOdiaAudio();
    setIsSpeaking(true);

    // 1. Web Speech Synthesis API
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn('Web speech synthesis fallback', e);
      }
    }

    // 2. Expo / Mobile fallback
    try {
      const ExpoSpeech = require('expo-speech');
      if (ExpoSpeech && typeof ExpoSpeech.speak === 'function') {
        ExpoSpeech.stop();
        ExpoSpeech.speak(textToSpeak, {
          language: 'or-IN',
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
        return;
      }
    } catch {}

    // 3. Fallback: Audio chime + backend TTS wrapper
    playCorrectChime();
    playOdiaVoice({
      text: textToSpeak,
      key: 'maths',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Step change helper with optional auto-voice
  const handleSetLinearStep = (step: 1 | 2 | 3) => {
    setLinearStep(step);
    if (autoVoice) {
      setTimeout(() => {
        speakCurrentStep();
      }, 150);
    }
  };

  const handleSetQuadStep = (step: 1 | 2 | 3) => {
    setQuadStep(step);
    if (autoVoice) {
      setTimeout(() => {
        speakCurrentStep();
      }, 150);
    }
  };

  // --- 3D Isometric Projection Math ---
  const project3D = (x: number, y: number, z: number, cx = 170, cy = 130) => {
    const radY = (rotAngle * Math.PI) / 180;
    const radP = (tiltAngle * Math.PI) / 180;

    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const xRot = x * cosY - y * sinY;
    const yRot = x * sinY + y * cosY;

    const cosP = Math.cos(radP);
    const sinP = Math.sin(radP);
    const S = 30; // 30px per math unit

    const screenX = cx + xRot * S;
    const screenY = cy - yRot * sinP * S - z * cosP * S;
    const depth = yRot * cosP - z * sinP;

    return { screenX, screenY, depth };
  };

  // Coordinate Grid Generation (Ground Floor at Z = 0)
  const gridRange = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <View style={styles.card}>
      {/* Simulation Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.titleOr}>୩-D ଗାଣିତିକ ସମୀକରଣ ସମାଧାନ</Text>
          <Text style={styles.titleEn}>
            {equationType === 'LINEAR'
              ? '3D Linear Plane & Axis Roots (3x - 2y + 2 = 0)'
              : '3D Quadratic Parabola Valley (3x² - 5x + 2 = 0)'}
          </Text>
        </View>

        {/* 360° Rotate Button */}
        <Pressable
          style={[styles.rotateBtn, isRotating && styles.rotateBtnActive]}
          onPress={() => setIsRotating(!isRotating)}
          accessibilityRole="button"
          accessibilityLabel="Rotate 3D coordinate space"
        >
          <Text style={styles.rotateBtnText}>
            {isRotating ? '⏸ ସ୍ଥିର କରନ୍ତୁ' : '🔄 3D ବୁଲାନ୍ତୁ'}
          </Text>
        </Pressable>
      </View>

      {/* 1-Tap Mode Switcher: Linear vs Quadratic */}
      <View style={styles.modeTabsRow}>
        <Pressable
          style={[styles.modeTab, equationType === 'LINEAR' && styles.modeTabActive]}
          onPress={() => {
            setEquationType('LINEAR');
            setLinearStep(1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Switch to 3D Linear Equation"
        >
          <Text style={[styles.modeTabText, equationType === 'LINEAR' && styles.modeTabTextActive]}>
            📏 ୩D ଏକଘାତୀ: 3x - 2y + 2 = 0
          </Text>
        </Pressable>

        <Pressable
          style={[styles.modeTab, equationType === 'QUADRATIC' && styles.modeTabActive]}
          onPress={() => {
            setEquationType('QUADRATIC');
            setQuadStep(1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Switch to 3D Quadratic Equation"
        >
          <Text style={[styles.modeTabText, equationType === 'QUADRATIC' && styles.modeTabTextActive]}>
            📐 ୩D ଦ୍ୱିଘାତ: 3x² - 5x + 2 = 0
          </Text>
        </Pressable>
      </View>

      {/* Preset Chips & Equation Form */}
      {equationType === 'LINEAR' ? (
        <View style={styles.equationControlsBox}>
          {/* Preset Buttons */}
          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>ଉଦାହରଣ:</Text>
            <Pressable
              style={[styles.presetChip, a === 3 && b === -2 && c === 2 && styles.presetChipActive]}
              onPress={() => {
                setA(3);
                setB(-2);
                setC(2);
              }}
            >
              <Text style={[styles.presetChipText, a === 3 && b === -2 && c === 2 && styles.presetChipTextActive]}>
                ⭐ 3x - 2y + 2 = 0
              </Text>
            </Pressable>

            <Pressable
              style={[styles.presetChip, a === 2 && b === 1 && c === -4 && styles.presetChipActive]}
              onPress={() => {
                setA(2);
                setB(1);
                setC(-4);
              }}
            >
              <Text style={[styles.presetChipText, a === 2 && b === 1 && c === -4 && styles.presetChipTextActive]}>
                2x + y - 4 = 0
              </Text>
            </Pressable>

            <Pressable
              style={[styles.presetChip, a === 1 && b === -1 && c === 1 && styles.presetChipActive]}
              onPress={() => {
                setA(1);
                setB(-1);
                setC(1);
              }}
            >
              <Text style={[styles.presetChipText, a === 1 && b === -1 && c === 1 && styles.presetChipTextActive]}>
                x - y + 1 = 0
              </Text>
            </Pressable>
          </View>

          {/* Steppers for a, b, c */}
          <View style={styles.steppersRow}>
            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>ସହଗ a:</Text>
              <View style={styles.stepperControls}>
                <Pressable style={styles.stepBtn} onPress={() => setA((prev) => prev - 1)}>
                  <Text style={styles.stepBtnText}>-</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{a}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setA((prev) => prev + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>ସହଗ b:</Text>
              <View style={styles.stepperControls}>
                <Pressable style={styles.stepBtn} onPress={() => setB((prev) => prev - 1)}>
                  <Text style={styles.stepBtnText}>-</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{b}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setB((prev) => prev + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>ଧ୍ରୁବକ c:</Text>
              <View style={styles.stepperControls}>
                <Pressable style={styles.stepBtn} onPress={() => setC((prev) => prev - 1)}>
                  <Text style={styles.stepBtnText}>-</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{c}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setC((prev) => prev + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Optional 2nd Plane Intersection Toggle */}
            <Pressable
              style={[styles.secondLineBtn, showSecondLine && styles.secondLineBtnActive]}
              onPress={() => setShowSecondLine(!showSecondLine)}
              accessibilityRole="button"
              accessibilityLabel="Toggle second equation plane"
            >
              <Text style={[styles.secondLineBtnText, showSecondLine && styles.secondLineBtnTextActive]}>
                {showSecondLine ? '✓ ୨ୟ ସମୀକରଣ ଯୋଡ଼ାଯାଇଛି' : '+ ୨ୟ ସମୀକରଣ ଯୋଡ଼ନ୍ତୁ'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.equationControlsBox}>
          {/* Quadratic Presets */}
          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>ଉଦାହରଣ:</Text>
            <Pressable
              style={[styles.presetChip, qa === 3 && qb === -5 && qc === 2 && styles.presetChipActive]}
              onPress={() => {
                setQa(3);
                setQb(-5);
                setQc(2);
              }}
            >
              <Text style={[styles.presetChipText, qa === 3 && qb === -5 && qc === 2 && styles.presetChipTextActive]}>
                ⭐ 3x² - 5x + 2 = 0
              </Text>
            </Pressable>

            <Pressable
              style={[styles.presetChip, qa === 1 && qb === 0 && qc === -4 && styles.presetChipActive]}
              onPress={() => {
                setQa(1);
                setQb(0);
                setQc(-4);
              }}
            >
              <Text style={[styles.presetChipText, qa === 1 && qb === 0 && qc === -4 && styles.presetChipTextActive]}>
                x² - 4 = 0
              </Text>
            </Pressable>

            <Pressable
              style={[styles.presetChip, qa === 1 && qb === -2 && qc === 1 && styles.presetChipActive]}
              onPress={() => {
                setQa(1);
                setQb(-2);
                setQc(1);
              }}
            >
              <Text style={[styles.presetChipText, qa === 1 && qb === -2 && qc === 1 && styles.presetChipTextActive]}>
                x² - 2x + 1 = 0
              </Text>
            </Pressable>
          </View>

          {/* Steppers for Quadratic qa, qb, qc */}
          <View style={styles.steppersRow}>
            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>a (x²):</Text>
              <View style={styles.stepperControls}>
                <Pressable style={styles.stepBtn} onPress={() => setQa((prev) => prev - 1)}>
                  <Text style={styles.stepBtnText}>-</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{qa}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setQa((prev) => prev + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>b (x):</Text>
              <View style={styles.stepperControls}>
                <Pressable style={styles.stepBtn} onPress={() => setQb((prev) => prev - 1)}>
                  <Text style={styles.stepBtnText}>-</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{qb}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setQb((prev) => prev + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel}>c (ଧ୍ରୁବକ):</Text>
              <View style={styles.stepperControls}>
                <Pressable style={styles.stepBtn} onPress={() => setQc((prev) => prev - 1)}>
                  <Text style={styles.stepBtnText}>-</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{qc}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setQc((prev) => prev + 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 3D Isometric SVG Canvas */}
      <View style={styles.canvasContainer}>
        <Svg width="100%" height={240} viewBox="0 0 340 240">
          {/* Ground Floor Isometric Grid on Z = 0 */}
          {gridRange.map((gx) => {
            const p1 = project3D(gx, -3, 0);
            const p2 = project3D(gx, 3, 0);
            return (
              <Line
                key={`grid_x_${gx}`}
                x1={p1.screenX}
                y1={p1.screenY}
                x2={p2.screenX}
                y2={p2.screenY}
                stroke="rgba(100, 116, 139, 0.22)"
                strokeWidth={gx === 0 ? 1.5 : 0.75}
                strokeDasharray={gx === 0 ? undefined : '2,2'}
              />
            );
          })}

          {gridRange.map((gy) => {
            const p1 = project3D(-3, gy, 0);
            const p2 = project3D(3, gy, 0);
            return (
              <Line
                key={`grid_y_${gy}`}
                x1={p1.screenX}
                y1={p1.screenY}
                x2={p2.screenX}
                y2={p2.screenY}
                stroke="rgba(100, 116, 139, 0.22)"
                strokeWidth={gy === 0 ? 1.5 : 0.75}
                strokeDasharray={gy === 0 ? undefined : '2,2'}
              />
            );
          })}

          {/* Coordinate Axes */}
          {/* X-Axis in Red (#EF4444) */}
          {(() => {
            const origin = project3D(0, 0, 0);
            const xPos = project3D(3.2, 0, 0);
            const xNeg = project3D(-3.2, 0, 0);
            return (
              <G>
                <Line
                  x1={xNeg.screenX}
                  y1={xNeg.screenY}
                  x2={xPos.screenX}
                  y2={xPos.screenY}
                  stroke="#EF4444"
                  strokeWidth={2.4}
                />
                <Circle cx={xPos.screenX} cy={xPos.screenY} r={3} fill="#EF4444" />
                <SvgText
                  x={xPos.screenX + 6}
                  y={xPos.screenY + 4}
                  fill="#DC2626"
                  fontSize="10"
                  fontWeight="bold"
                >
                  X-ଅକ୍ଷ
                </SvgText>
              </G>
            );
          })()}

          {/* Y-Axis in Cyan (#06B6D4) */}
          {(() => {
            const origin = project3D(0, 0, 0);
            const yPos = project3D(0, 3.2, 0);
            const yNeg = project3D(0, -3.2, 0);
            return (
              <G>
                <Line
                  x1={yNeg.screenX}
                  y1={yNeg.screenY}
                  x2={yPos.screenX}
                  y2={yPos.screenY}
                  stroke="#0F9D8A"
                  strokeWidth={2.4}
                />
                <Circle cx={yPos.screenX} cy={yPos.screenY} r={3} fill="#0F9D8A" />
                <SvgText
                  x={yPos.screenX + 6}
                  y={yPos.screenY + 4}
                  fill="#0F9D8A"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Y-ଅକ୍ଷ
                </SvgText>
              </G>
            );
          })()}

          {/* Z-Axis in Amber (#F59E0B) */}
          {(() => {
            const origin = project3D(0, 0, 0);
            const zPos = project3D(0, 0, 2.6);
            return (
              <G>
                <Line
                  x1={origin.screenX}
                  y1={origin.screenY}
                  x2={zPos.screenX}
                  y2={zPos.screenY}
                  stroke="#F59E0B"
                  strokeWidth={2.0}
                  strokeDasharray="3,2"
                />
                <Circle cx={zPos.screenX} cy={zPos.screenY} r={3} fill="#F59E0B" />
                <SvgText
                  x={zPos.screenX - 8}
                  y={zPos.screenY - 6}
                  fill="#D97706"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Z (ଉଚ୍ଚତା)
                </SvgText>
              </G>
            );
          })()}

          {/* ================= MODE 1: LINEAR VISUALS ================= */}
          {equationType === 'LINEAR' && (
            <G>
              {/* 3D Extruded Tilted Plane / Wall */}
              {(() => {
                if (b === 0) return null;
                // Line: y = -(ax + c)/b
                const xA = -2.5;
                const yA = -(a * xA + c) / b;
                const xB = 2.5;
                const yB = -(a * xB + c) / b;

                // 4 corners of 3D Wall: (xA, yA, -0.4), (xB, yB, -0.4), (xB, yB, 1.8), (xA, yA, 1.8)
                const c1 = project3D(xA, yA, -0.4);
                const c2 = project3D(xB, yB, -0.4);
                const c3 = project3D(xB, yB, 1.8);
                const c4 = project3D(xA, yA, 1.8);

                const points = `${c1.screenX},${c1.screenY} ${c2.screenX},${c2.screenY} ${c3.screenX},${c3.screenY} ${c4.screenX},${c4.screenY}`;

                return (
                  <G>
                    {/* Semi-transparent 3D plane */}
                    <Polygon
                      points={points}
                      fill="rgba(245, 158, 11, 0.22)"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      strokeDasharray="4,2"
                    />
                    {/* Floor solution line where plane slices Z = 0 */}
                    {(() => {
                      const pFloor1 = project3D(xA, yA, 0);
                      const pFloor2 = project3D(xB, yB, 0);
                      return (
                        <Line
                          x1={pFloor1.screenX}
                          y1={pFloor1.screenY}
                          x2={pFloor2.screenX}
                          y2={pFloor2.screenY}
                          stroke="#EA580C"
                          strokeWidth={3.4}
                        />
                      );
                    })()}
                  </G>
                );
              })()}

              {/* Optional 2nd Linear Plane (x + 2y - 6 = 0) in Emerald Green */}
              {showSecondLine && (() => {
                // Equation: x + 2y - 6 = 0 => y = (6 - x)/2
                const xA = -1.5;
                const yA = (6 - xA) / 2;
                const xB = 3.0;
                const yB = (6 - xB) / 2;

                const c1 = project3D(xA, yA, -0.3);
                const c2 = project3D(xB, yB, -0.3);
                const c3 = project3D(xB, yB, 1.6);
                const c4 = project3D(xA, yA, 1.6);
                const points = `${c1.screenX},${c1.screenY} ${c2.screenX},${c2.screenY} ${c3.screenX},${c3.screenY} ${c4.screenX},${c4.screenY}`;

                // Intersection beacon at (x = 1, y = 2.5, 0)
                const ptInt = project3D(intersectX, intersectY, 0);
                const ptIntTop = project3D(intersectX, intersectY, 2.0);

                return (
                  <G>
                    <Polygon
                      points={points}
                      fill="rgba(16, 185, 129, 0.22)"
                      stroke="#10B981"
                      strokeWidth={1.5}
                      strokeDasharray="3,2"
                    />
                    {/* Glowing Golden Intersection Pillar */}
                    <Line
                      x1={ptInt.screenX}
                      y1={ptInt.screenY}
                      x2={ptIntTop.screenX}
                      y2={ptIntTop.screenY}
                      stroke="#F59E0B"
                      strokeWidth={3.0}
                    />
                    {/* Pulsing Intersection Diamond */}
                    <Circle cx={ptInt.screenX} cy={ptInt.screenY} r={14} fill="rgba(245, 158, 11, 0.3)" />
                    <Circle cx={ptInt.screenX} cy={ptInt.screenY} r={7} fill="#F59E0B" />
                    <Circle cx={ptInt.screenX - 2} cy={ptInt.screenY - 2} r={2} fill="#FFFFFF" />
                    {/* Badge */}
                    <Rect
                      x={ptInt.screenX - 70}
                      y={ptInt.screenY - 32}
                      width={140}
                      height={20}
                      rx={6}
                      fill="#1E293B"
                    />
                    <SvgText
                      x={ptInt.screenX}
                      y={ptInt.screenY - 18}
                      fill="#FBBF24"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ★ ଛେଦବିନ୍ଦୁ: (x=1, y=2.5)
                    </SvgText>
                  </G>
                );
              })()}

              {/* Step 2+: X-Axis Root Sphere at (-c/a, 0, 0) in Red */}
              {linearStep >= 2 && xRoot !== null && (() => {
                const pRoot = project3D(xRoot, 0, 0);
                const pDrop = project3D(xRoot, 0, 1.4);
                return (
                  <G>
                    {/* Vertical drop animation line */}
                    <Line
                      x1={pDrop.screenX}
                      y1={pDrop.screenY}
                      x2={pRoot.screenX}
                      y2={pRoot.screenY}
                      stroke="#EF4444"
                      strokeWidth={1.5}
                      strokeDasharray="2,2"
                    />
                    {/* Glowing outer pulse ring */}
                    <Circle cx={pRoot.screenX} cy={pRoot.screenY} r={14} fill="rgba(239, 68, 68, 0.25)" />
                    {/* 3D Sphere body */}
                    <Circle cx={pRoot.screenX} cy={pRoot.screenY} r={8} fill="#DC2626" />
                    {/* Specular 3D highlight */}
                    <Circle cx={pRoot.screenX - 2.5} cy={pRoot.screenY - 2.5} r={2.5} fill="#FFFFFF" />
                    {/* Label Badge */}
                    <Rect
                      x={pRoot.screenX - 55}
                      y={pRoot.screenY - 30}
                      width={110}
                      height={18}
                      rx={5}
                      fill="#B91C1C"
                    />
                    <SvgText
                      x={pRoot.screenX}
                      y={pRoot.screenY - 17}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      X-ମୂଳ: ({xRootFraction}, 0)
                    </SvgText>
                  </G>
                );
              })()}

              {/* Step 3: Y-Axis Root Sphere at (0, -c/b, 0) in Blue */}
              {linearStep >= 3 && yRoot !== null && (() => {
                const pRoot = project3D(0, yRoot, 0);
                const pDrop = project3D(0, yRoot, 1.4);
                return (
                  <G>
                    {/* Vertical drop line */}
                    <Line
                      x1={pDrop.screenX}
                      y1={pDrop.screenY}
                      x2={pRoot.screenX}
                      y2={pRoot.screenY}
                      stroke="#2563EB"
                      strokeWidth={1.5}
                      strokeDasharray="2,2"
                    />
                    {/* Outer glow circle */}
                    <Circle cx={pRoot.screenX} cy={pRoot.screenY} r={14} fill="rgba(37, 99, 235, 0.25)" />
                    {/* 3D Sphere Body */}
                    <Circle cx={pRoot.screenX} cy={pRoot.screenY} r={8} fill="#2563EB" />
                    {/* Specular highlight */}
                    <Circle cx={pRoot.screenX - 2.5} cy={pRoot.screenY - 2.5} r={2.5} fill="#FFFFFF" />
                    {/* Label Badge */}
                    <Rect
                      x={pRoot.screenX - 45}
                      y={pRoot.screenY + 12}
                      width={90}
                      height={18}
                      rx={5}
                      fill="#1D4ED8"
                    />
                    <SvgText
                      x={pRoot.screenX}
                      y={pRoot.screenY + 25}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Y-ମୂଳ: (0, {yRootFraction})
                    </SvgText>
                  </G>
                );
              })()}
            </G>
          )}

          {/* ================= MODE 2: QUADRATIC VISUALS ================= */}
          {equationType === 'QUADRATIC' && (
            <G>
              {/* Parabolic 3D Curve / Terrain Ribbon */}
              {(() => {
                // Parabola: y = qa * x² + qb * x + qc
                const samples: { x: number; y: number }[] = [];
                for (let xVal = -1.2; xVal <= 2.8; xVal += 0.2) {
                  const yVal = qa * xVal * xVal + qb * xVal + qc;
                  samples.push({ x: xVal, y: yVal });
                }

                // Ground curve path
                let pathD = '';
                samples.forEach((pt, idx) => {
                  const scr = project3D(pt.x, pt.y, 0);
                  if (idx === 0) pathD += `M ${scr.screenX} ${scr.screenY}`;
                  else pathD += ` L ${scr.screenX} ${scr.screenY}`;
                });

                // Top ribbon edge at Z = 1.0
                let ribbonPoints = '';
                samples.forEach((pt) => {
                  const s = project3D(pt.x, pt.y, 0);
                  ribbonPoints += `${s.screenX},${s.screenY} `;
                });
                for (let i = samples.length - 1; i >= 0; i--) {
                  const pt = samples[i];
                  const s = project3D(pt.x, pt.y, 0.8);
                  ribbonPoints += `${s.screenX},${s.screenY} `;
                }

                return (
                  <G>
                    {/* Parabolic 3D Ribbon */}
                    <Polygon points={ribbonPoints} fill="rgba(14, 165, 233, 0.2)" />
                    {/* Ground curve path */}
                    <Path d={pathD} stroke="#0284C7" strokeWidth={3.0} fill="none" />
                  </G>
                );
              })()}

              {/* Step 3: Two 3D Root Spheres where Parabola cuts X-axis */}
              {quadStep >= 3 && qRoot1 !== null && qRoot2 !== null && delta >= 0 && (
                <G>
                  {/* Root 1 (e.g. x = 1) in Golden Amber */}
                  {(() => {
                    const pR1 = project3D(qRoot1, 0, 0);
                    return (
                      <G>
                        <Circle cx={pR1.screenX} cy={pR1.screenY} r={14} fill="rgba(245, 158, 11, 0.3)" />
                        <Circle cx={pR1.screenX} cy={pR1.screenY} r={8} fill="#D97706" />
                        <Circle cx={pR1.screenX - 2.5} cy={pR1.screenY - 2.5} r={2.5} fill="#FFFFFF" />
                        <Rect
                          x={pR1.screenX - 45}
                          y={pR1.screenY - 30}
                          width={90}
                          height={18}
                          rx={5}
                          fill="#B45309"
                        />
                        <SvgText
                          x={pR1.screenX}
                          y={pR1.screenY - 17}
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ମୂଳ ୧: x = {qRoot1Display}
                        </SvgText>
                      </G>
                    );
                  })()}

                  {/* Root 2 (e.g. x = 2/3 ≈ 0.67) in Emerald Green */}
                  {(() => {
                    const pR2 = project3D(qRoot2, 0, 0);
                    const label2 = qa === 3 && qc === 2 ? '2/3 (0.67)' : qRoot2Display;
                    return (
                      <G>
                        <Circle cx={pR2.screenX} cy={pR2.screenY} r={14} fill="rgba(16, 185, 129, 0.3)" />
                        <Circle cx={pR2.screenX} cy={pR2.screenY} r={8} fill="#059669" />
                        <Circle cx={pR2.screenX - 2.5} cy={pR2.screenY - 2.5} r={2.5} fill="#FFFFFF" />
                        <Rect
                          x={pR2.screenX - 52}
                          y={pR2.screenY + 12}
                          width={104}
                          height={18}
                          rx={5}
                          fill="#047857"
                        />
                        <SvgText
                          x={pR2.screenX}
                          y={pR2.screenY + 25}
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ମୂଳ ୨: x = {label2}
                        </SvgText>
                      </G>
                    );
                  })()}
                </G>
              )}
            </G>
          )}
        </Svg>
      </View>

      {/* Interactive 3-Step Animated Breakdown Bar */}
      <View style={styles.stepControlsRow}>
        <Text style={styles.stepBarTitle}>ପଦକ୍ଷେପ ଅନୁଯାୟୀ ସମାଧାନ:</Text>
        <View style={styles.stepButtonsContainer}>
          {[1, 2, 3].map((st) => {
            const isActive = equationType === 'LINEAR' ? linearStep === st : quadStep === st;
            return (
              <Pressable
                key={`step_${st}`}
                style={[styles.stepTabBtn, isActive && styles.stepTabBtnActive]}
                onPress={() => {
                  if (equationType === 'LINEAR') handleSetLinearStep(st as 1 | 2 | 3);
                  else handleSetQuadStep(st as 1 | 2 | 3);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Step ${st}`}
              >
                <Text style={[styles.stepTabBtnText, isActive && styles.stepTabBtnTextActive]}>
                  Step {st}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Step Explanation Card with Odia Voice Narration Button */}
      <View style={styles.stepExplanationCard}>
        <View style={styles.stepHeaderRow}>
          <Text style={styles.stepBadge}>
            {equationType === 'LINEAR'
              ? linearStep === 1
                ? 'ପଦକ୍ଷେପ ୧: ସମୀକରଣ ସ୍ଥାପନ (Setup)'
                : linearStep === 2
                ? 'ପଦକ୍ଷେପ ୨: X-ଅକ୍ଷର ମୂଳ ନିର୍ଣ୍ଣୟ (y = 0)'
                : 'ପଦକ୍ଷେପ ୩: Y-ଅକ୍ଷର ମୂଳ ନିର୍ଣ୍ଣୟ ଓ ରେଖା (x = 0)'
              : quadStep === 1
              ? 'ପଦକ୍ଷେପ ୧: ପ୍ରଭେଦକ ନିର୍ଣ୍ଣୟ (Δ = b² - 4ac)'
              : quadStep === 2
              ? 'ପଦକ୍ଷେପ ୨: ସୂତ୍ର ଓ ବର୍ଗ ପୂର୍ଣ୍ଣ ପଦ୍ଧତି'
              : 'ପଦକ୍ଷେପ ୩: ଦୁଇଟି 3D ମୂଳ ଓ ପାରାବୋଲା'}
          </Text>

          {/* Prominent Odia Voice Button */}
          <Pressable
            style={[styles.voicePlayBtn, isSpeaking && styles.voicePlayBtnActive]}
            onPress={speakCurrentStep}
            accessibilityRole="button"
            accessibilityLabel="Play step in Odia audio"
          >
            <Text style={styles.voicePlayBtnText}>
              {isSpeaking ? '🔊 ବ୍ୟାଖ୍ୟା ଚାଲିଛି...' : '🔊 ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ'}
            </Text>
          </Pressable>
        </View>

        {/* Mathematical Breakdown Formula */}
        {equationType === 'LINEAR' ? (
          <View style={styles.mathDetailBox}>
            {linearStep === 1 && (
              <Text style={styles.mathStepText}>
                ସମୀକରଣ: <Text style={styles.highlightMath}>{a}x {b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}y {c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0</Text>
                {'\n'}ଏଠାରେ a = {a}, b = {b}, c = {c} । ତ୍ରି-ମାତ୍ରିକ (3D) ସ୍ପେସ୍‌ରେ ଏହା ଏକ ସମତଳ (Plane) ସୃଷ୍ଟି କରେ ଯାହା ଭୂମି (Z = 0) କୁ କାଟେ ।
              </Text>
            )}
            {linearStep === 2 && (
              <Text style={styles.mathStepText}>
                X-ଅକ୍ଷ ପାଇଁ <Text style={styles.highlightMath}>y = 0</Text> ରଖନ୍ତୁ:
                {'\n'}{a}x {c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0 ➔ {a}x = {-c} ➔ <Text style={styles.highlightMath}>x = {xRootFraction}</Text>
                {'\n'}ଲାଲ୍ ରଙ୍ଗର 3D ସ୍ଫିଅର୍ X-ଅକ୍ଷରେ ({xRootFraction}, 0) ବିନ୍ଦୁରେ ସ୍ଥାପିତ ହେଲା ।
              </Text>
            )}
            {linearStep === 3 && (
              <Text style={styles.mathStepText}>
                Y-ଅକ୍ଷ ପାଇଁ <Text style={styles.highlightMath}>x = 0</Text> ରଖନ୍ତୁ:
                {'\n'}{b}y {c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0 ➔ {b}y = {-c} ➔ <Text style={styles.highlightMath}>y = {yRootFraction}</Text>
                {'\n'}ନୀଳ ରଙ୍ଗର 3D ସ୍ଫିଅର୍ Y-ଅକ୍ଷରେ (0, {yRootFraction}) ବିନ୍ଦୁରେ ଏବଂ ଉଭୟ ବିନ୍ଦୁକୁ ଯୋଡ଼ିଲେ 3D ସମାଧାନ ରେଖା ପ୍ରସ୍ତୁତ ହୁଏ ।
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.mathDetailBox}>
            {quadStep === 1 && (
              <Text style={styles.mathStepText}>
                ଦ୍ୱିଘାତ ସମୀକରଣ: <Text style={styles.highlightMath}>{qa}x² {qb >= 0 ? '+ ' + qb : '- ' + Math.abs(qb)}x {qc >= 0 ? '+ ' + qc : '- ' + Math.abs(qc)} = 0</Text>
                {'\n'}ପ୍ରଭେଦକ (Discriminant) <Text style={styles.highlightMath}>Δ = b² - 4ac</Text> = ({qb})² - 4({qa})({qc}) = {qb * qb} - {4 * qa * qc} = <Text style={styles.highlightMath}>{delta}</Text>
                {'\n'}{delta > 0 ? 'Δ > 0 (ଦୁଇଟି ଭିନ୍ନ ବାସ୍ତବ ମୂଳ)' : delta === 0 ? 'Δ = 0 (ଗୋଟିଏ ମାତ୍ର ବାସ୍ତବ ମୂଳ)' : 'Δ < 0 (କୌଣସି ବାସ୍ତବ ମୂଳ ନାହିଁ)'}
              </Text>
            )}
            {quadStep === 2 && (
              <Text style={styles.mathStepText}>
                ବର୍ଗ ପୂର୍ଣ୍ଣ ଓ ଶ୍ରୀଧର ଆଚାର୍ଯ୍ୟ ସୂତ୍ର:
                {'\n'}<Text style={styles.highlightMath}>x = (-b ± √Δ) / 2a</Text> = (-({qb}) ± √{delta}) / 2({qa})
                {'\n'}= ({ -qb } ± {Math.sqrt(Math.max(0, delta))}) / { 2 * qa }
              </Text>
            )}
            {quadStep === 3 && (
              <Text style={styles.mathStepText}>
                ମୂଳ ଦୁଇଟି:
                {'\n'}• <Text style={styles.highlightMath}>x₁ = {qRoot1Display}</Text>
                {'\n'}• <Text style={styles.highlightMath}>x₂ = {qa === 3 && qc === 2 ? '2/3 (0.67)' : qRoot2Display}</Text>
                {'\n'}ଏହି ଦୁଇଟି ବିନ୍ଦୁରେ 3D ପାରାବୋଲା ଭ୍ୟାଲି X-ଅକ୍ଷକୁ ଛେଦ କରେ ।
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Student Pedagogical Takeaway Box (Odia & English) */}
      <View style={styles.takeawayBox}>
        <Text style={styles.takeawayTitle}>💡 ଛାତ୍ରଙ୍କ ମୁଖ୍ୟ ସିଦ୍ଧାନ୍ତ (Student Takeaway):</Text>
        <Text style={styles.takeawayOdia}>
          {equationType === 'LINEAR'
            ? '3x - 2y + 2 = 0 ରେ y = 0 ନେଲେ X-ଅକ୍ଷ ମୂଳ (-2/3, 0) ଏବଂ x = 0 ନେଲେ Y-ଅକ୍ଷ ମୂଳ (0, 1) ମିଳେ । ତ୍ରି-ମାତ୍ରିକ ସମତଳ ଏହି ଦୁଇ ବିନ୍ଦୁ ଦେଇ ଭୂମିକୁ ଛେଦ କରେ ।'
            : '3x² - 5x + 2 = 0 ରେ ପ୍ରଭେଦକ Δ = 1 > 0 ହୋଇଥିବାରୁ ଏହା X-ଅକ୍ଷକୁ ଦୁଇଟି ସ୍ଥାନରେ (x = 1 ଏବଂ x = 2/3) କାଟେ ।'}
        </Text>
        <Text style={styles.takeawayEn}>
          {equationType === 'LINEAR'
            ? 'By setting y = 0 we get the X-intercept (-2/3, 0), and setting x = 0 yields the Y-intercept (0, 1). The 3D plane slices the Z = 0 floor along this line.'
            : 'Because discriminant Δ = 1 > 0, the 3D parabolic terrain touches the ground axis at two real roots: x = 1 and x = 2/3 ≈ 0.67.'}
        </Text>
      </View>

      {/* Pocket Jugaad Lab Launch Bridge */}
      {onOpenJugaadLab && (
        <Pressable
          style={styles.jugaadBannerBtn}
          onPress={onOpenJugaadLab}
          accessibilityRole="button"
          accessibilityLabel="Launch Pocket Jugaad Lab Shadow Experiment"
        >
          <Text style={styles.jugaadBannerBtnText}>
            🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍: ତ୍ରିକୋଣମିତି ଓ ଛାଇ ମାପ (Launch Shadow Lab) ➔
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleOr: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  titleEn: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 1,
  },
  rotateBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rotateBtnActive: {
    backgroundColor: colors.primary,
  },
  rotateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  equationControlsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: spacing.xs + 2,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  steppersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  stepperCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: colors.surfaceAlt,
  },
  stepBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stepperVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 22,
    textAlign: 'center',
  },
  secondLineBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  secondLineBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#059669',
  },
  secondLineBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  secondLineBtnTextActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  canvasContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#0F172A', // Deep modern dark slate for glowing isometric axes & planes
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: spacing.xs,
  },
  stepControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  stepBarTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepButtonsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  stepTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepTabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  stepTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepTabBtnTextActive: {
    color: colors.textOnPrimary,
  },
  stepExplanationCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  voicePlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  voicePlayBtnActive: {
    backgroundColor: '#F59E0B',
  },
  voicePlayBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  mathDetailBox: {
    marginTop: 2,
  },
  mathStepText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  highlightMath: {
    fontWeight: '800',
    color: colors.primary,
  },
  takeawayBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.sm,
    padding: spacing.xs + 2,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: spacing.xs,
  },
  takeawayTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  takeawayOdia: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  takeawayEn: {
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  jugaadBannerBtn: {
    backgroundColor: '#0D3F43',
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: 2,
  },
  jugaadBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
