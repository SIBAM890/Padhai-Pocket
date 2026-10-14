import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Line,
  Rect,
  Text as SvgText,
  G,
  Path,
  Polygon,
} from 'react-native-svg';
import MotionSimulation from './MotionSimulation';
import { colors, radius, shadows, spacing } from '../theme/theme';

export interface SubjectVisualizerProps {
  subject: string;
  chunkId?: string;
  mode?: 'interactive' | 'probe' | 'compact';
}

export function SubjectVisualizer({
  subject,
  chunkId,
  mode = 'interactive',
}: SubjectVisualizerProps) {
  const s = subject?.toLowerCase() || 'physics';
  const c = chunkId?.toLowerCase() || '';

  // 1. Chemistry Substitution Reaction Simulation (Carbon & Compounds)
  if (s === 'chemistry' || c.includes('chem') || c.includes('carbon')) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.titleOr}>ରସାୟନ ପ୍ରତିକ୍ରିୟା • 2D Chemical Reaction</Text>
            <Text style={styles.titleEn}>
              Methane (CH₄) + Chlorine (Cl₂) ➔ Chloromethane (CH₃Cl)
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#E6FFFA', borderColor: '#319795' }]}>
            <Text style={[styles.badgeText, { color: '#234E52' }]}>
              ପ୍ରତିସ୍ଥାପନ ପ୍ରତିକ୍ରିୟା
            </Text>
          </View>
        </View>

        <View style={styles.svgContainer}>
          <Svg width="100%" height={190} viewBox="0 0 340 190">
            {/* Background */}
            <Rect x="0" y="0" width="340" height="190" fill="#FDFBF7" />

            {/* Sunlight rays indicator */}
            <G x={145} y={15}>
              <Circle cx={25} cy={15} r={10} fill="#F59E0B" />
              <Line x1={25} y1={2} x2={25} y2={-4} stroke="#F59E0B" strokeWidth={2} />
              <Line x1={37} y1={7} x2={43} y2={3} stroke="#F59E0B" strokeWidth={2} />
              <Line x1={37} y1={23} x2={43} y2={27} stroke="#F59E0B" strokeWidth={2} />
              <SvgText x={8} y={38} fontSize="9" fontWeight="bold" fill="#B45309">
                ସୂର୍ଯ୍ୟାଲୋକ (hν)
              </SvgText>
            </G>

            {/* Reactant 1: Methane (CH4) */}
            <G x={30} y={45}>
              {/* Bonds */}
              <Line x1={40} y1={40} x2={40} y2={10} stroke="#94A3B8" strokeWidth={3} />
              <Line x1={40} y1={40} x2={10} y2={40} stroke="#94A3B8" strokeWidth={3} />
              <Line x1={40} y1={40} x2={70} y2={40} stroke="#94A3B8" strokeWidth={3} />
              <Line x1={40} y1={40} x2={40} y2={70} stroke="#94A3B8" strokeWidth={3} />

              {/* Central Carbon */}
              <Circle cx={40} cy={40} r={16} fill="#1E293B" />
              <SvgText x={35} y={45} fontSize="14" fontWeight="bold" fill="#FFFFFF">
                C
              </SvgText>

              {/* 4 Hydrogens */}
              <Circle cx={40} cy={10} r={9} fill="#38BDF8" />
              <SvgText x={37} y={14} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <Circle cx={10} cy={40} r={9} fill="#38BDF8" />
              <SvgText x={7} y={44} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <Circle cx={70} cy={40} r={9} fill="#38BDF8" />
              <SvgText x={67} y={44} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <Circle cx={40} cy={70} r={9} fill="#38BDF8" />
              <SvgText x={37} y={74} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <SvgText x={15} y={100} fontSize="11" fontWeight="bold" fill="#0F172A">
                ମିଥେନ୍ (CH₄)
              </SvgText>
            </G>

            {/* Plus Sign */}
            <SvgText x={122} y={90} fontSize="20" fontWeight="bold" fill="#64748B">
              +
            </SvgText>

            {/* Reactant 2: Chlorine molecule (Cl-Cl) */}
            <G x={140} y={65}>
              <Line x1={15} y1={25} x2={45} y2={25} stroke="#22C55E" strokeWidth={3} />
              <Circle cx={15} cy={25} r={13} fill="#16A34A" />
              <SvgText x={9} y={29} fontSize="11" fontWeight="bold" fill="#FFFFFF">Cl</SvgText>
              <Circle cx={45} cy={25} r={13} fill="#16A34A" />
              <SvgText x={39} y={29} fontSize="11" fontWeight="bold" fill="#FFFFFF">Cl</SvgText>
              <SvgText x={12} y={55} fontSize="11" fontWeight="bold" fill="#0F172A">
                କ୍ଲୋରିନ୍ (Cl₂)
              </SvgText>
            </G>

            {/* Reaction Arrow */}
            <G x={205} y={80}>
              <Line x1={0} y1={10} x2={25} y2={10} stroke="#304FFE" strokeWidth={3} />
              <Polygon points="25,5 33,10 25,15" fill="#304FFE" />
              <SvgText x={-2} y={-2} fontSize="9" fontWeight="bold" fill="#304FFE">
                ଦ୍ରୁତ ବିସ୍ଥାପନ
              </SvgText>
            </G>

            {/* Product: Chloromethane (CH3Cl) */}
            <G x={245} y={45}>
              <Line x1={40} y1={40} x2={40} y2={10} stroke="#16A34A" strokeWidth={3} />
              <Line x1={40} y1={40} x2={10} y2={40} stroke="#94A3B8" strokeWidth={3} />
              <Line x1={40} y1={40} x2={70} y2={40} stroke="#94A3B8" strokeWidth={3} />
              <Line x1={40} y1={40} x2={40} y2={70} stroke="#94A3B8" strokeWidth={3} />

              <Circle cx={40} cy={40} r={16} fill="#1E293B" />
              <SvgText x={35} y={45} fontSize="14" fontWeight="bold" fill="#FFFFFF">C</SvgText>

              {/* Substituted Chlorine on top! */}
              <Circle cx={40} cy={10} r={11} fill="#16A34A" />
              <SvgText x={35} y={14} fontSize="10" fontWeight="bold" fill="#FFFFFF">Cl</SvgText>

              <Circle cx={10} cy={40} r={9} fill="#38BDF8" />
              <SvgText x={7} y={44} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <Circle cx={70} cy={40} r={9} fill="#38BDF8" />
              <SvgText x={67} y={44} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <Circle cx={40} cy={70} r={9} fill="#38BDF8" />
              <SvgText x={37} y={74} fontSize="10" fontWeight="bold" fill="#FFFFFF">H</SvgText>

              <SvgText x={15} y={100} fontSize="11" fontWeight="bold" fill="#0F172A">
                କ୍ଲୋରୋମିଥେନ୍ (CH₃Cl)
              </SvgText>
            </G>
          </Svg>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillText}>
            ✓ ସୂର୍ଯ୍ୟାଲୋକ ଉପସ୍ଥିତିରେ ଗୋଟିଏ H ପରମାଣୁ Cl ଦ୍ୱାରା ପ୍ରତିସ୍ଥାପିତ ହୋଇଛି (Substitution)
          </Text>
        </View>
      </View>
    );
  }

  // 2. Biology Cell Structure & Mitochondria Simulation
  if (s === 'biology' || c.includes('bio') || c.includes('cell')) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.titleOr}>କୋଷ ସଂରଚନା • 2D Biological Cell</Text>
            <Text style={styles.titleEn}>
              Fundamental Unit of Life · Plant/Animal Cell & Organelles
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}>
            <Text style={[styles.badgeText, { color: '#15803D' }]}>
              ଜୀବନର ମୌଳିକ ଏକକ
            </Text>
          </View>
        </View>

        <View style={styles.svgContainer}>
          <Svg width="100%" height={190} viewBox="0 0 340 190">
            <Rect x="0" y="0" width="340" height="190" fill="#F0FDF4" />

            {/* Outer Cell Membrane (କୋଷଝିଲ୍ଲୀ) */}
            <Rect
              x={30}
              y={20}
              width={280}
              height={150}
              rx={35}
              fill="#DCFCE7"
              stroke="#16A34A"
              strokeWidth={3}
            />

            {/* Cytoplasm (କୋଷଜୀବକ) Area */}
            <SvgText x={45} y={40} fontSize="10" fontWeight="bold" fill="#15803D">
              କୋଷଝିଲ୍ଲୀ (Cell Membrane)
            </SvgText>

            {/* Nucleus in center */}
            <G x={140} y={70}>
              <Circle cx={30} cy={30} r={28} fill="#3B82F6" opacity={0.85} />
              <Circle cx={30} cy={30} r={14} fill="#1D4ED8" />
              <SvgText x={10} y={34} fontSize="10" fontWeight="bold" fill="#FFFFFF">
                ନ୍ୟୁକ୍ଲିୟସ୍
              </SvgText>
            </G>

            {/* Mitochondria 1 (Powerhouse of the Cell) */}
            <G x={60} y={65}>
              <Rect x={0} y={0} width={45} height={26} rx={13} fill="#EA580C" />
              {/* Inner cristae */}
              <Path
                d="M 10 13 Q 18 6, 22 13 T 35 13"
                stroke="#FFEDD5"
                strokeWidth={2}
                fill="none"
              />
              <SvgText x={-5} y={40} fontSize="9" fontWeight="bold" fill="#C2410C">
                ମାଇଟୋକଣ୍ଡ୍ରିଆ (ଶକ୍ତି କେନ୍ଦ୍ର)
              </SvgText>
            </G>

            {/* Mitochondria 2 */}
            <G x={235} y={100}>
              <Rect x={0} y={0} width={45} height={26} rx={13} fill="#EA580C" />
              <Path
                d="M 10 13 Q 18 6, 22 13 T 35 13"
                stroke="#FFEDD5"
                strokeWidth={2}
                fill="none"
              />
            </G>

            {/* Ribosomes / Vacuoles */}
            <Circle cx={85} cy={135} r={8} fill="#A855F7" />
            <SvgText x={98} y={139} fontSize="9" fill="#6B21A8">ରାଇବୋଜୋମ୍</SvgText>

            <Circle cx={250} cy={45} r={12} fill="#93C5FD" opacity={0.7} />
            <SvgText x={235} y={68} fontSize="9" fill="#1D4ED8">ରସଧାନୀ</SvgText>
          </Svg>
        </View>

        <View style={[styles.pillBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <Text style={[styles.pillText, { color: '#166534' }]}>
            ⚡ ମାଇଟୋକଣ୍ଡ୍ରିଆ ହେଉଛି କୋଷର ଶକ୍ତି କେନ୍ଦ୍ର (Powerhouse of the cell — ATP ଉତ୍ପାଦନ କରେ)
          </Text>
        </View>
      </View>
    );
  }

  // 3. Mathematics Number Systems (Rational & Irrational Numbers)
  if (s === 'maths' || s === 'mathematics' || c.includes('math') || c.includes('rational')) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.titleOr}>ସଂଖ୍ୟା ରେଖା • 2D Real Number Line</Text>
            <Text style={styles.titleEn}>
              Rational (p/q, q ≠ 0) vs Irrational Numbers (√2, π)
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Text style={[styles.badgeText, { color: '#92400E' }]}>
              ବାସ୍ତବ ସଂଖ୍ୟା
            </Text>
          </View>
        </View>

        <View style={styles.svgContainer}>
          <Svg width="100%" height={190} viewBox="0 0 340 190">
            <Rect x="0" y="0" width="340" height="190" fill="#FFFBEB" />

            {/* Horizontal Number Axis */}
            <Line x1={20} y1={95} x2={320} y2={95} stroke="#1E293B" strokeWidth={3} />
            <Polygon points="320,91 328,95 320,99" fill="#1E293B" />
            <Polygon points="20,91 12,95 20,99" fill="#1E293B" />

            {/* Tick Marks: -2, -1, 0, 1, 2 */}
            {[
              { x: 50, label: '-2' },
              { x: 110, label: '-1' },
              { x: 170, label: '0' },
              { x: 230, label: '1' },
              { x: 290, label: '2' },
            ].map((tick) => (
              <G key={tick.label}>
                <Line x1={tick.x} y1={87} x2={tick.x} y2={103} stroke="#1E293B" strokeWidth={2} />
                <SvgText x={tick.x - 5} y={120} fontSize="12" fontWeight="bold" fill="#1E293B">
                  {tick.label}
                </SvgText>
              </G>
            ))}

            {/* Rational Point: 3/4 = 0.75 */}
            <G x={215} y={45}>
              <Circle cx={0} cy={50} r={6} fill="#2563EB" />
              <Line x1={0} y1={50} x2={0} y2={15} stroke="#2563EB" strokeWidth={2} strokeDasharray="3, 3" />
              <Rect x={-30} y={-5} width={60} height={20} rx={4} fill="#DBEAFE" stroke="#3B82F6" strokeWidth={1} />
              <SvgText x={-24} y={9} fontSize="10" fontWeight="bold" fill="#1D4ED8">
                3/4 (ପରିମେୟ)
              </SvgText>
            </G>

            {/* Irrational Point: √2 ≈ 1.414 */}
            <G x={255} y={45}>
              <Circle cx={0} cy={50} r={6} fill="#DC2626" />
              <Line x1={0} y1={50} x2={0} y2={15} stroke="#DC2626" strokeWidth={2} strokeDasharray="3, 3" />
              <Rect x={-32} y={-5} width={64} height={20} rx={4} fill="#FEE2E2" stroke="#EF4444" strokeWidth={1} />
              <SvgText x={-26} y={9} fontSize="10" fontWeight="bold" fill="#B91C1C">
                √2 (ଅପରିମେୟ)
              </SvgText>
            </G>
          </Svg>
        </View>

        <View style={[styles.pillBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
          <Text style={[styles.pillText, { color: '#92400E' }]}>
            ✓ ପରିମେୟ ସଂଖ୍ୟା (p/q, q ≠ 0) ଏବଂ ଅପରିମେୟ ସଂଖ୍ୟା ଉଭୟ ସଂଖ୍ୟା ରେଖାରେ ବିନ୍ଦୁ ଦର୍ଶାନ୍ତି
          </Text>
        </View>
      </View>
    );
  }

  // 4. Default: Physics Motion Simulation (Distance vs Displacement)
  return <MotionSimulation mode={mode} />;
}

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
  },
  titleOr: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleEn: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  svgContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  pillBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    textAlign: 'center',
  },
});
