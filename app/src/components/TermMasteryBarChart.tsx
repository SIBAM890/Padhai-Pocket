import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Line,
  Text as SvgText,
  G,
} from 'react-native-svg';
import type { TermProgressItem } from '../engine';

export interface TermMasteryBarChartProps {
  terms: TermProgressItem[];
  width?: number;
  height?: number;
}

export function TermMasteryBarChart({
  terms = [],
  width = 340,
  height = 220,
}: TermMasteryBarChartProps) {
  const paddingLeft = 105;
  const paddingRight = 48;
  const paddingTop = 26;
  const paddingBottom = 20;

  const plotWidth = Math.max(width - paddingLeft - paddingRight, 100);
  const rowHeight = 28;
  const barHeight = 12;

  // 70% threshold X coordinate
  const targetX = paddingLeft + 0.70 * plotWidth;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.titleOdia}>📚 ଓଡ଼ିଆ ବିଜ୍ଞାନ ଶବ୍ଦକୋଷ (Vocabulary Mastery)</Text>
        <Text style={styles.titleSub}>Individual Bayesian Knowledge Tracing per term</Text>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svgCanvas}>
        <Defs>
          {/* Emerald Gradient for Mastered */}
          <LinearGradient id="termMasteredGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#059669" />
            <Stop offset="100%" stopColor="#10B981" />
          </LinearGradient>

          {/* Blue Gradient for Growing */}
          <LinearGradient id="termGrowingGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#38BDF8" />
          </LinearGradient>

          {/* Amber Gradient for Focus / New */}
          <LinearGradient id="termAmberGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>

        {/* Vertical Grid Lines at 0%, 25%, 50%, 75%, 100% */}
        {[0, 0.25, 0.50, 0.75, 1.0].map((tick) => {
          const x = paddingLeft + tick * plotWidth;
          return (
            <G key={tick}>
              <Line
                x1={x}
                y1={paddingTop - 6}
                x2={x}
                y2={paddingTop + terms.length * rowHeight}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <SvgText
                x={x}
                y={paddingTop - 10}
                fill="#64748B"
                fontSize="8"
                fontWeight="600"
                textAnchor="middle"
              >
                {`${Math.round(tick * 100)}%`}
              </SvgText>
            </G>
          );
        })}

        {/* 70% Target Vertical Line */}
        <Line
          x1={targetX}
          y1={paddingTop - 6}
          x2={targetX}
          y2={paddingTop + terms.length * rowHeight}
          stroke="#10B981"
          strokeWidth="1.5"
          strokeDasharray="3,3"
        />

        {/* Terms Bars */}
        {terms.map((term, idx) => {
          const y = paddingTop + idx * rowHeight;
          const mastery = Math.max(0, Math.min(1, term.current_mastery));
          const barW = Math.max(mastery * plotWidth, 4);
          const pct = Math.round(mastery * 100);

          const gradId =
            mastery >= 0.70
              ? 'url(#termMasteredGrad)'
              : mastery >= 0.50
              ? 'url(#termGrowingGrad)'
              : 'url(#termAmberGrad)';

          return (
            <G key={term.term_id}>
              {/* Odia Word Label (Y-Axis) */}
              <SvgText
                x={paddingLeft - 8}
                y={y + 6}
                fill="#F8FAFC"
                fontSize="11"
                fontWeight="700"
                textAnchor="end"
              >
                {term.odia_word}
              </SvgText>

              {/* English Subtext Label */}
              <SvgText
                x={paddingLeft - 8}
                y={y + 16}
                fill="#64748B"
                fontSize="8"
                textAnchor="end"
              >
                {term.en_word}
              </SvgText>

              {/* Background Track */}
              <Rect
                x={paddingLeft}
                y={y}
                width={plotWidth}
                height={barHeight}
                rx={6}
                fill="#1E293B"
              />

              {/* Progress Fill */}
              <Rect
                x={paddingLeft}
                y={y}
                width={barW}
                height={barHeight}
                rx={6}
                fill={gradId}
              />

              {/* Percentage Label */}
              <SvgText
                x={paddingLeft + plotWidth + 8}
                y={y + 9}
                fill={mastery >= 0.70 ? '#34D399' : '#CBD5E1'}
                fontSize="10"
                fontWeight="700"
              >
                {`${pct}%`}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Legend Footer */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Mastered (≥70%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
          <Text style={styles.legendText}>Growing (50-69%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Focus (&lt;50%)</Text>
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
  legendRow: {
    flexDirection: 'row',
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
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
  },
});
