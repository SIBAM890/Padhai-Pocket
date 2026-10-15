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
import { Biology3DSimulation } from './Biology3DSimulation';
import { Maths3DSimulation } from './Maths3DSimulation';
import { Maths3DEquationSolver } from './Maths3DEquationSolver';
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
  const [mathsSubView, setMathsSubView] = useState<'EQUATION_SOLVER' | 'SPIRAL_TRIG'>('EQUATION_SOLVER');

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

  // 2. Biology Simulation (3D Cell Explorer & 3D Osmosis Turgidity Lab)
  if (s === 'biology' || c.includes('bio') || c.includes('cell')) {
    return (
      <Biology3DSimulation
        onOpenJugaadLab={onOpenJugaadLab}
        playingVoice={playingKey === 'biology'}
        onToggleVoice={() => handlePlayVoice('biology')}
      />
    );
  }

  // 3. Mathematics Simulation (3D Equation Solver 3x - 2y + 2 = 0 & 3D Number Spiral)
  if (s === 'maths' || s === 'mathematics' || c.includes('math') || c.includes('rational') || c.includes('poly') || c.includes('eq')) {
    return (
      <View>
        <View style={styles.mathsNavRow}>
          <Pressable
            style={[styles.mathsNavBtn, mathsSubView === 'EQUATION_SOLVER' && styles.mathsNavBtnActive]}
            onPress={() => setMathsSubView('EQUATION_SOLVER')}
            accessibilityRole="button"
            accessibilityLabel="Switch to 3D Equation Solver"
          >
            <Text style={[styles.mathsNavBtnText, mathsSubView === 'EQUATION_SOLVER' && styles.mathsNavBtnTextActive]}>
              ⭐ ୩D ସମୀକରଣ (3x - 2y + 2 = 0)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.mathsNavBtn, mathsSubView === 'SPIRAL_TRIG' && styles.mathsNavBtnActive]}
            onPress={() => setMathsSubView('SPIRAL_TRIG')}
            accessibilityRole="button"
            accessibilityLabel="Switch to 3D Number Spiral & Trigonometry"
          >
            <Text style={[styles.mathsNavBtnText, mathsSubView === 'SPIRAL_TRIG' && styles.mathsNavBtnTextActive]}>
              🌀 ୩D ସଂଖ୍ୟା ରେଖା ଓ ତ୍ରିକୋଣମିତି
            </Text>
          </Pressable>
        </View>

        {mathsSubView === 'EQUATION_SOLVER' ? (
          <Maths3DEquationSolver
            onOpenJugaadLab={onOpenJugaadLab}
            playingVoice={playingKey === 'maths'}
            onToggleVoice={() => handlePlayVoice('maths')}
          />
        ) : (
          <Maths3DSimulation
            onOpenJugaadLab={onOpenJugaadLab}
            playingVoice={playingKey === 'maths'}
            onToggleVoice={() => handlePlayVoice('maths')}
          />
        )}
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
  mathsNavRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  mathsNavBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mathsNavBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  mathsNavBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  mathsNavBtnTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },
});
