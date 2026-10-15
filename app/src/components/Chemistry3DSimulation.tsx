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

export interface Chemistry3DSimulationProps {
  onOpenJugaadLab?: () => void;
  playingVoice?: boolean;
  onToggleVoice?: () => void;
}

// 3D Point Interface
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Atom3D {
  id: string;
  symbol: string;
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  highlightColor: string;
  shadowColor: string;
  labelColor: string;
}

interface Bond3D {
  fromId: string;
  toId: string;
  strokeWidth: number;
  color: string;
}

export const Chemistry3DSimulation: React.FC<Chemistry3DSimulationProps> = ({
  onOpenJugaadLab,
  playingVoice,
  onToggleVoice,
}) => {
  // Mode: 3D Reaction vs 3D States of Matter
  const [viewMode, setViewMode] = useState<'REACTION' | 'MATTER'>('REACTION');

  // Reaction state: step 0 (Reactants), 1 (Cleavage), 2 (Substitution), 3 (Products)
  const [reactionStep, setReactionStep] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);

  // 3D rotation angle for molecule (in degrees)
  const [rotAngle, setRotAngle] = useState<number>(25);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Matter state: Temperature (-10°C, 25°C, 100°C)
  const [temperature, setTemperature] = useState<number>(25);

  const autoPlayTimerRef = useRef<any>(null);
  const spinTimerRef = useRef<any>(null);

  // Auto-play steps
  useEffect(() => {
    if (isPlayingAuto) {
      autoPlayTimerRef.current = setInterval(() => {
        setReactionStep((prev) => {
          if (prev >= 3) {
            setIsPlayingAuto(false);
            return 3;
          }
          return prev + 1;
        });
      }, 1800);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlayingAuto]);

  // Continuous 3D rotation toggle
  useEffect(() => {
    if (isRotating) {
      spinTimerRef.current = setInterval(() => {
        setRotAngle((prev) => (prev + 3) % 360);
      }, 40);
    } else {
      if (spinTimerRef.current) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
      }
    }
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    };
  }, [isRotating]);

  // 3D Transformation Math: Rotate around Y-axis by rotAngle, with slight pitch tilt (15 deg)
  const project3D = (p: Point3D, cx: number, cy: number) => {
    const radY = (rotAngle * Math.PI) / 180;
    const radX = (15 * Math.PI) / 180;

    // Rotate Y
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const x1 = p.x * cosY - p.z * sinY;
    const z1 = p.x * sinY + p.z * cosY;

    // Pitch X
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const y2 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;

    // Perspective factor
    const cameraDist = 260;
    const scale = cameraDist / (cameraDist + z2);

    return {
      screenX: cx + x1 * scale,
      screenY: cy + y2 * scale,
      depth: z2,
      scale,
    };
  };

  // Build tetrahedral methane atoms according to current reaction step
  // In tetrahedral geometry, carbon is at origin (0,0,0)
  // Step 0: CH4 + Cl2
  // Step 1: Sunlight hv splitting Cl-Cl
  // Step 2: Cl attacking C, displacing H
  // Step 3: CH3Cl + HCl
  const getReactionAtomsAndBonds = () => {
    // Center for methane molecule in SVG canvas
    const cxM = 105;
    const cyM = 92;

    // Center for chlorine molecule
    const cxCl = 260;
    const cyCl = 92;

    // Tetrahedral offsets for Methane (radius ~ 36)
    // H1 (top): (0, -38, 0)
    // H2 (bottom-front-left): (-32, 20, 24)
    // H3 (bottom-front-right): (32, 20, 24)
    // H4 (bottom-back): (0, 22, -36)
    let h1Pos: Point3D = { x: 0, y: -38, z: 0 };
    let cl1Pos: Point3D = { x: -22, y: 0, z: 0 };
    let cl2Pos: Point3D = { x: 22, y: 0, z: 0 };
    let subClPos: Point3D | null = null;
    let releasedHPos: Point3D | null = null;

    if (reactionStep === 1) {
      // Cl2 bond stretched/cleaved by sunlight
      cl1Pos = { x: -38, y: -8, z: 0 };
      cl2Pos = { x: 38, y: 8, z: 0 };
    } else if (reactionStep === 2) {
      // Cl1 migrating towards top of methane (substituting H1)
      cl1Pos = { x: -125, y: -30, z: 10 };
      h1Pos = { x: 40, y: -50, z: -10 }; // H1 displaced
      cl2Pos = { x: 32, y: 15, z: 0 };
    } else if (reactionStep === 3) {
      // Cl substituted into methane at top position!
      subClPos = { x: 0, y: -42, z: 0 };
      releasedHPos = { x: 5, y: -18, z: 0 };
      cl2Pos = { x: 30, y: 0, z: 0 };
    }

    const atoms: Atom3D[] = [];
    const bonds: Bond3D[] = [];

    // Carbon (Slate/Dark Charcoal)
    atoms.push({
      id: 'C',
      symbol: 'C',
      x: 0,
      y: 0,
      z: 0,
      r: 18,
      color: '#334155',
      highlightColor: '#64748B',
      shadowColor: '#0F172A',
      labelColor: '#FFFFFF',
    });

    // H2, H3, H4 always on Carbon
    atoms.push(
      {
        id: 'H2',
        symbol: 'H',
        x: -32,
        y: 20,
        z: 24,
        r: 12,
        color: '#0284C7',
        highlightColor: '#38BDF8',
        shadowColor: '#0369A1',
        labelColor: '#FFFFFF',
      },
      {
        id: 'H3',
        symbol: 'H',
        x: 32,
        y: 20,
        z: 24,
        r: 12,
        color: '#0284C7',
        highlightColor: '#38BDF8',
        shadowColor: '#0369A1',
        labelColor: '#FFFFFF',
      },
      {
        id: 'H4',
        symbol: 'H',
        x: 0,
        y: 22,
        z: -36,
        r: 11,
        color: '#0284C7',
        highlightColor: '#38BDF8',
        shadowColor: '#0369A1',
        labelColor: '#FFFFFF',
      }
    );

    bonds.push(
      { fromId: 'C', toId: 'H2', strokeWidth: 4, color: '#94A3B8' },
      { fromId: 'C', toId: 'H3', strokeWidth: 4, color: '#94A3B8' },
      { fromId: 'C', toId: 'H4', strokeWidth: 4, color: '#64748B' }
    );

    if (reactionStep < 3) {
      // Original H1 still in play
      atoms.push({
        id: 'H1',
        symbol: 'H',
        x: h1Pos.x,
        y: h1Pos.y,
        z: h1Pos.z,
        r: 12,
        color: reactionStep === 2 ? '#EF4444' : '#0284C7',
        highlightColor: reactionStep === 2 ? '#F87171' : '#38BDF8',
        shadowColor: reactionStep === 2 ? '#B91C1C' : '#0369A1',
        labelColor: '#FFFFFF',
      });
      if (reactionStep < 2) {
        bonds.push({ fromId: 'C', toId: 'H1', strokeWidth: 4, color: '#94A3B8' });
      }
    } else {
      // Step 3: Chloromethane! Chlorine attached to Carbon!
      atoms.push({
        id: 'Cl_Sub',
        symbol: 'Cl',
        x: subClPos!.x,
        y: subClPos!.y,
        z: subClPos!.z,
        r: 16,
        color: '#16A34A',
        highlightColor: '#4ADE80',
        shadowColor: '#14532D',
        labelColor: '#FFFFFF',
      });
      bonds.push({ fromId: 'C', toId: 'Cl_Sub', strokeWidth: 5, color: '#22C55E' });
    }

    return { atoms, bonds, cxM, cyM, cxCl, cyCl, cl1Pos, cl2Pos, reactionStep, releasedHPos };
  };

  const { atoms, bonds, cxM, cyM, cxCl, cyCl, cl1Pos, cl2Pos, releasedHPos } =
    getReactionAtomsAndBonds();

  // Project all methane atoms with 3D perspective and sort by depth for correct occlusion
  const projectedAtoms = atoms.map((atom) => {
    const proj = project3D({ x: atom.x, y: atom.y, z: atom.z }, cxM, cyM);
    return {
      ...atom,
      screenX: proj.screenX,
      screenY: proj.screenY,
      depth: proj.depth,
      scale: proj.scale,
      appR: atom.r * proj.scale,
    };
  });

  // Sort atoms by depth ascending (background atoms drawn first)
  const sortedAtoms = [...projectedAtoms].sort((a, b) => a.depth - b.depth);

  // Project bonds
  const atomMap: Record<string, (typeof projectedAtoms)[0]> = {};
  projectedAtoms.forEach((a) => {
    atomMap[a.id] = a;
  });

  // 3D Particles for States of Matter
  // Generate 3D particulate coordinates based on temperature
  const getMatterParticles = () => {
    const particles: { x: number; y: number; z: number; color: string; r: number }[] = [];
    const baseBoxW = 180;
    const baseBoxH = 100;
    const cxBox = 170;
    const cyBox = 100;

    if (temperature === -10) {
      // Solid: Ordered 3D crystal cubic grid (Ice lattice)
      // 3 layers in depth (z = -20, 0, 20), 4 rows, 4 cols
      for (let z = -20; z <= 20; z += 20) {
        for (let y = 10; y <= 50; y += 14) {
          for (let x = -40; x <= 40; x += 20) {
            // tiny thermal vibration jitter
            const jx = (Math.sin(x * 3 + y) * 1.5);
            const jy = (Math.cos(y * 2 + z) * 1.5);
            particles.push({
              x: x + jx,
              y: y + jy,
              z: z,
              color: '#38BDF8',
              r: 6.5,
            });
          }
        }
      }
    } else if (temperature === 25) {
      // Liquid: Denser at bottom of beaker, flowing and disordered
      const liquidSeeds = [
        [-50, 48, -15], [-30, 46, -10], [-10, 49, -18], [15, 47, -12], [35, 49, -15], [52, 47, -8],
        [-45, 34, 0],   [-25, 32, 8],   [-5, 36, -5],   [12, 33, 10],  [30, 35, 2],   [48, 33, -2],
        [-38, 20, 15],  [-18, 18, 12],  [0, 22, 18],    [22, 19, 14],  [40, 21, 10],
        [-25, 6, 5],    [-8, 7, 12],    [12, 5, 8],     [30, 8, -4],
        [-15, -4, 0],   [5, -3, 6],
      ];
      liquidSeeds.forEach(([x, y, z]) => {
        particles.push({
          x,
          y,
          z,
          color: '#0284C7',
          r: 6.5,
        });
      });
    } else {
      // Gas: Free particles with high velocities throughout the chamber
      const gasSeeds = [
        [-60, -35, 15], [-20, -40, -15], [30, -30, 20], [60, -25, -5],
        [-50, -10, -20], [-10, -8, 10],  [20, -15, -10], [55, -5, 18],
        [-65, 15, 5],   [-30, 20, -15],  [5, 15, 20],    [45, 22, -18],
        [-40, 45, 12],  [0, 42, -8],     [35, 46, 15],   [60, 40, -10],
      ];
      gasSeeds.forEach(([x, y, z]) => {
        particles.push({
          x,
          y,
          z,
          color: '#F97316',
          r: 6,
        });
      });
    }

    return particles.map((p) => {
      // Isometric projection for matter box
      const isoX = cxBox + p.x + p.z * 0.45;
      const isoY = cyBox + p.y - p.z * 0.25;
      const scale = (200 + p.z) / 200;
      return {
        ...p,
        screenX: isoX,
        screenY: isoY,
        depth: p.z,
        scale,
        appR: p.r * scale,
      };
    }).sort((a, b) => a.depth - b.depth);
  };

  const matterParticles = getMatterParticles();

  return (
    <View style={styles.card}>
      {/* Simulation Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.titleOr}>୩-D ରସାୟନ ପ୍ରତିକ୍ରିୟା ଓ ଅଣୁ ସଂରଚନା</Text>
          <Text style={styles.titleEn}>
            {viewMode === 'REACTION'
              ? '3D Tetrahedral Reaction: CH₄ + Cl₂ ➔ CH₃Cl + HCl'
              : '3D Particulate Matter & Kinetic Energy (Ek ∝ T)'}
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

        {/* View Mode Switcher Badge */}
        <View style={styles.modeSwitchRow}>
          <Pressable
            style={[
              styles.modeTab,
              viewMode === 'REACTION' && styles.modeTabActive,
            ]}
            onPress={() => setViewMode('REACTION')}
          >
            <Text
              style={[
                styles.modeTabText,
                viewMode === 'REACTION' && styles.modeTabTextActive,
              ]}
            >
              ⚛️ 3D ଅଣୁ
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeTab,
              viewMode === 'MATTER' && styles.modeTabActive,
            ]}
            onPress={() => setViewMode('MATTER')}
          >
            <Text
              style={[
                styles.modeTabText,
                viewMode === 'MATTER' && styles.modeTabTextActive,
              ]}
            >
              🧪 3D ପଦାର୍ଥ
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main 3D Canvas */}
      <View style={styles.canvasContainer}>
        {viewMode === 'REACTION' ? (
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Dark Studio Background for 3D Molecular Glow */}
            <Rect x="0" y="0" width="340" height="210" fill="#0B132B" rx={8} />

            {/* Grid Horizon Lines for 3D Depth Floor */}
            <Line x1="10" y1="165" x2="330" y2="165" stroke="#1C2541" strokeWidth="1" />
            <Line x1="30" y1="185" x2="310" y2="185" stroke="#1C2541" strokeWidth="1" />
            <Line x1="60" y1="205" x2="280" y2="205" stroke="#1C2541" strokeWidth="1" />
            <Line x1="80" y1="165" x2="40" y2="210" stroke="#1C2541" strokeWidth="0.8" />
            <Line x1="170" y1="165" x2="170" y2="210" stroke="#1C2541" strokeWidth="0.8" />
            <Line x1="260" y1="165" x2="300" y2="210" stroke="#1C2541" strokeWidth="0.8" />

            {/* Ground Ellipse Drop Shadow under Methane Molecule */}
            <Ellipse cx={cxM} cy={165} rx={48} ry={12} fill="#000000" opacity={0.35} />

            {/* Ground Ellipse Drop Shadow under Chlorine / Product */}
            <Ellipse cx={cxCl} cy={165} rx={36} ry={9} fill="#000000" opacity={0.3} />

            {/* Sunlight / UV Photons Indicator */}
            <G x={170} y={20}>
              <Circle cx={0} cy={0} r={16} fill="#F59E0B" opacity={0.25} />
              <Circle cx={0} cy={0} r={10} fill="#FBBF24" />
              {/* Photon rays */}
              <Line x1={0} y1={-16} x2={0} y2={-20} stroke="#F59E0B" strokeWidth={2} />
              <Line x1={12} y1={-12} x2={16} y2={-16} stroke="#F59E0B" strokeWidth={2} />
              <Line x1={16} y1={0} x2={20} y2={0} stroke="#F59E0B" strokeWidth={2} />
              <Line x1={-12} y1={-12} x2={-16} y2={-16} stroke="#F59E0B" strokeWidth={2} />
              <Line x1={-16} y1={0} x2={-20} y2={0} stroke="#F59E0B" strokeWidth={2} />
              <SvgText x={-24} y={24} fontSize="9" fontWeight="bold" fill="#FDE68A">
                ସୂର୍ଯ୍ୟାଲୋକ (hν)
              </SvgText>
            </G>

            {/* Bonds (Rendered between atom centers with 3D depth) */}
            {bonds.map((bond, idx) => {
              const a1 = atomMap[bond.fromId];
              const a2 = atomMap[bond.toId];
              if (!a1 || !a2) return null;
              const avgScale = (a1.scale + a2.scale) / 2;
              return (
                <Line
                  key={`bond-${idx}`}
                  x1={a1.screenX}
                  y1={a1.screenY}
                  x2={a2.screenX}
                  y2={a2.screenY}
                  stroke={bond.color}
                  strokeWidth={bond.strokeWidth * avgScale}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Depth-sorted 3D Atoms with Spherical Highlights */}
            {sortedAtoms.map((atom) => (
              <G key={atom.id}>
                {/* Base Outer Shadow Sphere */}
                <Circle
                  cx={atom.screenX}
                  cy={atom.screenY}
                  r={atom.appR}
                  fill={atom.shadowColor}
                />
                {/* Main Color Body (slightly offset to simulate directional lighting) */}
                <Circle
                  cx={atom.screenX - atom.appR * 0.12}
                  cy={atom.screenY - atom.appR * 0.12}
                  r={atom.appR * 0.9}
                  fill={atom.color}
                />
                {/* Specular Highlight Gloss (upper-left white sheen) */}
                <Circle
                  cx={atom.screenX - atom.appR * 0.32}
                  cy={atom.screenY - atom.appR * 0.32}
                  r={atom.appR * 0.38}
                  fill={atom.highlightColor}
                  opacity={0.85}
                />
                <Circle
                  cx={atom.screenX - atom.appR * 0.38}
                  cy={atom.screenY - atom.appR * 0.38}
                  r={atom.appR * 0.18}
                  fill="#FFFFFF"
                  opacity={0.9}
                />
                {/* Atom Label */}
                <SvgText
                  x={atom.screenX}
                  y={atom.screenY + atom.appR * 0.35}
                  fontSize={atom.appR > 14 ? '11' : '9'}
                  fontWeight="bold"
                  fill={atom.labelColor}
                  textAnchor="middle"
                >
                  {atom.symbol}
                </SvgText>
              </G>
            ))}

            {/* Methane Label */}
            <SvgText
              x={cxM}
              y={180}
              fontSize="11"
              fontWeight="bold"
              fill="#E0E7FF"
              textAnchor="middle"
            >
              {reactionStep === 3 ? 'କ୍ଲୋରୋମିଥେନ୍ (CH₃Cl)' : 'ମିଥେନ୍ (CH₄) • 109.5°'}
            </SvgText>

            {/* Plus / Attack Arrow Indicator */}
            {reactionStep === 0 && (
              <SvgText x={170} y={100} fontSize="22" fontWeight="bold" fill="#64748B" textAnchor="middle">
                +
              </SvgText>
            )}

            {reactionStep === 1 && (
              <G x={170} y={90}>
                <Line x1={-15} y1={0} x2={15} y2={0} stroke="#F59E0B" strokeWidth={2} strokeDasharray="3,3" />
                <SvgText x={0} y={15} fontSize="9" fontWeight="bold" fill="#FBBF24" textAnchor="middle">
                  କ୍ଲିଭେଜ୍ (Cleavage)
                </SvgText>
              </G>
            )}

            {reactionStep === 2 && (
              <G x={170} y={75}>
                <Path d="M 25 15 Q 0 -5 -35 5" stroke="#EF4444" strokeWidth={2.5} fill="none" strokeDasharray="4,2" />
                <Polygon points="-35,5 -28,0 -30,9" fill="#EF4444" />
                <SvgText x={0} y={-8} fontSize="9" fontWeight="bold" fill="#F87171" textAnchor="middle">
                  ବିସ୍ଥାପନ (Attack)
                </SvgText>
              </G>
            )}

            {/* Right Side: Chlorine Molecule or HCl Byproduct */}
            {reactionStep < 3 ? (
              <G>
                {/* Cl-Cl bond (stretching or broken in step 1/2) */}
                {reactionStep === 0 && (
                  <Line
                    x1={cxCl + cl1Pos.x}
                    y1={cyCl + cl1Pos.y}
                    x2={cxCl + cl2Pos.x}
                    y2={cyCl + cl2Pos.y}
                    stroke="#22C55E"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                )}

                {/* Chlorine Atom 1 (Attacking Cl) */}
                <G>
                  <Circle
                    cx={cxCl + cl1Pos.x}
                    cy={cyCl + cl1Pos.y}
                    r={15}
                    fill="#14532D"
                  />
                  <Circle
                    cx={cxCl + cl1Pos.x - 2}
                    cy={cyCl + cl1Pos.y - 2}
                    r={13.5}
                    fill="#16A34A"
                  />
                  <Circle
                    cx={cxCl + cl1Pos.x - 5}
                    cy={cyCl + cl1Pos.y - 5}
                    r={5.5}
                    fill="#4ADE80"
                    opacity={0.85}
                  />
                  <Circle
                    cx={cxCl + cl1Pos.x - 6}
                    cy={cyCl + cl1Pos.y - 6}
                    r={2.5}
                    fill="#FFFFFF"
                    opacity={0.9}
                  />
                  <SvgText
                    x={cxCl + cl1Pos.x}
                    y={cyCl + cl1Pos.y + 4}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    Cl
                  </SvgText>
                </G>

                {/* Chlorine Atom 2 */}
                <G>
                  <Circle
                    cx={cxCl + cl2Pos.x}
                    cy={cyCl + cl2Pos.y}
                    r={15}
                    fill="#14532D"
                  />
                  <Circle
                    cx={cxCl + cl2Pos.x - 2}
                    cy={cyCl + cl2Pos.y - 2}
                    r={13.5}
                    fill="#16A34A"
                  />
                  <Circle
                    cx={cxCl + cl2Pos.x - 5}
                    cy={cyCl + cl2Pos.y - 5}
                    r={5.5}
                    fill="#4ADE80"
                    opacity={0.85}
                  />
                  <Circle
                    cx={cxCl + cl2Pos.x - 6}
                    cy={cyCl + cl2Pos.y - 6}
                    r={2.5}
                    fill="#FFFFFF"
                    opacity={0.9}
                  />
                  <SvgText
                    x={cxCl + cl2Pos.x}
                    y={cyCl + cl2Pos.y + 4}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    Cl
                  </SvgText>
                </G>

                {/* Right Side Label */}
                <SvgText
                  x={cxCl}
                  y={180}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#86EFAC"
                  textAnchor="middle"
                >
                  {reactionStep === 0
                    ? 'କ୍ଲୋରିନ୍ (Cl₂)'
                    : '2 × Cl• ଫ୍ରି ରେଡିକାଲ୍ (Free Radicals)'}
                </SvgText>
              </G>
            ) : (
              // Step 3 Product: HCl (Hydrogen Chloride)
              <G>
                {/* H-Cl bond */}
                <Line
                  x1={cxCl + releasedHPos!.x}
                  y1={cyCl + releasedHPos!.y}
                  x2={cxCl + cl2Pos.x}
                  y2={cyCl + cl2Pos.y}
                  stroke="#94A3B8"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />

                {/* Hydrogen */}
                <Circle
                  cx={cxCl + releasedHPos!.x}
                  cy={cyCl + releasedHPos!.y}
                  r={10}
                  fill="#0369A1"
                />
                <Circle
                  cx={cxCl + releasedHPos!.x - 2}
                  cy={cyCl + releasedHPos!.y - 2}
                  r={8.5}
                  fill="#0284C7"
                />
                <Circle
                  cx={cxCl + releasedHPos!.x - 3}
                  cy={cyCl + releasedHPos!.y - 3}
                  r={3}
                  fill="#FFFFFF"
                  opacity={0.85}
                />
                <SvgText
                  x={cxCl + releasedHPos!.x}
                  y={cyCl + releasedHPos!.y + 3.5}
                  fontSize="9"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  H
                </SvgText>

                {/* Chlorine */}
                <Circle
                  cx={cxCl + cl2Pos.x}
                  cy={cyCl + cl2Pos.y}
                  r={15}
                  fill="#14532D"
                />
                <Circle
                  cx={cxCl + cl2Pos.x - 2}
                  cy={cyCl + cl2Pos.y - 2}
                  r={13.5}
                  fill="#16A34A"
                />
                <Circle
                  cx={cxCl + cl2Pos.x - 5}
                  cy={cyCl + cl2Pos.y - 5}
                  r={5}
                  fill="#4ADE80"
                  opacity={0.85}
                />
                <Circle
                  cx={cxCl + cl2Pos.x - 6}
                  cy={cyCl + cl2Pos.y - 6}
                  r={2.5}
                  fill="#FFFFFF"
                  opacity={0.9}
                />
                <SvgText
                  x={cxCl + cl2Pos.x}
                  y={cyCl + cl2Pos.y + 4}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  Cl
                </SvgText>

                {/* Label */}
                <SvgText
                  x={cxCl}
                  y={180}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#E2E8F0"
                  textAnchor="middle"
                >
                  ହାଇଡ୍ରୋଜେନ୍ କ୍ଲୋରାଇଡ୍ (HCl)
                </SvgText>
              </G>
            )}

            {/* 3D Angle Indicator overlay */}
            <Rect x={10} y={10} width={82} height={22} rx={4} fill="#1E293B" opacity={0.85} />
            <SvgText x={16} y={24} fontSize="9" fontWeight="bold" fill="#94A3B8">
              3D କୋଣ: {rotAngle}°
            </SvgText>
          </Svg>
        ) : (
          // Matter Mode: 3D Isometric Chamber
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Dark Chamber Interior */}
            <Rect x="0" y="0" width="340" height="210" fill="#0F172A" rx={8} />

            {/* Isometric Glass Beaker Back Walls */}
            <Polygon
              points="80,50 260,50 260,170 80,170"
              fill="#1E293B"
              opacity={0.6}
            />
            <Line x1="80" y1="50" x2="80" y2="170" stroke="#334155" strokeWidth="2" />
            <Line x1="260" y1="50" x2="260" y2="170" stroke="#334155" strokeWidth="2" />
            <Line x1="80" y1="170" x2="260" y2="170" stroke="#475569" strokeWidth="2" />

            {/* Isometric Base Grid */}
            <Polygon
              points="80,170 260,170 290,195 50,195"
              fill="#1E293B"
              stroke="#38BDF8"
              strokeWidth="1"
              opacity={0.4}
            />

            {/* Front Glass Borders */}
            <Line x1="50" y1="75" x2="50" y2="195" stroke="#38BDF8" strokeWidth="2" opacity={0.7} />
            <Line x1="290" y1="75" x2="290" y2="195" stroke="#38BDF8" strokeWidth="2" opacity={0.7} />
            <Line x1="50" y1="195" x2="290" y2="195" stroke="#38BDF8" strokeWidth="2.5" />
            <Line x1="80" y1="50" x2="50" y2="75" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3,3" />
            <Line x1="260" y1="50" x2="290" y2="75" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Render 3D Matter Particles */}
            {matterParticles.map((p, idx) => (
              <G key={`mp-${idx}`}>
                {/* Particle Base */}
                <Circle cx={p.screenX} cy={p.screenY} r={p.appR} fill={p.color} />
                {/* 3D Specular Sheen */}
                <Circle
                  cx={p.screenX - p.appR * 0.3}
                  cy={p.screenY - p.appR * 0.3}
                  r={p.appR * 0.35}
                  fill="#FFFFFF"
                  opacity={0.75}
                />
              </G>
            ))}

            {/* Temperature & State Overlay Badges */}
            <Rect x={12} y={12} width={112} height={44} rx={6} fill="#1E293B" stroke="#334155" strokeWidth={1} />
            <SvgText x={18} y={27} fontSize="10" fontWeight="bold" fill="#38BDF8">
              ତାପମାତ୍ରା: {temperature}°C
            </SvgText>
            <SvgText x={18} y={44} fontSize="9" fontWeight="bold" fill="#F8FAFC">
              {temperature === -10
                ? 'କଠିନ (Solid · Ice)'
                : temperature === 25
                ? 'ତରଳ (Liquid · Water)'
                : 'ଗ୍ୟାସ୍ (Gas · Steam)'}
            </SvgText>

            {/* Kinetic Energy Meter */}
            <Rect x={215} y={12} width={112} height={44} rx={6} fill="#1E293B" stroke="#334155" strokeWidth={1} />
            <SvgText x={221} y={27} fontSize="9" fontWeight="bold" fill="#FBBF24">
              ଗତିଜ ଶକ୍ତି (Ek):
            </SvgText>
            <SvgText x={221} y={44} fontSize="10" fontWeight="bold" fill="#FFFFFF">
              {temperature === -10
                ? 'ନିମ୍ନ (Low Vibrate)'
                : temperature === 25
                ? 'ମଧ୍ୟମ (Moderate Fluid)'
                : 'ଅତ୍ୟଧିକ (High Kinetic)'}
            </SvgText>
          </Svg>
        )}
      </View>

      {/* Interactive Controls Bar */}
      {viewMode === 'REACTION' ? (
        <View style={styles.controlsSection}>
          {/* Reaction Step Selector */}
          <View style={styles.stepsRow}>
            {[
              { step: 0, label: '୧. ପ୍ରାରମ୍ଭ' },
              { step: 1, label: '୨. ସୂର୍ଯ୍ୟାଲୋକ (hν)' },
              { step: 2, label: '୩. ବିସ୍ଥାପନ' },
              { step: 3, label: '୪. ଉତ୍ପାଦ (CH₃Cl)' },
            ].map((s) => (
              <Pressable
                key={s.step}
                style={[
                  styles.stepPill,
                  reactionStep === s.step && styles.stepPillActive,
                ]}
                onPress={() => {
                  setIsPlayingAuto(false);
                  setReactionStep(s.step);
                }}
              >
                <Text
                  style={[
                    styles.stepPillText,
                    reactionStep === s.step && styles.stepPillTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Action Buttons: Auto-Play, 3D Rotate, Reset */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={[
                styles.actionBtn,
                isPlayingAuto ? styles.actionBtnStop : styles.actionBtnPlay,
              ]}
              onPress={() => setIsPlayingAuto(!isPlayingAuto)}
            >
              <Text style={styles.actionBtnText}>
                {isPlayingAuto ? '⏸️ ରୋକନ୍ତୁ (Pause)' : '▶️ ଚଲାନ୍ତୁ (Play Reaction)'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtn,
                isRotating ? styles.actionBtnStop : styles.actionBtnRotate,
              ]}
              onPress={() => setIsRotating(!isRotating)}
            >
              <Text style={styles.actionBtnText}>
                {isRotating ? '⏸️ ରୋକନ୍ତୁ' : '🔄 3D ବୁଲାନ୍ତୁ'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionBtnReset}
              onPress={() => {
                setIsPlayingAuto(false);
                setReactionStep(0);
              }}
            >
              <Text style={styles.actionBtnResetText}>🔄 Reset</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Matter Mode Controls: Temperature selector
        <View style={styles.controlsSection}>
          <Text style={styles.controlsLabel}>ତାପମାତ୍ରା ପରିବର୍ତ୍ତନ କରନ୍ତୁ (Temperature):</Text>
          <View style={styles.tempButtonsRow}>
            {[
              { t: -10, label: '❄️ -10°C (Solid Ice)', color: '#0284C7' },
              { t: 25, label: '💧 25°C (Liquid Water)', color: '#0369A1' },
              { t: 100, label: '🔥 100°C (Gas Steam)', color: '#EA580C' },
            ].map((item) => (
              <Pressable
                key={item.t}
                style={[
                  styles.tempBtn,
                  temperature === item.t && {
                    backgroundColor: item.color,
                    borderColor: item.color,
                  },
                ]}
                onPress={() => setTemperature(item.t)}
              >
                <Text
                  style={[
                    styles.tempBtnText,
                    temperature === item.t && styles.tempBtnTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Dynamic Pedagogical Explanation ("By taking these values you get this") */}
      <View style={styles.explanationBox}>
        {viewMode === 'REACTION' ? (
          <Text style={styles.explanationText}>
            {reactionStep === 0 &&
              '💡 ପ୍ରାରମ୍ଭ: ମିଥେନ୍ (CH₄) ଏକ ଚତୁସ୍ତଳକୀୟ (Tetrahedral 109.5°) ଅଣୁ । ଏଥିରେ କାର୍ବନ୍ ସହିତ ୪ଟି ହାଇଡ୍ରୋଜେନ୍ ଯୋଡ଼ି ହୋଇଥାଏ ।'}
            {reactionStep === 1 &&
              '⚡ ସୂର୍ଯ୍ୟାଲୋକ (hν): ସୂର୍ଯ୍ୟଙ୍କ ଅତିବାଇଗଣି ରଶ୍ମି Cl-Cl ବନ୍ଧନକୁ ଭାଙ୍ଗି ଦୁଇଟି ଅତ୍ୟନ୍ତ ସକ୍ରିୟ Cl• ଫ୍ରି ରେଡିକାଲ୍ ସୃଷ୍ଟି କରେ ।'}
            {reactionStep === 2 &&
              '⚔️ ପ୍ରତିସ୍ଥାପନ ଆକ୍ରମଣ: ସକ୍ରିୟ Cl ପରମାଣୁ ମିଥେନ୍ ର C-H ବନ୍ଧନ ଉପରେ ଆକ୍ରମଣ କରି ଗୋଟିଏ H କୁ ବାହାର କରିଦିଏ (Substitution) ।'}
            {reactionStep === 3 &&
              '✅ ଉତ୍ପାଦ ଗଠନ: କ୍ଲୋରୋମିଥେନ୍ (CH₃Cl) ଏବଂ ହାଇଡ୍ରୋଜେନ୍ କ୍ଲୋରାଇଡ୍ (HCl) ଗଠିତ ହୁଏ । ଗୋଟିଏ ମୂଲ୍ୟ ବଦଳାଇ ଆପଣ ନୂତନ ଯୌଗିକ ପାଆନ୍ତି !'}
          </Text>
        ) : (
          <Text style={styles.explanationText}>
            {temperature === -10 &&
              '❄️ କଠିନ ଅବସ୍ଥା: ଅଣୁଗୁଡ଼ିକ ମଧ୍ୟରେ ଆକର୍ଷଣ ବଳ ସର୍ବାଧିକ ଥାଏ । କଣିକାଗୁଡ଼ିକ କେବଳ ସ୍ଥିର ସ୍ଥାନରେ ସାମାନ୍ୟ କମ୍ପିତ (Vibrate) ହୁଅନ୍ତି ।'}
            {temperature === 25 &&
              '💧 ତରଳ ଅବସ୍ଥା: ତାପମାତ୍ରା ବଢ଼ିବାରୁ ଗତିଜ ଶକ୍ତି (Ek) ବୃଦ୍ଧି ପାଏ, କଣିକାଗୁଡ଼ିକ ପରସ୍ପର ଉପରେ ଗତିଶୀଳ ହୋଇ ପ୍ରବାହିତ ହୁଅନ୍ତି ।'}
            {temperature === 100 &&
              '🔥 ଗ୍ୟାସୀୟ ଅବସ୍ଥା: ଉଚ୍ଚ ତାପମାତ୍ରାରେ (Ek ∝ T) କଣିକାଗୁଡ଼ିକର ଆକର୍ଷଣ ବଳ କ୍ଷୀଣ ହୋଇ ସେମାନେ ମୁକ୍ତ ଭାବେ ଦ୍ରୁତ ବେଗରେ ଚାରିଆଡ଼େ ଘୁରି ବୁଲନ୍ତି !'}
          </Text>
        )}
      </View>

      {/* Pocket Jugaad Lab Launch Banner */}
      {onOpenJugaadLab && (
        <Pressable
          style={styles.jugaadBannerBtn}
          onPress={onOpenJugaadLab}
          accessibilityRole="button"
          accessibilityLabel="Launch Pocket Jugaad Chemistry Lab"
        >
          <Text style={styles.jugaadBannerBtnText}>
            🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ ରେ ରସାୟନ ପ୍ରତିକ୍ରିୟା ପରୀକ୍ଷା (Launch Lab) ➔
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
    gap: 8,
  },
  titleCol: {
    flex: 1,
  },
  titleOr: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleEn: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
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
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.full,
    padding: 2,
  },
  modeTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.full,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  canvasContainer: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#0B132B',
  },
  controlsSection: {
    marginTop: spacing.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs + 2,
  },
  stepPill: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
  },
  stepPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#0F172A',
  },
  stepPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPlay: {
    backgroundColor: '#16A34A',
  },
  actionBtnStop: {
    backgroundColor: '#DC2626',
  },
  actionBtnRotate: {
    backgroundColor: '#0284C7',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnReset: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnResetText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  controlsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tempButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tempBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
  },
  tempBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tempBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  explanationText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#166534',
    fontWeight: '500',
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

export default Chemistry3DSimulation;
