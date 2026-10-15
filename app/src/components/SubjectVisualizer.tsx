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
            <Pressable
              style={[styles.voiceBtn, playingKey === 'chemistry' && styles.voiceBtnActive]}
              onPress={() => handlePlayVoice('chemistry')}
              accessibilityRole="button"
              accessibilityLabel="Listen in Pure Odia Dialect"
            >
              <Text style={styles.voiceBtnIcon}>{playingKey === 'chemistry' ? '🔊' : '▶️'}</Text>
              <Text style={[styles.voiceBtnText, playingKey === 'chemistry' && styles.voiceBtnTextActive]}>
                {playingKey === 'chemistry' ? 'ଶୁଣୁଛନ୍ତି... (Playing Odia Dialect)' : '🔊 ଶୁଣନ୍ତୁ (Pure Odia Voice)'}
              </Text>
            </Pressable>
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
              <Line x1={0} y1={10} x2={25} y2={10} stroke="#C2410C" strokeWidth={3} />
              <Polygon points="25,5 33,10 25,15" fill="#C2410C" />
              <SvgText x={-2} y={-2} fontSize="9" fontWeight="bold" fill="#C2410C">
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

  // 4. Physics Gravitation Simulation (Mass vs Weight & Earth vs Moon)
  if (
    c.includes('grav') ||
    c.includes('mass') ||
    c.includes('weight') ||
    c.includes('universal') ||
    c === 'BSE9-PHYS-GRAV-S03-01' ||
    c === 'BSE9-PHYS-GRAV-S03-02'
  ) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.titleOr}>ବସ୍ତୁତ୍ୱ ଓ ଭାର • 2D Gravitation Sim</Text>
            <Text style={styles.titleEn}>
              Earth (g = 9.8 m/s²) vs Moon (g = 1.6 m/s² · 1/6th)
            </Text>
            <Pressable
              style={[styles.voiceBtn, playingKey === 'gravitation' && styles.voiceBtnActive]}
              onPress={() => handlePlayVoice('gravitation')}
              accessibilityRole="button"
              accessibilityLabel="Listen in Pure Odia Dialect"
            >
              <Text style={styles.voiceBtnIcon}>{playingKey === 'gravitation' ? '🔊' : '▶️'}</Text>
              <Text style={[styles.voiceBtnText, playingKey === 'gravitation' && styles.voiceBtnTextActive]}>
                {playingKey === 'gravitation' ? 'ଶୁଣୁଛନ୍ତି... (Playing Odia Dialect)' : '🔊 ଶୁଣନ୍ତୁ (Pure Odia Voice)'}
              </Text>
            </Pressable>
          </View>
          <View style={[styles.badge, { backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' }]}>
            <Text style={[styles.badgeText, { color: '#6D28D9' }]}>
              ମାଧ୍ୟାକର୍ଷଣ • W = mg
            </Text>
          </View>
        </View>

        <View style={styles.svgContainer}>
          <Svg width="100%" height={190} viewBox="0 0 340 190">
            <Rect x="0" y="0" width="340" height="190" fill="#F8FAFC" />

            {/* Middle Divider */}
            <Line x1={170} y1={15} x2={170} y2={175} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3, 3" />

            {/* --- LEFT: EARTH (ପୃଥିବୀ) --- */}
            {/* Earth Surface Sphere */}
            <Circle cx={85} cy={185} r={55} fill="#DBEAFE" stroke="#3B82F6" strokeWidth={2} />
            <SvgText x={55} y={160} fontSize="11" fontWeight="bold" fill="#1D4ED8">
              ପୃଥିବୀ (Earth)
            </SvgText>

            {/* Earth Data Badge */}
            <Rect x={15} y={15} width="68" height="28" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1} />
            <SvgText x={19} y={27} fontSize="9" fontWeight="bold" fill="#1E40AF">g = 9.8 m/s²</SvgText>
            <SvgText x={19} y={38} fontSize="9" fontWeight="bold" fill="#2563EB">W = 98 N</SvgText>

            {/* Earth Spring Scale */}
            <Line x1={85} y1={20} x2={85} y2={45} stroke="#64748B" strokeWidth={2} />
            <Rect x={70} y={45} width="30" height="38" rx="4" fill="#E2E8F0" stroke="#475569" strokeWidth={2} />
            <Path d="M 78 52 L 92 56 L 78 60 L 92 64 L 85 70" stroke="#3B82F6" strokeWidth={2} fill="none" />
            <Line x1={85} y1={83} x2={85} y2={92} stroke="#475569" strokeWidth={2} />

            {/* 10 kg Block on Earth */}
            <Rect x={67} y={92} width="36" height="28" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth={2} />
            <SvgText x={73} y={110} fontSize="11" fontWeight="bold" fill="#FFFFFF">10 kg</SvgText>

            {/* Earth Gravity Vector (Heavy Downward Force) */}
            <Line x1={85} y1={123} x2={85} y2={143} stroke="#DC2626" strokeWidth={3} />
            <Polygon points="81,141 85,147 89,141" fill="#DC2626" />
            <SvgText x={94} y={137} fontSize="9" fontWeight="bold" fill="#DC2626">98 N</SvgText>

            {/* --- CENTER: CONSTANT MASS BADGE --- */}
            <Rect x={135} y={65} width="70" height="32" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth={1} />
            <SvgText x={141} y={78} fontSize="8" fontWeight="bold" fill="#92400E">ବସ୍ତୁତ୍ୱ ସମାନ</SvgText>
            <SvgText x={140} y={90} fontSize="9" fontWeight="bold" fill="#B45309">Mass = 10 kg</SvgText>
            <SvgText x={143} y={120} fontSize="10" fontWeight="bold" fill="#7C3AED">W ÷ 6 ➔</SvgText>

            {/* --- RIGHT: MOON (ଚନ୍ଦ୍ର) --- */}
            {/* Moon Surface Sphere */}
            <Circle cx={255} cy={185} r={55} fill="#E2E8F0" stroke="#94A3B8" strokeWidth={2} />
            <Circle cx={235} cy={155} r={4} fill="#CBD5E1" />
            <Circle cx={275} cy={165} r={6} fill="#CBD5E1" />
            <SvgText x={232} y={160} fontSize="11" fontWeight="bold" fill="#475569">
              ଚନ୍ଦ୍ର (Moon)
            </SvgText>

            {/* Moon Data Badge */}
            <Rect x={255} y={15} width="72" height="28" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1} />
            <SvgText x={259} y={27} fontSize="9" fontWeight="bold" fill="#334155">g = 1.6 m/s²</SvgText>
            <SvgText x={259} y={38} fontSize="9" fontWeight="bold" fill="#64748B">W = 16.3 N (1/6)</SvgText>

            {/* Moon Spring Scale (Slightly Stretched) */}
            <Line x1={255} y1={20} x2={255} y2={45} stroke="#64748B" strokeWidth={2} />
            <Rect x={240} y={45} width="30" height="38" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth={2} />
            <Path d="M 248 54 L 262 57 L 248 60 L 255 65" stroke="#94A3B8" strokeWidth={2} fill="none" />
            <Line x1={255} y1={83} x2={255} y2={92} stroke="#64748B" strokeWidth={2} />

            {/* Same 10 kg Block on Moon */}
            <Rect x={237} y={92} width="36" height="28" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth={2} />
            <SvgText x={243} y={110} fontSize="11" fontWeight="bold" fill="#FFFFFF">10 kg</SvgText>

            {/* Moon Gravity Vector (1/6th Force) */}
            <Line x1={255} y1={123} x2={255} y2={133} stroke="#DC2626" strokeWidth={2} />
            <Polygon points="252,131 255,137 258,131" fill="#DC2626" />
            <SvgText x={262} y={133} fontSize="8" fontWeight="bold" fill="#DC2626">16.3 N</SvgText>
          </Svg>
        </View>

        <View style={[styles.pillBox, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
          <Text style={[styles.pillText, { color: '#6D28D9' }]}>
            ✓ ବସ୍ତୁତ୍ୱ (10 kg) ସବୁ ସ୍ଥାନରେ ସମାନ ରହେ; କିନ୍ତୁ ଚନ୍ଦ୍ରରେ ମାଧ୍ୟାକର୍ଷଣ କମ୍ ଥିବାରୁ ଓଜନ 1/6 ହୋଇଯାଏ (W = mg)
          </Text>
        </View>

        {onOpenJugaadLab && (
          <Pressable
            style={styles.jugaadBannerBtn}
            onPress={onOpenJugaadLab}
            accessibilityRole="button"
            accessibilityLabel="Open Pocket Jugaad Lab Pendulum Experiment"
          >
            <Text style={styles.jugaadBannerBtnText}>
              🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ ରେ ମାଧ୍ୟାକର୍ଷଣ (g) ମାପନ୍ତୁ (Launch Pendulum Lab) ➔
            </Text>
          </Pressable>
        )}
      </View>
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
