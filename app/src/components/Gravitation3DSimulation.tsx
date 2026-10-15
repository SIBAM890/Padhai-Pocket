import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Line,
  Rect,
  Text as SvgText,
  G,
  Path,
  Polygon,
  Ellipse,
} from 'react-native-svg';
import { colors, radius, shadows, spacing } from '../theme/theme';

export interface Gravitation3DSimulationProps {
  onOpenJugaadLab?: () => void;
  playingVoice?: boolean;
  onToggleVoice?: () => void;
}

export const Gravitation3DSimulation: React.FC<Gravitation3DSimulationProps> = ({
  onOpenJugaadLab,
  playingVoice,
  onToggleVoice,
}) => {
  const [selectedMass, setSelectedMass] = useState<number>(10); // 5, 10, 20, 50 kg
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [earthDrop, setEarthDrop] = useState<number>(0); // 0 (hung) -> 1 (landed)
  const [moonDrop, setMoonDrop] = useState<number>(0);   // 0 (hung) -> 1 (landed)
  const [elapsedEarth, setElapsedEarth] = useState<number>(0);
  const [elapsedMoon, setElapsedMoon] = useState<number>(0);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'SURFACE' | 'ORBIT'>('SURFACE');

  const animTimerRef = useRef<any>(null);

  // Weight calculations: W = mg
  const earthWeight = (selectedMass * 9.8).toFixed(1);
  const moonWeight = (selectedMass * 1.63).toFixed(1);

  // Dynamic spring coil stretch based on mass (px)
  const earthSpringStretch = Math.min(26, Math.max(10, selectedMass * 0.5));
  const moonSpringStretch = Math.min(10, Math.max(3, selectedMass * 0.12));

  // Handle Free Fall Drop Test
  const handleStartDropTest = () => {
    if (isDropping) return;
    setIsDropping(true);
    setHasLanded(false);
    setEarthDrop(0);
    setMoonDrop(0);
    setElapsedEarth(0);
    setElapsedMoon(0);

    const startTime = Date.now();
    const earthDuration = 450; // ms (fast acceleration: 9.8 m/s²)
    const moonDuration = 1100; // ms (slow lunar float: 1.6 m/s²)

    if (animTimerRef.current) clearInterval(animTimerRef.current);

    animTimerRef.current = setInterval(() => {
      const now = Date.now();
      const dt = now - startTime;

      // Earth drop progress (quadratic acceleration curve)
      const pE = Math.min(1, Math.pow(dt / earthDuration, 1.8));
      setEarthDrop(pE);
      setElapsedEarth(Math.min(0.45, Number((dt / 1000).toFixed(2))));

      // Moon drop progress (gentle lunar curve)
      const pM = Math.min(1, Math.pow(dt / moonDuration, 1.8));
      setMoonDrop(pM);
      setElapsedMoon(Math.min(1.10, Number((dt / 1000).toFixed(2))));

      if (dt >= moonDuration) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
        setIsDropping(false);
        setHasLanded(true);
      }
    }, 25);
  };

  const handleReset = () => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setIsDropping(false);
    setHasLanded(false);
    setEarthDrop(0);
    setMoonDrop(0);
    setElapsedEarth(0);
    setElapsedMoon(0);
  };

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, []);

  // Block coordinates during surface view
  // Earth block starting Y (hung on spring) vs landed Y (on sphere surface)
  const earthHungY = 82 + earthSpringStretch;
  const earthLandedY = 126;
  const currentEarthY = earthHungY + earthDrop * (earthLandedY - earthHungY);

  // Moon block starting Y vs landed Y
  const moonHungY = 82 + moonSpringStretch;
  const moonLandedY = 126;
  const currentMoonY = moonHungY + moonDrop * (moonLandedY - moonHungY);

  return (
    <View style={styles.card}>
      {/* Header with Title and Mode Badges */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.titleOr}>୩-D ମାଧ୍ୟାକର୍ଷଣ ଓ ବସ୍ତୁତ୍ୱ (3D Gravitation Sim)</Text>
          <Text style={styles.titleEn}>
            Earth (g = 9.8 m/s²) vs Moon (g = 1.63 m/s² · 1/6th)
          </Text>

          {onToggleVoice && (
            <Pressable
              style={[styles.voiceBtn, playingVoice && styles.voiceBtnActive]}
              onPress={onToggleVoice}
              accessibilityRole="button"
              accessibilityLabel="Listen in Pure Odia Dialect"
            >
              <Text style={styles.voiceBtnIcon}>{playingVoice ? '🔊' : '▶️'}</Text>
              <Text style={[styles.voiceBtnText, playingVoice && styles.voiceBtnTextActive]}>
                {playingVoice ? 'ଶୁଣୁଛନ୍ତି... (Odia Voice)' : '🔊 ଶୁଣନ୍ତୁ (Pure Odia Voice)'}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.badgeGroup}>
          <View style={styles.formulaBadge}>
            <Text style={styles.formulaBadgeText}>W = m · g</Text>
          </View>
        </View>
      </View>

      {/* Interactive Controls Row: View Mode + Mass Selector */}
      <View style={styles.controlsRow}>
        <View style={styles.modeToggleWrap}>
          <Pressable
            style={[styles.modeTab, viewMode === 'SURFACE' && styles.modeTabActive]}
            onPress={() => setViewMode('SURFACE')}
            accessibilityRole="button"
          >
            <Text style={[styles.modeTabText, viewMode === 'SURFACE' && styles.modeTabTextActive]}>
              🪐 3D Surface
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, viewMode === 'ORBIT' && styles.modeTabActive]}
            onPress={() => setViewMode('ORBIT')}
            accessibilityRole="button"
          >
            <Text style={[styles.modeTabText, viewMode === 'ORBIT' && styles.modeTabTextActive]}>
              🛰️ 3D Orbit
            </Text>
          </Pressable>
        </View>

        {/* Mass Selector Pills */}
        <View style={styles.massPillsWrap}>
          <Text style={styles.massLabel}>Mass (m):</Text>
          {[5, 10, 20, 50].map((m) => (
            <Pressable
              key={m}
              style={[styles.massPill, selectedMass === m && styles.massPillActive]}
              onPress={() => {
                setSelectedMass(m);
                handleReset();
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.massPillText, selectedMass === m && styles.massPillTextActive]}>
                {m} kg
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* SVG 3D Canvas */}
      <View style={styles.svgContainer}>
        {viewMode === 'SURFACE' ? (
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Background Canvas */}
            <Rect x="0" y="0" width="340" height="210" fill="#FAF7F0" />

            {/* Subtle Star / Deep Atmosphere Dust */}
            <Circle cx={25} cy={20} r={1.5} fill="#D1D5DB" />
            <Circle cx={120} cy={35} r={1} fill="#D1D5DB" />
            <Circle cx={210} cy={18} r={1.2} fill="#D1D5DB" />
            <Circle cx={315} cy={25} r={1.5} fill="#D1D5DB" />

            {/* Center Separation Boundary */}
            <Line
              x1={170}
              y1={12}
              x2={170}
              y2={198}
              stroke="#E5DAC3"
              strokeWidth={1.5}
              strokeDasharray="4, 4"
            />

            {/* ======================================================== */}
            {/* LEFT SIDE: 3D EARTH (ପୃଥିବୀ)                             */}
            {/* ======================================================== */}
            <G>
              {/* 3D Atmospheric Glow Ring */}
              <Circle
                cx={85}
                cy={192}
                r={60}
                stroke="#60A5FA"
                strokeWidth={3}
                fill="none"
                opacity={0.4}
              />

              {/* 3D Cast Drop Shadow Under Earth */}
              <Ellipse cx={85} cy={195} rx={56} ry={7} fill="#292524" opacity={0.25} />

              {/* 3D Earth Base Sphere with Multi-layered Depth */}
              <Circle cx={85} cy={192} r={56} fill="#1E3A8A" />
              <Circle cx={85} cy={192} r={54} fill="#2563EB" opacity={0.9} />

              {/* 3D Spherical Continents */}
              <Path
                d="M 52 170 Q 65 158, 80 166 T 105 160 Q 115 175, 108 190 T 70 195 Z"
                fill="#15803D"
                opacity={0.85}
              />
              <Path
                d="M 68 185 Q 85 180, 95 192 T 62 200 Z"
                fill="#16A34A"
                opacity={0.9}
              />

              {/* 3D Curved Latitude / Longitude lines */}
              <Path
                d="M 32 185 Q 85 170, 138 185"
                stroke="#93C5FD"
                strokeWidth={1}
                fill="none"
                opacity={0.35}
              />
              <Path
                d="M 85 136 Q 65 192, 85 248"
                stroke="#93C5FD"
                strokeWidth={1}
                fill="none"
                opacity={0.3}
              />

              {/* Specular Light Reflection (Top-Left spherical highlight) */}
              <Circle cx={68} cy={155} r={18} fill="#BFDBFE" opacity={0.45} />
              <Circle cx={64} cy={150} r={6} fill="#FFFFFF" opacity={0.7} />

              {/* Earth Label */}
              <SvgText x={50} y={178} fontSize="11" fontWeight="bold" fill="#EFF6FF">
                ପୃଥିବୀ (Earth)
              </SvgText>

              {/* Earth Data Pill */}
              <Rect x={12} y={12} width={74} height={28} rx={6} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1} />
              <SvgText x={16} y={24} fontSize="9" fontWeight="bold" fill="#1E40AF">
                g = 9.8 m/s²
              </SvgText>
              <SvgText x={16} y={35} fontSize="9" fontWeight="bold" fill="#C2410C">
                W = {earthWeight} N
              </SvgText>

              {/* Spring Top Anchor */}
              <Line x1={85} y1={12} x2={85} y2={28} stroke="#475569" strokeWidth={3} />
              <Rect x={76} y={28} width={18} height={12} rx={3} fill="#64748B" />

              {/* 3D Helical Coil Spring (Stretches when hung) */}
              {!isDropping && !hasLanded && (
                <G>
                  <Path
                    d={`M 85 40 
                        C 72 44, 72 50, 85 54 
                        C 98 58, 98 64, 85 68 
                        C 72 72, 72 ${74 + earthSpringStretch * 0.5}, 85 ${78 + earthSpringStretch * 0.5}
                        C 98 ${82 + earthSpringStretch * 0.5}, 98 ${84 + earthSpringStretch}, 85 ${88 + earthSpringStretch}`}
                    stroke="#0284C7"
                    strokeWidth={2.8}
                    fill="none"
                  />
                  <Line
                    x1={85}
                    y1={88 + earthSpringStretch}
                    x2={85}
                    y2={currentEarthY}
                    stroke="#475569"
                    strokeWidth={2}
                  />
                </G>
              )}

              {/* 3D Projected Floor Shadow under Falling Block */}
              <Ellipse
                cx={85}
                cy={146}
                rx={Math.max(6, 18 - (earthLandedY - currentEarthY) * 0.25)}
                ry={Math.max(2, 5 - (earthLandedY - currentEarthY) * 0.08)}
                fill="#0F172A"
                opacity={0.4}
              />

              {/* 3D Isometric Metallic Mass Block */}
              <G y={currentEarthY - 82}>
                {/* Top Isometric Face */}
                <Polygon
                  points="68,76 77,70 109,70 100,76"
                  fill="#93C5FD"
                  stroke="#3B82F6"
                  strokeWidth={0.8}
                />
                {/* Front Isometric Face */}
                <Rect
                  x={68}
                  y={76}
                  width={32}
                  height={22}
                  rx={2}
                  fill="#2563EB"
                  stroke="#1D4ED8"
                  strokeWidth={1}
                />
                {/* Right Isometric Face */}
                <Polygon
                  points="100,76 109,70 109,92 100,98"
                  fill="#1E40AF"
                  stroke="#1D4ED8"
                  strokeWidth={0.8}
                />
                {/* Text on Front Face */}
                <SvgText x={72} y={91} fontSize="10" fontWeight="bold" fill="#FFFFFF">
                  {selectedMass} kg
                </SvgText>
              </G>

              {/* Force Vector Arrow (Downward Gravitational Pull) */}
              {!isDropping && (
                <G>
                  <Line
                    x1={85}
                    y1={currentEarthY + 20}
                    x2={85}
                    y2={currentEarthY + 40}
                    stroke="#DC2626"
                    strokeWidth={2.8}
                  />
                  <Polygon
                    points={`81,${currentEarthY + 38} 85,${currentEarthY + 45} 89,${currentEarthY + 38}`}
                    fill="#DC2626"
                  />
                  <SvgText x={93} y={currentEarthY + 36} fontSize="9" fontWeight="bold" fill="#DC2626">
                    {earthWeight} N
                  </SvgText>
                </G>
              )}

              {/* Drop Time Indicator */}
              {(isDropping || hasLanded) && (
                <G x={15} y={65}>
                  <Rect x={0} y={0} width={58} height={20} rx={4} fill="#FEF2F2" stroke="#FCA5A5" strokeWidth={1} />
                  <SvgText x={5} y={14} fontSize="9" fontWeight="bold" fill="#991B1B">
                    ⏱️ {elapsedEarth}s {earthDrop >= 1 ? '✓ Landed' : ''}
                  </SvgText>
                </G>
              )}
            </G>

            {/* ======================================================== */}
            {/* CENTER: CONSTANT MASS INVARIANT                          */}
            {/* ======================================================== */}
            <G x={132} y={55}>
              <Rect
                x={0}
                y={0}
                width={76}
                height={38}
                rx={6}
                fill="#FDF8F0"
                stroke="#C2410C"
                strokeWidth={1.2}
              />
              <SvgText x={6} y={15} fontSize="8.5" fontWeight="bold" fill="#C2410C">
                ବସ୍ତୁତ୍ୱ ସର୍ବତ୍ର ସମାନ
              </SvgText>
              <SvgText x={11} y={26} fontSize="9" fontWeight="bold" fill="#143F46">
                Mass = {selectedMass} kg
              </SvgText>
              <SvgText x={17} y={35} fontSize="8" fontWeight="600" fill="#78716C">
                W ÷ 6 (ଚନ୍ଦ୍ରରେ) ➔
              </SvgText>
            </G>

            {/* ======================================================== */}
            {/* RIGHT SIDE: 3D MOON (ଚନ୍ଦ୍ର)                             */}
            {/* ======================================================== */}
            <G>
              {/* 3D Cast Drop Shadow Under Moon */}
              <Ellipse cx={255} cy={195} rx={56} ry={7} fill="#292524" opacity={0.25} />

              {/* 3D Moon Shaded Base Sphere with Terminator Curve */}
              <Circle cx={255} cy={192} r={56} fill="#475569" />
              <Circle cx={255} cy={192} r={54} fill="#64748B" opacity={0.85} />

              {/* 3D Crescent Sunlight on Right / Ambient Top */}
              <Path
                d="M 255 138 A 54 54 0 0 1 306 182 Q 275 185, 255 138 Z"
                fill="#E2E8F0"
                opacity={0.8}
              />

              {/* 3D Craters with Specular Rims & Dark Depths */}
              <G>
                {/* Crater 1 */}
                <Circle cx={235} cy={165} r={8} fill="#334155" />
                <Circle cx={234} cy={164} r={6} fill="#1E293B" />
                <Path
                  d="M 230 162 A 7 7 0 0 1 242 166"
                  stroke="#CBD5E1"
                  strokeWidth={1.2}
                  fill="none"
                />

                {/* Crater 2 */}
                <Circle cx={275} cy={160} r={10} fill="#475569" />
                <Circle cx={274} cy={159} r={8} fill="#334155" />
                <Path
                  d="M 268 156 A 9 9 0 0 1 283 162"
                  stroke="#E2E8F0"
                  strokeWidth={1.2}
                  fill="none"
                />

                {/* Crater 3 */}
                <Circle cx={252} cy={185} r={6} fill="#334155" />
              </G>

              {/* Specular Highlight on Moon */}
              <Circle cx={242} cy={150} r={14} fill="#F8FAFC" opacity={0.4} />

              {/* Moon Label */}
              <SvgText x={224} y={178} fontSize="11" fontWeight="bold" fill="#F8FAFC">
                ଚନ୍ଦ୍ର (Moon)
              </SvgText>

              {/* Moon Data Pill */}
              <Rect x={250} y={12} width={78} height={28} rx={6} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1} />
              <SvgText x={254} y={24} fontSize="9" fontWeight="bold" fill="#334155">
                g = 1.6 m/s²
              </SvgText>
              <SvgText x={254} y={35} fontSize="9" fontWeight="bold" fill="#0284C7">
                W = {moonWeight} N (1/6)
              </SvgText>

              {/* Spring Top Anchor */}
              <Line x1={255} y1={12} x2={255} y2={28} stroke="#475569" strokeWidth={3} />
              <Rect x={246} y={28} width={18} height={12} rx={3} fill="#64748B" />

              {/* 3D Helical Coil Spring on Moon (stretches far less) */}
              {!isDropping && !hasLanded && (
                <G>
                  <Path
                    d={`M 255 40 
                        C 245 44, 245 48, 255 52 
                        C 265 56, 265 60, 255 64 
                        C 245 68, 245 ${70 + moonSpringStretch * 0.5}, 255 ${74 + moonSpringStretch * 0.5}
                        C 265 ${78 + moonSpringStretch * 0.5}, 265 ${80 + moonSpringStretch}, 255 ${84 + moonSpringStretch}`}
                    stroke="#64748B"
                    strokeWidth={2.4}
                    fill="none"
                  />
                  <Line
                    x1={255}
                    y1={84 + moonSpringStretch}
                    x2={255}
                    y2={currentMoonY}
                    stroke="#475569"
                    strokeWidth={2}
                  />
                </G>
              )}

              {/* 3D Projected Floor Shadow under Moon Falling Block */}
              <Ellipse
                cx={255}
                cy={146}
                rx={Math.max(6, 18 - (moonLandedY - currentMoonY) * 0.25)}
                ry={Math.max(2, 5 - (moonLandedY - currentMoonY) * 0.08)}
                fill="#0F172A"
                opacity={0.35}
              />

              {/* 3D Isometric Metallic Mass Block on Moon */}
              <G y={currentMoonY - 82}>
                {/* Top Isometric Face */}
                <Polygon
                  points="238,76 247,70 279,70 270,76"
                  fill="#E2E8F0"
                  stroke="#94A3B8"
                  strokeWidth={0.8}
                />
                {/* Front Isometric Face */}
                <Rect
                  x={238}
                  y={76}
                  width={32}
                  height={22}
                  rx={2}
                  fill="#64748B"
                  stroke="#475569"
                  strokeWidth={1}
                />
                {/* Right Isometric Face */}
                <Polygon
                  points="270,76 279,70 279,92 270,98"
                  fill="#334155"
                  stroke="#1E293B"
                  strokeWidth={0.8}
                />
                {/* Text on Front Face */}
                <SvgText x={242} y={91} fontSize="10" fontWeight="bold" fill="#FFFFFF">
                  {selectedMass} kg
                </SvgText>
              </G>

              {/* Weak Moon Force Vector */}
              {!isDropping && (
                <G>
                  <Line
                    x1={255}
                    y1={currentMoonY + 20}
                    x2={255}
                    y2={currentMoonY + 30}
                    stroke="#EA580C"
                    strokeWidth={2}
                  />
                  <Polygon
                    points={`252,${currentMoonY + 28} 255,${currentMoonY + 34} 258,${currentMoonY + 28}`}
                    fill="#EA580C"
                  />
                  <SvgText x={262} y={currentMoonY + 29} fontSize="8.5" fontWeight="bold" fill="#EA580C">
                    {moonWeight} N
                  </SvgText>
                </G>
              )}

              {/* Drop Time Indicator */}
              {(isDropping || hasLanded) && (
                <G x={265} y={65}>
                  <Rect x={0} y={0} width={62} height={20} rx={4} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1} />
                  <SvgText x={5} y={14} fontSize="9" fontWeight="bold" fill="#1D4ED8">
                    ⏱️ {elapsedMoon}s {moonDrop >= 1 ? '✓ Landed' : ''}
                  </SvgText>
                </G>
              )}
            </G>
          </Svg>
        ) : (
          /* ======================================================== */
          /* 3D ORBIT & SATELLITE GRAVITATIONAL FIELD VIEW            */
          /* ======================================================== */
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            <Rect x="0" y="0" width="340" height="210" fill="#0F172A" />

            {/* Stars */}
            <Circle cx={40} cy={30} r={1.5} fill="#FFFFFF" />
            <Circle cx={120} cy={18} r={1.2} fill="#93C5FD" />
            <Circle cx={280} cy={45} r={1.5} fill="#FFFFFF" />
            <Circle cx={310} cy={160} r={1.2} fill="#FDE68A" />
            <Circle cx={30} cy={180} r={1} fill="#FFFFFF" />

            {/* 3D Inclined Elliptical Orbit Track */}
            <Ellipse
              cx={170}
              cy={110}
              rx={130}
              ry={48}
              stroke="#38BDF8"
              strokeWidth={1.8}
              strokeDasharray="4, 4"
              fill="none"
              opacity={0.7}
            />

            {/* Central 3D Earth Sphere in Space */}
            <G x={170} y={110}>
              <Circle cx={0} cy={0} r={32} fill="#1E3A8A" />
              <Circle cx={0} cy={0} r={30} fill="#2563EB" opacity={0.9} />
              <Path
                d="M -15 -10 Q 0 -18, 12 -8 T 16 12 Q -2 18, -12 10 Z"
                fill="#16A34A"
                opacity={0.85}
              />
              <Circle cx={-10} cy={-10} r={10} fill="#93C5FD" opacity={0.4} />
              <SvgText x={-18} y={4} fontSize="10" fontWeight="bold" fill="#FFFFFF">
                ପୃଥିବୀ
              </SvgText>
            </G>

            {/* Orbiting Moon on the 3D Ellipse */}
            <G x={280} y={125}>
              <Circle cx={0} cy={0} r={14} fill="#64748B" />
              <Circle cx={-3} cy={-3} r={3} fill="#334155" />
              <Circle cx={4} cy={2} r={2} fill="#334155" />
              <Circle cx={-4} cy={-4} r={5} fill="#F1F5F9" opacity={0.4} />
              <SvgText x={-12} y={22} fontSize="9" fontWeight="bold" fill="#E2E8F0">
                ଚନ୍ଦ୍ର (Moon)
              </SvgText>

              {/* Centripetal Gravitational Vector pointing to Earth */}
              <Line x1={-12} y1={-2} x2={-45} y2={-8} stroke="#EF4444" strokeWidth={2} />
              <Polygon points="-43,-11 -50,-9 -44,-5" fill="#EF4444" />
              <SvgText x={-55} y={-14} fontSize="8.5" fontWeight="bold" fill="#F87171">
                F_grav
              </SvgText>
            </G>

            {/* Satellite in Low Earth Orbit */}
            <G x={85} y={80}>
              <Rect x={-6} y={-4} width={12} height={8} fill="#F59E0B" rx={1} />
              <Line x1={-14} y1={0} x2={-6} y2={0} stroke="#38BDF8" strokeWidth={2} />
              <Line x1={6} y1={0} x2={14} y2={0} stroke="#38BDF8" strokeWidth={2} />
              <SvgText x={-20} y={-8} fontSize="8.5" fontWeight="bold" fill="#FBBF24">
                Satellite (ଉପଗ୍ରହ)
              </SvgText>
            </G>

            <SvgText x={15} y={200} fontSize="10" fontWeight="bold" fill="#94A3B8">
              ମହାକାଶ କକ୍ଷପଥ: F = G · (M · m) / r² (କେନ୍ଦ୍ରାଭିମୁଖୀ ବଳ)
            </SvgText>
          </Svg>
        )}
      </View>

      {/* Free Fall Drop Test Interactive Action Card */}
      {viewMode === 'SURFACE' && (
        <View style={styles.actionCard}>
          <View style={styles.actionCardTop}>
            <Text style={styles.actionTitle}>
              {hasLanded
                ? '🎯 ପରୀକ୍ଷା ସମ୍ପନ୍ନ: ପୃଥିବୀରେ ବସ୍ତୁ ୬ ଗୁଣ ଦ୍ରୁତ ଗତିରେ ପଡ଼ିଲା!'
                : '🔬 ୩-D ମୁକ୍ତ ପତନ ପରୀକ୍ଷା (Free Fall Experiment)'}
            </Text>
            <Pressable
              style={[styles.dropTestBtn, isDropping && styles.dropTestBtnActive]}
              onPress={hasLanded ? handleReset : handleStartDropTest}
              accessibilityRole="button"
            >
              <Text style={styles.dropTestBtnText}>
                {isDropping
                  ? 'ଖସୁଛି (Dropping...)'
                  : hasLanded
                  ? '🔄 Reset (ପୁନର୍ବାର ସେଟ୍)'
                  : '▶️ 3D ଖସାଇ ପରୀକ୍ଷା କରନ୍ତୁ (Drop Test)'}
              </Text>
            </Pressable>
          </View>

          {/* Student Takeaway */}
          <View style={styles.takeawayPill}>
            <Text style={styles.takeawayText}>
              ✓ ବସ୍ତୁତ୍ୱ ({selectedMass} kg) ସବୁ ସ୍ଥାନରେ ସମାନ; କିନ୍ତୁ ଚନ୍ଦ୍ରରେ ମାଧ୍ୟାକର୍ଷଣ କମ୍ ଥିବାରୁ ଓଜନ 1/6th ({moonWeight} N) ହୋଇଯାଏ।
            </Text>
          </View>
        </View>
      )}

      {/* Pocket Jugaad Lab Pendulum Launch */}
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  titleOr: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  titleEn: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeGroup: {
    alignItems: 'flex-end',
  },
  formulaBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formulaBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
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
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  modeToggleWrap: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modeTabTextActive: {
    color: colors.primary,
  },
  massPillsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  massLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 2,
  },
  massPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  massPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  massPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  massPillTextActive: {
    color: '#FFFFFF',
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
  },
  actionCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    minWidth: 160,
  },
  dropTestBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.xs,
  },
  dropTestBtnActive: {
    backgroundColor: '#9A3412',
  },
  dropTestBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  takeawayPill: {
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  takeawayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    lineHeight: 16,
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
  jugaadBannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
