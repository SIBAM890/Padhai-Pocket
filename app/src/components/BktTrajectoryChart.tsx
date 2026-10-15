import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
  Circle,
  Rect,
  Text as SvgText,
  G,
} from 'react-native-svg';

export interface BktTrajectoryChartProps {
  history: number[];
  conceptTitle?: string;
  conceptTitleOr?: string;
  width?: number;
  height?: number;
}

export function BktTrajectoryChart({
  history = [0.42],
  conceptTitle = 'Distance vs Displacement',
  conceptTitleOr = 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
  width = 340,
  height = 190,
}: BktTrajectoryChartProps) {
  // Chart layout metrics
  const paddingLeft = 38;
  const paddingRight = 24;
  const paddingTop = 34;
  const paddingBottom = 28;

  const plotWidth = Math.max(width - paddingLeft - paddingRight, 100);
  const plotHeight = Math.max(height - paddingTop - paddingBottom, 80);

  // Helper coordinate mapper
  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return paddingTop + plotHeight * (1 - clamped);
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (total - 1)) * plotWidth;
  };

  // Target threshold line at 70% (0.70)
  const targetY = getY(0.70);

  // Compute point coordinates
  const points = history.map((val, idx) => ({
    x: getX(idx, history.length),
    y: getY(val),
    val,
    idx,
  }));

  // Build SVG path for smooth line
  let linePath = '';
  if (points.length === 1) {
    linePath = `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
  } else {
    linePath = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }

  // Build SVG path for shaded gradient area under curve
  let areaPath = '';
  if (points.length > 1) {
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = paddingTop + plotHeight;
    areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  // Current latest mastery
  const latestMastery = history[history.length - 1] ?? 0.42;
  const latestPct = Math.round(latestMastery * 100);
  const isMastered = latestMastery >= 0.70;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.chartHeader}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.chartTitleOdia}>{conceptTitleOr}</Text>
          <Text style={styles.chartTitleEn}>{conceptTitle} · BKT Learning Trajectory</Text>
        </View>
        <View
          style={[
            styles.masteryPill,
            { backgroundColor: isMastered ? '#064E3B' : '#1E293B', borderColor: isMastered ? '#10B981' : '#3B82F6' },
          ]}
        >
          <Text style={[styles.masteryPillText, { color: isMastered ? '#34D399' : '#93C5FD' }]}>
            {latestPct}% ({latestMastery.toFixed(4)})
          </Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svgCanvas}>
        <Defs>
          {/* Gradient for area fill under BKT trajectory */}
          <LinearGradient id="bktAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
            <Stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
          </LinearGradient>

          {/* Stroke gradient along trajectory */}
          <LinearGradient id="bktLineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#60A5FA" />
            <Stop offset="50%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor={isMastered ? '#10B981' : '#38BDF8'} />
          </LinearGradient>
        </Defs>

        {/* Horizontal Background Grid Lines */}
        {[0, 0.25, 0.50, 0.75, 1.0].map((tick) => {
          const y = getY(tick);
          return (
            <G key={tick}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray={tick === 0 || tick === 1.0 ? undefined : '3,3'}
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 3}
                fill="#64748B"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                {`${Math.round(tick * 100)}%`}
              </SvgText>
            </G>
          );
        })}

        {/* 70% Mastery Target Reference Line */}
        <Line
          x1={paddingLeft}
          y1={targetY}
          x2={paddingLeft + plotWidth}
          y2={targetY}
          stroke="#10B981"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        <Rect
          x={paddingLeft + plotWidth - 92}
          y={targetY - 16}
          width={92}
          height={14}
          rx={4}
          fill="#064E3B"
        />
        <SvgText
          x={paddingLeft + plotWidth - 46}
          y={targetY - 6}
          fill="#34D399"
          fontSize="8"
          fontWeight="700"
          textAnchor="middle"
        >
          ★ 70% Mastery Target
        </SvgText>

        {/* Area fill under curve */}
        {areaPath ? <Path d={areaPath} fill="url(#bktAreaGrad)" /> : null}

        {/* Main Trajectory Stroke */}
        <Path
          d={linePath}
          fill="none"
          stroke="url(#bktLineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points (Nodes) & Callout Badges */}
        {points.map((pt) => {
          const calloutY = Math.max(pt.y - 18, 12);
          const pct = Math.round(pt.val * 100);
          const stepLabel = pt.idx === 0 ? 'Base' : `#${pt.idx}`;

          return (
            <G key={pt.idx}>
              {/* Outer pulsing ring */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={7}
                fill="#3B82F6"
                fillOpacity={0.25}
              />
              {/* Inner core node */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="#FFFFFF"
                stroke={pt.val >= 0.70 ? '#10B981' : '#2563EB'}
                strokeWidth={2.5}
              />

              {/* Callout Pill above Node */}
              <Rect
                x={pt.x - 17}
                y={calloutY}
                width={34}
                height={14}
                rx={4}
                fill="#0F172A"
                stroke={pt.val >= 0.70 ? '#10B981' : '#334155'}
                strokeWidth={1}
              />
              <SvgText
                x={pt.x}
                y={calloutY + 10}
                fill={pt.val >= 0.70 ? '#34D399' : '#F8FAFC'}
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
              >
                {`${pct}%`}
              </SvgText>

              {/* Bottom X-Axis Step Label */}
              <SvgText
                x={pt.x}
                y={paddingTop + plotHeight + 16}
                fill="#94A3B8"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
              >
                {stepLabel}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Legend Footer */}
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>BKT Mastery Curve</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDash, { borderColor: '#10B981' }]} />
          <Text style={styles.legendText}>70% Target</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendTextMuted}>
            {history.length} logged steps
          </Text>
        </View>
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleCol: {
    flex: 1,
  },
  chartTitleOdia: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  chartTitleEn: {
    fontSize: 11,
    color: '#94A3B8',
  },
  masteryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  masteryPillText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  svgCanvas: {
    alignSelf: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDash: {
    width: 12,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  legendTextMuted: {
    fontSize: 10,
    color: '#64748B',
  },
});
