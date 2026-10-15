import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  initialMode?: 'pie' | 'line';
}

export function BktTrajectoryChart({
  history = [0.42],
  conceptTitle = 'Distance vs Displacement',
  conceptTitleOr = 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
  width = 340,
  height = 195,
  initialMode = 'pie',
}: BktTrajectoryChartProps) {
  const [mode, setMode] = useState<'pie' | 'line'>(initialMode);

  // Latest mastery float and metrics
  const latestMastery = history[history.length - 1] ?? 0.42;
  const latestPct = Math.round(latestMastery * 100);
  const remainingPct = Math.max(0, 100 - latestPct);
  const isMastered = latestMastery >= 0.70;

  // -------------------------------------------------------------
  // PIE / DONUT CHART GEOMETRY & CALCULATIONS
  // -------------------------------------------------------------
  const pieCx = 92;
  const pieCy = 94;
  const pieRadius = 54;
  const pieStrokeWidth = 22;
  const circumference = 2 * Math.PI * pieRadius;
  const clampedFraction = Math.max(0.01, Math.min(1.0, latestMastery));
  const strokeDashLength = clampedFraction * circumference;

  // Target 70% milestone needle / pip angle (starting at -90 deg / top)
  const targetAngleDeg = -90 + 0.70 * 360; // 162 deg
  const targetAngleRad = (targetAngleDeg * Math.PI) / 180;
  const targetX = pieCx + pieRadius * Math.cos(targetAngleRad);
  const targetY = pieCy + pieRadius * Math.sin(targetAngleRad);

  // -------------------------------------------------------------
  // LINE GRAPH GEOMETRY & COORDINATE MAPPING
  // -------------------------------------------------------------
  const paddingLeft = 38;
  const paddingRight = 24;
  const paddingTop = 34;
  const paddingBottom = 28;
  const plotWidth = Math.max(width - paddingLeft - paddingRight, 100);
  const plotHeight = Math.max(height - paddingTop - paddingBottom, 80);

  const getLineY = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return paddingTop + plotHeight * (1 - clamped);
  };

  const getLineX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (total - 1)) * plotWidth;
  };

  const targetLineY = getLineY(0.70);

  const points = history.map((val, idx) => ({
    x: getLineX(idx, history.length),
    y: getLineY(val),
    val,
    idx,
  }));

  let linePath = '';
  if (points.length === 1) {
    linePath = `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
  } else {
    linePath = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }

  let areaPath = '';
  if (points.length > 1) {
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = paddingTop + plotHeight;
    areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header Bar */}
      <View style={styles.chartHeader}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.chartTitleOdia}>{conceptTitleOr}</Text>
          <Text style={styles.chartTitleEn}>
            {conceptTitle} · {mode === 'pie' ? 'Mastery Pie Chart' : 'BKT Trajectory'}
          </Text>
        </View>

        <View style={styles.headerRightCol}>
          <View
            style={[
              styles.masteryPill,
              {
                backgroundColor: isMastered ? '#064E3B' : '#1E293B',
                borderColor: isMastered ? '#10B981' : '#3B82F6',
              },
            ]}
          >
            <Text style={[styles.masteryPillText, { color: isMastered ? '#34D399' : '#93C5FD' }]}>
              {latestPct}% ({latestMastery.toFixed(4)})
            </Text>
          </View>
        </View>
      </View>

      {/* Mode Toggle Pills (Pie vs Line Trend) */}
      <View style={styles.modeToggleRow}>
        <Pressable
          onPress={() => setMode('pie')}
          style={[styles.modeToggleBtn, mode === 'pie' && styles.modeToggleBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Switch to Pie Chart view"
        >
          <Text style={[styles.modeToggleText, mode === 'pie' && styles.modeToggleTextActive]}>
            🥧 ପାଇ ଚାର୍ଟ (Pie Chart)
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('line')}
          style={[styles.modeToggleBtn, mode === 'line' && styles.modeToggleBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Switch to Line Trend view"
        >
          <Text style={[styles.modeToggleText, mode === 'line' && styles.modeToggleTextActive]}>
            📈 ଲାଇନ୍ ଟ୍ରେଣ୍ଡ (Trend Line)
          </Text>
        </Pressable>
      </View>

      {/* ======================================================== */}
      {/* VIEW A: HIGH QUALITY SVG PIE / DONUT CHART               */}
      {/* ======================================================== */}
      {mode === 'pie' ? (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svgCanvas}>
          <Defs>
            {/* Emerald Gradient for Mastered Donut Segment */}
            <LinearGradient id="pieMasteredGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#059669" />
              <Stop offset="60%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#34D399" />
            </LinearGradient>

            {/* Blue Gradient for Growing Donut Segment */}
            <LinearGradient id="pieGrowingGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#1D4ED8" />
              <Stop offset="60%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#38BDF8" />
            </LinearGradient>

            {/* Subtle glow filter under hole */}
            <LinearGradient id="pieCenterGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#0B132B" />
              <Stop offset="100%" stopColor="#0F172A" />
            </LinearGradient>
          </Defs>

          {/* 70% Target Benchmark Dashed Outer Orbit Ring */}
          <Circle
            cx={pieCx}
            cy={pieCy}
            r={pieRadius + 15}
            stroke="#10B981"
            strokeWidth={1}
            strokeDasharray="3,3"
            fill="none"
            opacity={0.4}
          />

          {/* Background Track Ring (Remaining) */}
          <Circle
            cx={pieCx}
            cy={pieCy}
            r={pieRadius}
            stroke="#1E293B"
            strokeWidth={pieStrokeWidth}
            fill="none"
          />

          {/* Foreground Active Mastery Arc */}
          <Circle
            cx={pieCx}
            cy={pieCy}
            r={pieRadius}
            stroke={isMastered ? 'url(#pieMasteredGrad)' : 'url(#pieGrowingGrad)'}
            strokeWidth={pieStrokeWidth}
            strokeDasharray={`${strokeDashLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${pieCx} ${pieCy})`}
          />

          {/* Target 70% Pip Notch */}
          <Circle
            cx={targetX}
            cy={targetY}
            r={5}
            fill="#10B981"
            stroke="#FFFFFF"
            strokeWidth={1.8}
          />

          {/* Center Donut Hole Disc */}
          <Circle
            cx={pieCx}
            cy={pieCy}
            r={pieRadius - pieStrokeWidth / 2 - 2}
            fill="url(#pieCenterGrad)"
            stroke="#1E293B"
            strokeWidth={1}
          />

          {/* Center Metrics Inside Donut Hole */}
          <SvgText
            x={pieCx}
            y={pieCy - 3}
            fill="#F8FAFC"
            fontSize="21"
            fontWeight="800"
            textAnchor="middle"
          >
            {`${latestPct}%`}
          </SvgText>
          <SvgText
            x={pieCx}
            y={pieCy + 12}
            fill={isMastered ? '#34D399' : '#38BDF8'}
            fontSize="9"
            fontWeight="700"
            textAnchor="middle"
          >
            {isMastered ? '🌟 ଶିଖିଗଲ' : '🌱 ଅଭ୍ୟାସ'}
          </SvgText>
          <SvgText
            x={pieCx}
            y={pieCy + 24}
            fill="#64748B"
            fontSize="8"
            fontWeight="600"
            textAnchor="middle"
          >
            {`P(L)=${latestMastery.toFixed(3)}`}
          </SvgText>

          {/* Right-Hand Side Breakdown Cards */}
          <G transform="translate(182, 16)">
            {/* Tile 1: Achieved Mastery */}
            <Rect
              x={0}
              y={0}
              width={142}
              height={44}
              rx={8}
              fill="#0F172A"
              stroke={isMastered ? '#10B981' : '#3B82F6'}
              strokeWidth={1}
            />
            <SvgText x={10} y={17} fill="#94A3B8" fontSize="9" fontWeight="600">
              ଅର୍ଜିତ ଦକ୍ଷତା (Achieved)
            </SvgText>
            <SvgText
              x={10}
              y={35}
              fill={isMastered ? '#34D399' : '#60A5FA'}
              fontSize="16"
              fontWeight="800"
            >
              {`${latestPct}%`}
            </SvgText>
            <SvgText x={65} y={34} fill="#64748B" fontSize="9" fontWeight="600">
              {`(${latestMastery.toFixed(4)})`}
            </SvgText>

            {/* Tile 2: 70% Target Benchmark */}
            <Rect
              x={0}
              y={52}
              width={142}
              height={44}
              rx={8}
              fill="#0F172A"
              stroke="#10B981"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <SvgText x={10} y={69} fill="#10B981" fontSize="9" fontWeight="700">
              ★ ୭୦% ମାଷ୍ଟ୍ରି ଲକ୍ଷ୍ୟ (Target)
            </SvgText>
            <SvgText
              x={10}
              y={87}
              fill={isMastered ? '#34D399' : '#F59E0B'}
              fontSize="11"
              fontWeight="700"
            >
              {isMastered ? '✅ ଲକ୍ଷ୍ୟ ହାସଲ (Achieved)' : '🎯 ଲକ୍ଷ୍ୟ ଆଡ଼କୁ (In reach)'}
            </SvgText>

            {/* Tile 3: Remaining */}
            <Rect
              x={0}
              y={104}
              width={142}
              height={44}
              rx={8}
              fill="#0F172A"
              stroke="#334155"
              strokeWidth={1}
            />
            <SvgText x={10} y={121} fill="#94A3B8" fontSize="9" fontWeight="600">
              ଅବଶିଷ୍ଟ ଲକ୍ଷ୍ୟ (Remaining)
            </SvgText>
            <SvgText x={10} y={139} fill="#CBD5E1" fontSize="15" fontWeight="800">
              {`${remainingPct}%`}
            </SvgText>
          </G>
        </Svg>
      ) : (
        /* ======================================================== */
        /* VIEW B: HIGH QUALITY SVG LINE GRAPH (TREND VIEW)         */
        /* ======================================================== */
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svgCanvas}>
          <Defs>
            <LinearGradient id="bktAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
              <Stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
            </LinearGradient>

            <LinearGradient id="bktLineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="50%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor={isMastered ? '#10B981' : '#38BDF8'} />
            </LinearGradient>
          </Defs>

          {/* Horizontal Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
            const y = getLineY(tick);
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
            y1={targetLineY}
            x2={paddingLeft + plotWidth}
            y2={targetLineY}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <Rect
            x={paddingLeft + plotWidth - 92}
            y={targetLineY - 16}
            width={92}
            height={14}
            rx={4}
            fill="#064E3B"
          />
          <SvgText
            x={paddingLeft + plotWidth - 46}
            y={targetLineY - 6}
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
                <Circle cx={pt.x} cy={pt.y} r={7} fill="#3B82F6" fillOpacity={0.25} />
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill="#FFFFFF"
                  stroke={pt.val >= 0.7 ? '#10B981' : '#2563EB'}
                  strokeWidth={2.5}
                />
                <Rect
                  x={pt.x - 17}
                  y={calloutY}
                  width={34}
                  height={14}
                  rx={4}
                  fill="#0F172A"
                  stroke={pt.val >= 0.7 ? '#10B981' : '#334155'}
                  strokeWidth={1}
                />
                <SvgText
                  x={pt.x}
                  y={calloutY + 10}
                  fill={pt.val >= 0.7 ? '#34D399' : '#F8FAFC'}
                  fontSize="9"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {`${pct}%`}
                </SvgText>
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
      )}

      {/* Legend Footer */}
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: isMastered ? '#10B981' : '#3B82F6' },
            ]}
          />
          <Text style={styles.legendText}>ଅର୍ଜିତ ଦକ୍ଷତା ({latestPct}%)</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#334155' }]} />
          <Text style={styles.legendText}>ଅବଶିଷ୍ଟ ({remainingPct}%)</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDash, { borderColor: '#10B981' }]} />
          <Text style={styles.legendText}>୭୦% ଲକ୍ଷ୍ୟ</Text>
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
    marginBottom: 6,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerRightCol: {
    alignItems: 'flex-end',
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
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeToggleTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  svgCanvas: {
    alignSelf: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
});
