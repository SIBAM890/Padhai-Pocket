import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
import { Gravitation3DSimulation } from './Gravitation3DSimulation';
import { Chemistry3DSimulation } from './Chemistry3DSimulation';
import { colors, radius, shadows, spacing } from '../theme/theme';
import { playOdiaVoice, stopOdiaAudio, type OdiaAudioKey } from '../audio/odiaAudio';

export interface SubjectVisualizerProps {
  subject: string;
  chunkId?: string;
  mode?: 'interactive' | 'probe' | 'compact';
  onOpenJugaadLab?: () => void;
}

export function SubjectVisualizer({
  subject,
  chunkId,
  mode = 'interactive',
  onOpenJugaadLab,
}: SubjectVisualizerProps) {
  const [playingKey, setPlayingKey] = useState<OdiaAudioKey | null>(null);

  useEffect(() => {
    return () => {
      stopOdiaAudio();
    };
  }, []);

  const handlePlayVoice = (key: OdiaAudioKey) => {
    if (playingKey === key) {
      stopOdiaAudio();
      setPlayingKey(null);
      return;
    }
    setPlayingKey(key);
    playOdiaVoice({
      key,
      onStart: () => setPlayingKey(key),
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null),
    });
  };

  const s = subject?.toLowerCase() || 'physics';
  const c = chunkId?.toLowerCase() || '';

  // 1. Chemistry Simulation (3D Molecular Substitution & 3D States of Matter)
  if (s === 'chemistry' || c.includes('chem') || c.includes('carbon')) {
    return (
      <Chemistry3DSimulation
        onOpenJugaadLab={onOpenJugaadLab}
        playingVoice={playingKey === 'chemistry'}
        onToggleVoice={() => handlePlayVoice('chemistry')}
      />
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
            <Pressable
              style={[styles.voiceBtn, playingKey === 'biology' && styles.voiceBtnActive]}
              onPress={() => handlePlayVoice('biology')}
              accessibilityRole="button"
              accessibilityLabel="Listen in Pure Odia Dialect"
            >
              <Text style={styles.voiceBtnIcon}>{playingKey === 'biology' ? '🔊' : '▶️'}</Text>
              <Text style={[styles.voiceBtnText, playingKey === 'biology' && styles.voiceBtnTextActive]}>
                {playingKey === 'biology' ? 'ଶୁଣୁଛନ୍ତି... (Playing Odia Dialect)' : '🔊 ଶୁଣନ୍ତୁ (Pure Odia Voice)'}
              </Text>
            </Pressable>
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
            <Pressable
              style={[styles.voiceBtn, playingKey === 'maths' && styles.voiceBtnActive]}
              onPress={() => handlePlayVoice('maths')}
              accessibilityRole="button"
              accessibilityLabel="Listen in Pure Odia Dialect"
            >
              <Text style={styles.voiceBtnIcon}>{playingKey === 'maths' ? '🔊' : '▶️'}</Text>
              <Text style={[styles.voiceBtnText, playingKey === 'maths' && styles.voiceBtnTextActive]}>
                {playingKey === 'maths' ? 'ଶୁଣୁଛନ୍ତି... (Playing Odia Dialect)' : '🔊 ଶୁଣନ୍ତୁ (Pure Odia Voice)'}
              </Text>
            </Pressable>
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

  // 4. Physics Gravitation Simulation (3D Gravitation & Mass vs Weight)
  if (
    c.includes('grav') ||
    c.includes('mass') ||
    c.includes('weight') ||
    c.includes('universal') ||
    c === 'BSE9-PHYS-GRAV-S03-01' ||
    c === 'BSE9-PHYS-GRAV-S03-02'
  ) {
    return (
      <Gravitation3DSimulation
        onOpenJugaadLab={onOpenJugaadLab}
        playingVoice={playingKey === 'gravitation'}
        onToggleVoice={() => handlePlayVoice('gravitation')}
      />
    );
  }

  // 5. Default: Physics Motion Simulation (Distance vs Displacement)
  return (
    <View>
      <MotionSimulation mode={mode} />
      {onOpenJugaadLab && (
        <Pressable
          style={styles.jugaadMotionBtn}
          onPress={onOpenJugaadLab}
          accessibilityRole="button"
          accessibilityLabel="Open Pocket Jugaad Lab Ramp Experiment"
        >
          <Text style={styles.jugaadBannerBtnText}>
            🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ ରେ ଦୂରତା ଓ ବିସ୍ଥାପନ ପରୀକ୍ଷା (Launch Ramp Lab) ➔
          </Text>
        </Pressable>
      )}
    </View>
  );
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
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    marginTop: spacing.xs + 2,
    alignSelf: 'flex-start',
    gap: 4,
  },
  voiceBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  voiceBtnIcon: {
    fontSize: 12,
  },
  voiceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  voiceBtnTextActive: {
    color: '#15803D',
  },
  jugaadBannerBtn: {
    backgroundColor: '#0284C7',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jugaadMotionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: radius.card,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  jugaadBannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
