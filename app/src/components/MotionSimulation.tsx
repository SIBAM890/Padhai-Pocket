import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Text as SvgText,
  Polygon,
  G,
  Rect,
} from 'react-native-svg';
import { colors } from '../theme/theme';
import { styles } from './MotionSimulation.styles';
import { playOdiaVoice, stopOdiaAudio } from '../audio/odiaAudio';

export interface MotionSimulationProps {
  mode?: 'interactive' | 'probe' | 'compact';
  onProgressChange?: (progress: number) => void;
  interactive?: boolean;
}

// Cubic bezier point evaluation
function cubicBezier(
  p0: number,
  c1: number,
  c2: number,
  p1: number,
  u: number
): number {
  const inv = 1 - u;
  return (
    inv * inv * inv * p0 +
    3 * inv * inv * u * c1 +
    3 * inv * u * u * c2 +
    u * u * u * p1
  );
}

// 2-segment smooth road path connecting Home (40, 140) to School (300, 60)
const P0 = { x: 40, y: 140 };
const C1 = { x: 90, y: 210 };
const C2 = { x: 130, y: 190 };
const P1 = { x: 170, y: 130 };
const C3 = { x: 210, y: 70 };
const C4 = { x: 250, y: 140 };
const P2 = { x: 300, y: 60 };

export function getPositionAtT(t: number): { x: number; y: number } {
  const clampedT = Math.max(0, Math.min(1, t));
  if (clampedT <= 0.5) {
    const u = clampedT * 2;
    return {
      x: cubicBezier(P0.x, C1.x, C2.x, P1.x, u),
      y: cubicBezier(P0.y, C1.y, C2.y, P1.y, u),
    };
  } else {
    const u = (clampedT - 0.5) * 2;
    return {
      x: cubicBezier(P1.x, C3.x, C4.x, P2.x, u),
      y: cubicBezier(P1.y, C3.y, C4.y, P2.y, u),
    };
  }
}

export default function MotionSimulation({
  mode = 'interactive',
  onProgressChange,
  interactive = true,
}: MotionSimulationProps) {
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<any>(null);

  // Position on path
  const currentPos = getPositionAtT(progress);

  // Euclidean displacement from starting Point A
  const pixelDisplacement = Math.sqrt(
    Math.pow(currentPos.x - P0.x, 2) + Math.pow(currentPos.y - P0.y, 2)
  );

  // Scale: 500m along curved road, 300m straight displacement at finish
  const totalRoadMeters = 500;
  const currentDistanceMeters = Math.round(progress * totalRoadMeters);
  const currentDisplacementMeters =
    progress >= 0.99
      ? 300
      : Math.round(pixelDisplacement * 1.103);

  // Voice-picking helper: Odia -> Hindi -> Indian English -> any Indian -> default
  const pickBestVoice = (): any => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const priorities = ['or-IN', 'or', 'hi-IN', 'hi', 'en-IN', 'en_IN'];
    for (const lang of priorities) {
      const match = voices.find((v: any) => v.lang === lang || v.lang?.startsWith(lang));
      if (match) return match;
    }
    const anyIndian = voices.find(
      (v: any) => v.lang?.includes('IN') || v.lang?.includes('in-')
    );
    if (anyIndian) return anyIndian;
    return voices.find((v: any) => v.default) ?? voices[0] ?? null;
  };

  // One-time voice warm-up on mount (asynchronous enumeration in Chrome)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Audio / Narration hook when Play is tapped (Pure Odia Dialect)
  const triggerNarration = () => {
    try {
      playOdiaVoice({
        key: 'motion',
        text: 'ସୁନୀତା ଘରୁ ବିଦ୍ୟାଳୟକୁ ଯାଉଛନ୍ତି। ଦୂରତା ହେଉଛି ବକ୍ର ପଥର ମୋଟ ଦୈର୍ଘ୍ୟ, ଏବଂ ବିସ୍ଥାପନ ହେଉଛି ସିଧା ସଳଖ ଦୂରତା।',
      });
    } catch {
      // Graceful fallback if audio unavailable
    }
  };

  // Play animation loop
  useEffect(() => {
    if (isPlaying) {
      triggerNarration();
      const startTime = Date.now();
      const initialProgress = progress >= 1 ? 0 : progress;
      const durationMs = 4500 * (1 - initialProgress);

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const next = Math.min(1, initialProgress + elapsed / durationMs);
        setProgress(next);
        onProgressChange?.(next);

        if (next >= 1) {
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, 30);

      animRef.current = interval;
      return () => {
        clearInterval(interval);
        stopOdiaAudio();
      };
    } else {
      stopOdiaAudio();
      if (animRef.current) clearInterval(animRef.current);
    }
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (progress >= 1) {
      setProgress(0);
      onProgressChange?.(0);
    }
    if (isPlaying) {
      stopOdiaAudio();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    stopOdiaAudio();
    setIsPlaying(false);
    setProgress(0);
    onProgressChange?.(0);
  };

  const handleScrub = (evt: any) => {
    if (!interactive && mode === 'probe') return;
    try {
      const { locationX } = evt.nativeEvent;
      // Assume scrub bar width roughly 300px
      const newProgress = Math.max(0, Math.min(1, locationX / 300));
      setProgress(newProgress);
      onProgressChange?.(newProgress);
    } catch {}
  };

  const roadD = `M ${P0.x} ${P0.y} C ${C1.x} ${C1.y}, ${C2.x} ${C2.y}, ${P1.x} ${P1.y} C ${C3.x} ${C3.y}, ${C4.x} ${C4.y}, ${P2.x} ${P2.y}`;

  const isCompact = mode === 'compact';
  const isProbe = mode === 'probe';

  return (
    <View style={[styles.card, isCompact && styles.cardCompact]}>
      {/* Title & Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.titleOr}>ଗତି ଚିତ୍ରଣ • 2D Motion Sim</Text>
          <Text style={styles.titleEn}>
            {isProbe
              ? 'ଚିତ୍ର ଦେଖି ଦୂରତା ଓ ବିସ୍ଥାପନ ନିର୍ଣ୍ଣୟ କରନ୍ତୁ'
              : 'Sunita: Home (A) to School (B)'}
          </Text>
        </View>
        <View style={styles.interactiveBadge}>
          <Text style={styles.interactiveBadgeText}>
            {isProbe ? 'ଚିତ୍ର ନମୁନା' : '2D SVG ସିମ୍ୟୁଲେସନ୍'}
          </Text>
        </View>
      </View>

      {/* 2D SVG Canvas */}
      <View style={styles.svgContainer}>
        <Svg width="100%" height={200} viewBox="0 0 340 200">
          {/* Background village scenery touches */}
          <Rect x="0" y="0" width="340" height="200" fill="#FDF6E3" />
          <Circle cx="80" cy="50" r="14" fill="#E2E8F0" opacity={0.6} />
          <Circle cx="96" cy="46" r="18" fill="#E2E8F0" opacity={0.6} />
          <Circle cx="112" cy="50" r="12" fill="#E2E8F0" opacity={0.6} />

          {/* Straight-line Vector: Displacement (ବିସ୍ଥାପନ) */}
          <Line
            x1={P0.x}
            y1={P0.y}
            x2={P2.x}
            y2={P2.y}
            stroke="#C2410C"
            strokeWidth={3}
            strokeDasharray="5, 4"
          />
          {/* Vector Arrowhead pointing to School (300, 60) without markerEnd */}
          <Polygon points="286,52 300,60 292,70" fill="#C2410C" />

          {/* Curved Road Path: Distance (ଦୂରତା) */}
          <Path
            d={roadD}
            stroke="#D97706"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Point A: Home (ଘର) */}
          <Circle cx={P0.x} cy={P0.y} r={10} fill="#0F9D8A" />
          <Circle cx={P0.x} cy={P0.y} r={4} fill="#FFFFFF" />
          <SvgText
            x={P0.x - 12}
            y={P0.y + 24}
            fontSize="12"
            fontWeight="bold"
            fill="#143F46"
          >
            ଘର (A)
          </SvgText>

          {/* Point B: School (ବିଦ୍ୟାଳୟ) */}
          <Circle cx={P2.x} cy={P2.y} r={10} fill="#EF4444" />
          <Circle cx={P2.x} cy={P2.y} r={4} fill="#FFFFFF" />
          <SvgText
            x={P2.x - 24}
            y={P2.y - 12}
            fontSize="12"
            fontWeight="bold"
            fill="#143F46"
          >
            ବିଦ୍ୟାଳୟ (B)
          </SvgText>

          {/* Displacement Vector Label */}
          <SvgText
            x={150}
            y={90}
            fontSize="11"
            fontWeight="bold"
            fill="#C2410C"
          >
            ବିସ୍ଥାପନ (300 m) ➔
          </SvgText>

          {/* Sunita Traveling Marker */}
          <G x={currentPos.x - 12} y={currentPos.y - 20}>
            <Circle cx={12} cy={12} r={14} fill="#FFFFFF" stroke="#C2410C" strokeWidth={2} />
            <SvgText x={4} y={17} fontSize="14">
              👧
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
          <Text style={styles.legendText}>ବକ୍ର ପଥ: ଦୂରତା (Distance)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#C2410C' }]} />
          <Text style={styles.legendText}>ସିଧା ସଦିଶ: ବିସ୍ଥାପନ (Displacement)</Text>
        </View>
      </View>

      {/* Real-time Distance vs Displacement Meters */}
      <View style={styles.meterRow}>
        <View style={[styles.meterBox, styles.meterDistance]}>
          <Text style={styles.meterLabel}>ଦୂରତା (Distance)</Text>
          <Text style={styles.meterValue}>
            {currentDistanceMeters} <Text style={styles.meterUnit}>m</Text>
          </Text>
        </View>

        <View style={[styles.meterBox, styles.meterDisplacement]}>
          <Text style={styles.meterLabel}>ବିସ୍ଥାପନ (Displacement)</Text>
          <Text style={styles.meterValue}>
            {currentDisplacementMeters} <Text style={styles.meterUnit}>m</Text>
          </Text>
        </View>
      </View>

      {/* Comparison Pill */}
      <View style={styles.comparisonPill}>
        <Text style={styles.comparisonText}>
          ସମାନ ଆରମ୍ଭ / ସମାନ ଶେଷ / ଭିନ୍ନ ପଥ (Same start / same end / different path)
        </Text>
      </View>

      {/* Interactive Controls (Play, Reset, Scrub) */}
      {!isProbe && (
        <View>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handleTogglePlay}
              activeOpacity={0.85}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸ ରଖନ୍ତୁ (Pause)' : '▶ ଚଳାନ୍ତୁ (Play)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.85}
            >
              <Text style={styles.resetButtonText}>↺ ପୁନଃस्थापन (Reset)</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Scrub Bar */}
          <TouchableOpacity
            style={styles.sliderContainer}
            onPress={handleScrub}
            activeOpacity={0.9}
          >
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>ଘର (Start: 0m)</Text>
              <Text style={styles.sliderLabelText}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.sliderLabelText}>ବିଦ୍ୟାଳୟ (End: 500m)</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
