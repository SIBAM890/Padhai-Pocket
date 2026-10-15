import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  G,
} from 'react-native-svg';
import type { ModalityStrength } from '../engine';

export interface ModalityRadarChartProps {
  modalities: ModalityStrength[];
  width?: number;
  height?: number;
}

export function ModalityRadarChart({
  modalities = [],
  width = 340,
  height = 200,
}: ModalityRadarChartProps) {
  const pMod = modalities.find((m) => m.modality === 'P') ?? {
    modality: 'P',
    label_or: '📷 ଚିତ୍ର (Picture P)',
    label_en: 'Visual & Picture',
    passed: 0,
    total: 0,
    rate_pct: 0,
  };
  const aMod = modalities.find((m) => m.modality === 'A') ?? {
    modality: 'A',
    label_or: '🔊 ଅଡିଓ (Audio A)',
    label_en: 'Spoken Audio',
    passed: 0,
    total: 0,
    rate_pct: 0,
  };
  const tMod = modalities.find((m) => m.modality === 'T') ?? {
    modality: 'T',
    label_or: '📝 ପାଠ୍ୟ (Odia Script T)',
    label_en: 'Text & Reading',
    passed: 0,
    total: 0,
    rate_pct: 0,
  };

  // Polar layout geometry
  const cx = width / 2;
  const cy = 100;
  const maxR = 64;

  // 3 Axis angles:
  // Top (Picture): -90 deg
  // Bottom-Left (Audio): 150 deg (2.618 rad)
  // Bottom-Right (Text): 30 deg (0.524 rad)
  const angleP = -Math.PI / 2;
  const angleA = (7 * Math.PI) / 6;
  const angleT = (11 * Math.PI) / 6;

  const getPolarCoord = (radiusVal: number, angle: number) => ({
    x: cx + radiusVal * Math.cos(angle),
    y: cy + radiusVal * Math.sin(angle),
  });

  // Concentric radar background rings (33%, 66%, 100%)
  const ring100 = [getPolarCoord(maxR, angleP), getPolarCoord(maxR, angleA), getPolarCoord(maxR, angleT)];
  const ring66 = [getPolarCoord(maxR * 0.66, angleP), getPolarCoord(maxR * 0.66, angleA), getPolarCoord(maxR * 0.66, angleT)];
  const ring33 = [getPolarCoord(maxR * 0.33, angleP), getPolarCoord(maxR * 0.33, angleA), getPolarCoord(maxR * 0.33, angleT)];

  const toPolygonPoints = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Value polygon based on student modality rates (clamped with a min visible radius of 0.15)
  const rP = Math.max(0.15, pMod.rate_pct / 100) * maxR;
  const rA = Math.max(0.15, aMod.rate_pct / 100) * maxR;
  const rT = Math.max(0.15, tMod.rate_pct / 100) * maxR;

  const valuePolygonPts = [
    getPolarCoord(rP, angleP),
    getPolarCoord(rA, angleA),
    getPolarCoord(rT, angleT),
  ];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.titleOdia}>🎨 ୩-ମାଧ୍ୟମ ଶକ୍ତି ପ୍ରୋଫାଇଲ୍ (3-Modality Profile)</Text>
        <Text style={styles.titleSub}>Multi-sensory cognitive balance radar</Text>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svgCanvas}>
        <Defs>
          <LinearGradient id="radarAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0284C7" stopOpacity="0.60" />
            <Stop offset="100%" stopColor="#0369A1" stopOpacity="0.15" />
          </LinearGradient>
        </Defs>

        {/* Concentric Grid Rings */}
        <Polygon points={toPolygonPoints(ring100)} fill="#0B132B" stroke="#1E293B" strokeWidth="1" />
        <Polygon points={toPolygonPoints(ring66)} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="2,2" />
        <Polygon points={toPolygonPoints(ring33)} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="2,2" />

        {/* Radial Axis Rays */}
        <Line x1={cx} y1={cy} x2={ring100[0].x} y2={ring100[0].y} stroke="#334155" strokeWidth="1.2" />
        <Line x1={cx} y1={cy} x2={ring100[1].x} y2={ring100[1].y} stroke="#334155" strokeWidth="1.2" />
        <Line x1={cx} y1={cy} x2={ring100[2].x} y2={ring100[2].y} stroke="#334155" strokeWidth="1.2" />

        {/* Ring percentage markers */}
        <SvgText x={cx + 4} y={cy - maxR * 0.66 + 3} fill="#475569" fontSize="8" fontWeight="600">66%</SvgText>
        <SvgText x={cx + 4} y={cy - maxR + 3} fill="#475569" fontSize="8" fontWeight="600">100%</SvgText>

        {/* Learner's Modality Area Polygon */}
        <Polygon
          points={toPolygonPoints(valuePolygonPts)}
          fill="url(#radarAreaGrad)"
          stroke="#38BDF8"
          strokeWidth="2.5"
        />

        {/* Vertex Nodes & Badges */}
        {valuePolygonPts.map((pt, i) => (
          <G key={i}>
            <Circle cx={pt.x} cy={pt.y} r={5} fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
          </G>
        ))}

        {/* Outer Axis Badges */}
        {/* Top: Picture */}
        <SvgText x={ring100[0].x} y={ring100[0].y - 12} fill="#38BDF8" fontSize="11" fontWeight="800" textAnchor="middle">
          📷 Visual (P)
        </SvgText>
        <SvgText x={ring100[0].x} y={ring100[0].y - 2} fill="#F8FAFC" fontSize="10" fontWeight="700" textAnchor="middle">
          {`${pMod.rate_pct}%`}
        </SvgText>

        {/* Bottom Left: Audio */}
        <SvgText x={ring100[1].x - 16} y={ring100[1].y + 14} fill="#34D399" fontSize="11" fontWeight="800" textAnchor="middle">
          🔊 Audio (A)
        </SvgText>
        <SvgText x={ring100[1].x - 16} y={ring100[1].y + 24} fill="#F8FAFC" fontSize="10" fontWeight="700" textAnchor="middle">
          {`${aMod.rate_pct}%`}
        </SvgText>

        {/* Bottom Right: Text */}
        <SvgText x={ring100[2].x + 16} y={ring100[2].y + 14} fill="#FBBF24" fontSize="11" fontWeight="800" textAnchor="middle">
          📝 Text (T)
        </SvgText>
        <SvgText x={ring100[2].x + 16} y={ring100[2].y + 24} fill="#F8FAFC" fontSize="10" fontWeight="700" textAnchor="middle">
          {`${tMod.rate_pct}%`}
        </SvgText>
      </Svg>

      {/* Horizontal Breakdown Bars */}
      <View style={styles.breakdownContainer}>
        {modalities.map((m) => {
          const barColor =
            m.modality === 'P' ? '#0284C7' : m.modality === 'A' ? '#10B981' : '#F59E0B';
          return (
            <View key={m.modality} style={styles.breakdownRow}>
              <View style={styles.breakdownLabelCol}>
                <Text style={styles.breakdownLabelOdia}>{m.label_or}</Text>
                <Text style={styles.breakdownLabelEn}>{m.label_en}</Text>
              </View>
              <View style={styles.breakdownBarCol}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${m.rate_pct}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={styles.statsText}>
                  {m.rate_pct}% ({m.passed}/{m.total})
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0A0F1D',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  headerRow: {
    marginBottom: 6,
  },
  titleOdia: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  titleSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  svgCanvas: {
    alignSelf: 'center',
    marginVertical: 4,
  },
  breakdownContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabelCol: {
    width: 130,
  },
  breakdownLabelOdia: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  breakdownLabelEn: {
    fontSize: 9,
    color: '#64748B',
  },
  breakdownBarCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  statsText: {
    width: 70,
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'right',
  },
});
