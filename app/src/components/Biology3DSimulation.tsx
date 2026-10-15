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

export interface Biology3DSimulationProps {
  onOpenJugaadLab?: () => void;
  playingVoice?: boolean;
  onToggleVoice?: () => void;
}

type CellType = 'PLANT' | 'ANIMAL';
type OrganelleId = 'nucleus' | 'mitochondria' | 'chloroplast' | 'vacuole' | 'membrane';

export const Biology3DSimulation: React.FC<Biology3DSimulationProps> = ({
  onOpenJugaadLab,
  playingVoice,
  onToggleVoice,
}) => {
  // Mode: 3D Cell Explorer vs 3D Osmosis Lab
  const [viewMode, setViewMode] = useState<'CELL' | 'OSMOSIS'>('CELL');

  // Cell Mode States
  const [cellType, setCellType] = useState<CellType>('PLANT');
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleId>('mitochondria');
  const [rotAngle, setRotAngle] = useState<number>(20);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Osmosis Mode States (0% Salt = Hypotonic, 0.9% Salt = Isotonic, 20% Salt = Hypertonic)
  const [saltConcentration, setSaltConcentration] = useState<number>(0);
  const [osmosisTick, setOsmosisTick] = useState<number>(0);

  const spinTimerRef = useRef<any>(null);
  const animTimerRef = useRef<any>(null);

  // Auto 3D spin timer
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

  // Osmosis water molecule animation
  useEffect(() => {
    animTimerRef.current = setInterval(() => {
      setOsmosisTick((prev) => (prev + 1) % 60);
    }, 50);
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, []);

  // 3D Isometric projection math for cell organelles
  const project3D = (x: number, y: number, z: number, cx = 170, cy = 95) => {
    const radY = (rotAngle * Math.PI) / 180;
    const radX = (25 * Math.PI) / 180;

    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const dist = 300;
    const scale = dist / (dist + z2);

    return {
      screenX: cx + x1 * scale,
      screenY: cy + y2 * scale,
      depth: z2,
      scale,
    };
  };

  // Osmosis calculations:
  // 0% Salt: Endosmosis, cell swells to scale 1.18, turgid
  // 0.9% Salt: Equilibrium, cell normal scale 1.00
  // 20% Salt: Exosmosis, cell shrinks to scale 0.80, flaccid
  const cellScale =
    saltConcentration === 0 ? 1.18 : saltConcentration === 0.9 ? 1.0 : 0.8;
  const waterFlowDirection =
    saltConcentration === 0
      ? 'INWARD'
      : saltConcentration === 0.9
      ? 'BALANCED'
      : 'OUTWARD';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.titleOr}>୩-D କୋଷ ସଂରଚନା ଓ ଅଭିସ୍ରବଣ</Text>
          <Text style={styles.titleEn}>
            {viewMode === 'CELL'
              ? `${cellType === 'PLANT' ? 'Plant Cell (ଉଦ୍ଭିଦ କୋଷ)' : 'Animal Cell (ପ୍ରାଣୀ କୋଷ)'} · 3D Organelles`
              : '3D Osmosis & Cell Turgidity (ଅନ୍ତଃସ୍ରାବ ଓ ବହିଃସ୍ରାବ)'}
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

        {/* View Mode Toggle */}
        <View style={styles.modeSwitchRow}>
          <Pressable
            style={[styles.modeTab, viewMode === 'CELL' && styles.modeTabActive]}
            onPress={() => setViewMode('CELL')}
          >
            <Text style={[styles.modeTabText, viewMode === 'CELL' && styles.modeTabTextActive]}>
              🧬 3D କୋଷ
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, viewMode === 'OSMOSIS' && styles.modeTabActive]}
            onPress={() => setViewMode('OSMOSIS')}
          >
            <Text style={[styles.modeTabText, viewMode === 'OSMOSIS' && styles.modeTabTextActive]}>
              💧 ଅଭିସ୍ରବଣ
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main 3D Canvas */}
      <View style={styles.canvasContainer}>
        {viewMode === 'CELL' ? (
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Dark Cytoplasm Background with Spatial Depth */}
            <Rect x="0" y="0" width="340" height="210" fill="#062817" rx={8} />

            {/* Depth Grid Lines */}
            <Line x1="20" y1="180" x2="320" y2="180" stroke="#0D4B2D" strokeWidth="1" />
            <Line x1="40" y1="195" x2="300" y2="195" stroke="#0D4B2D" strokeWidth="1" />
            <Line x1="170" y1="180" x2="170" y2="210" stroke="#0D4B2D" strokeWidth="0.8" />

            {/* Ground Drop Shadow of Cell */}
            <Ellipse cx={170} cy={185} rx={115} ry={18} fill="#000000" opacity={0.45} />

            {/* Cell Outer Boundary (3D Layered Perspective) */}
            {cellType === 'PLANT' ? (
              <G>
                {/* Plant 3D Thick Cell Wall (କୋଷଭିତ୍ତି) */}
                <Polygon
                  points="75,25 265,25 305,80 275,160 65,160 35,80"
                  fill="#14532D"
                  stroke="#22C55E"
                  strokeWidth={4.5}
                />
                <Polygon
                  points="82,33 258,33 295,82 268,152 72,152 45,82"
                  fill="#166534"
                  stroke="#4ADE80"
                  strokeWidth={2}
                />
                {/* Inner Cell Membrane (କୋଷଝିଲ୍ଲୀ) */}
                <Polygon
                  points="88,40 252,40 285,84 262,145 78,145 54,84"
                  fill="#052E16"
                  opacity={0.8}
                />
              </G>
            ) : (
              <G>
                {/* Animal 3D Spherical/Oval Membrane (କୋଷଝିଲ୍ଲୀ) */}
                <Ellipse
                  cx={170}
                  cy={95}
                  rx={125}
                  ry={68}
                  fill="#1E1B4B"
                  stroke="#6366F1"
                  strokeWidth={4}
                />
                <Ellipse
                  cx={168}
                  cy={93}
                  rx={121}
                  ry={65}
                  fill="#0F172A"
                  opacity={0.85}
                />
              </G>
            )}

            {/* 3D Organelle 1: Nucleus (ନ୍ୟୁକ୍ଲିୟସ୍ - କୋଷର ନିୟନ୍ତ୍ରଣ କେନ୍ଦ୍ର) */}
            {(() => {
              const p = project3D(cellType === 'PLANT' ? -55 : 0, 0, 0);
              const isSel = selectedOrganelle === 'nucleus';
              return (
                <G
                  onPress={() => setSelectedOrganelle('nucleus')}
                  accessibilityRole="button"
                  accessibilityLabel="Nucleus"
                >
                  {/* Outer glow if selected */}
                  {isSel && (
                    <Circle
                      cx={p.screenX}
                      cy={p.screenY}
                      r={29 * p.scale}
                      fill="#60A5FA"
                      opacity={0.3}
                    />
                  )}
                  {/* Nucleus Outer Membrane */}
                  <Circle
                    cx={p.screenX}
                    cy={p.screenY}
                    r={24 * p.scale}
                    fill="#1E3A8A"
                    stroke={isSel ? '#93C5FD' : '#3B82F6'}
                    strokeWidth={isSel ? 2.5 : 1.5}
                  />
                  {/* Nucleus Body */}
                  <Circle
                    cx={p.screenX - 3}
                    cy={p.screenY - 3}
                    r={20 * p.scale}
                    fill="#2563EB"
                  />
                  {/* Nucleolus (ନ୍ୟୁକ୍ଲିଓଲସ୍) */}
                  <Circle
                    cx={p.screenX - 2}
                    cy={p.screenY - 2}
                    r={8 * p.scale}
                    fill="#1E40AF"
                  />
                  {/* Specular 3D Highlight */}
                  <Circle
                    cx={p.screenX - 7 * p.scale}
                    cy={p.screenY - 7 * p.scale}
                    r={5 * p.scale}
                    fill="#FFFFFF"
                    opacity={0.85}
                  />
                  <SvgText
                    x={p.screenX}
                    y={p.screenY + 32 * p.scale}
                    fontSize="9.5"
                    fontWeight="bold"
                    fill="#BFDBFE"
                    textAnchor="middle"
                  >
                    ନ୍ୟୁକ୍ଲିୟସ୍
                  </SvgText>
                </G>
              );
            })()}

            {/* 3D Organelle 2: Mitochondria (ମାଇଟୋକଣ୍ଡ୍ରିଆ - ଶକ୍ତି କେନ୍ଦ୍ର ATP) */}
            {(() => {
              const p = project3D(55, -28, 15);
              const isSel = selectedOrganelle === 'mitochondria';
              return (
                <G
                  onPress={() => setSelectedOrganelle('mitochondria')}
                  accessibilityRole="button"
                  accessibilityLabel="Mitochondria"
                >
                  {isSel && (
                    <Ellipse
                      cx={p.screenX}
                      cy={p.screenY}
                      rx={27 * p.scale}
                      ry={16 * p.scale}
                      fill="#F97316"
                      opacity={0.35}
                    />
                  )}
                  {/* Outer Sausage Capsule */}
                  <Ellipse
                    cx={p.screenX}
                    cy={p.screenY}
                    rx={23 * p.scale}
                    ry={13 * p.scale}
                    fill="#C2410C"
                    stroke={isSel ? '#FDBA74' : '#EA580C'}
                    strokeWidth={isSel ? 2.5 : 1.5}
                  />
                  {/* Inner Folded Cristae (କ୍ରିଷ୍ଟି) */}
                  <Path
                    d={`M ${p.screenX - 16 * p.scale} ${p.screenY} Q ${p.screenX - 8 * p.scale} ${p.screenY - 6 * p.scale}, ${p.screenX} ${p.screenY} T ${p.screenX + 16 * p.scale} ${p.screenY}`}
                    stroke="#FEF08A"
                    strokeWidth={2.2 * p.scale}
                    fill="none"
                  />
                  {/* 3D Specular */}
                  <Circle
                    cx={p.screenX - 10 * p.scale}
                    cy={p.screenY - 5 * p.scale}
                    r={3.5 * p.scale}
                    fill="#FFFFFF"
                    opacity={0.8}
                  />
                  <SvgText
                    x={p.screenX}
                    y={p.screenY + 20 * p.scale}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#FDBA74"
                    textAnchor="middle"
                  >
                    ମାଇଟୋକଣ୍ଡ୍ରିଆ
                  </SvgText>
                </G>
              );
            })()}

            {/* 3D Organelle 3: Chloroplast (ହରିତ୍‌କଣା - ଉଦ୍ଭିଦରେ ଖାଦ୍ୟ ପ୍ରସ୍ତୁତି) */}
            {cellType === 'PLANT' ? (
              (() => {
                const p = project3D(50, 32, -10);
                const isSel = selectedOrganelle === 'chloroplast';
                return (
                  <G
                    onPress={() => setSelectedOrganelle('chloroplast')}
                    accessibilityRole="button"
                    accessibilityLabel="Chloroplast"
                  >
                    {isSel && (
                      <Ellipse
                        cx={p.screenX}
                        cy={p.screenY}
                        rx={25 * p.scale}
                        ry={15 * p.scale}
                        fill="#4ADE80"
                        opacity={0.35}
                      />
                    )}
                    <Ellipse
                      cx={p.screenX}
                      cy={p.screenY}
                      rx={21 * p.scale}
                      ry={12 * p.scale}
                      fill="#15803D"
                      stroke={isSel ? '#86EFAC' : '#22C55E'}
                      strokeWidth={isSel ? 2.5 : 1.5}
                    />
                    {/* Thylakoid Grana Discs (ଗ୍ରାନା ଥାକ) */}
                    <Circle cx={p.screenX - 8 * p.scale} cy={p.screenY} r={3 * p.scale} fill="#86EFAC" />
                    <Circle cx={p.screenX} cy={p.screenY} r={3 * p.scale} fill="#86EFAC" />
                    <Circle cx={p.screenX + 8 * p.scale} cy={p.screenY} r={3 * p.scale} fill="#86EFAC" />
                    <Circle
                      cx={p.screenX - 6 * p.scale}
                      cy={p.screenY - 4 * p.scale}
                      r={2.5 * p.scale}
                      fill="#FFFFFF"
                      opacity={0.8}
                    />
                    <SvgText
                      x={p.screenX}
                      y={p.screenY + 18 * p.scale}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#86EFAC"
                      textAnchor="middle"
                    >
                      ହରିତ୍‌କଣା
                    </SvgText>
                  </G>
                );
              })()
            ) : (
              // Animal Cell Lysosome
              (() => {
                const p = project3D(50, 32, -10);
                return (
                  <G>
                    <Circle cx={p.screenX} cy={p.screenY} r={11 * p.scale} fill="#DC2626" />
                    <Circle cx={p.screenX - 3} cy={p.screenY - 3} r={3 * p.scale} fill="#FFFFFF" opacity={0.8} />
                    <SvgText x={p.screenX} y={p.screenY + 18 * p.scale} fontSize="8.5" fontWeight="bold" fill="#FCA5A5" textAnchor="middle">
                      ଲାଇସୋଜୋମ୍
                    </SvgText>
                  </G>
                );
              })()
            )}

            {/* 3D Organelle 4: Large Central Vacuole (ବୃହତ୍ ରସଧାନୀ in Plant Cell) */}
            {cellType === 'PLANT' && (
              (() => {
                const p = project3D(5, -5, -20);
                const isSel = selectedOrganelle === 'vacuole';
                return (
                  <G
                    onPress={() => setSelectedOrganelle('vacuole')}
                    accessibilityRole="button"
                    accessibilityLabel="Vacuole"
                  >
                    <Ellipse
                      cx={p.screenX}
                      cy={p.screenY}
                      rx={38 * p.scale}
                      ry={26 * p.scale}
                      fill="#0284C7"
                      opacity={0.35}
                      stroke={isSel ? '#BAE6FD' : '#38BDF8'}
                      strokeWidth={isSel ? 2 : 1}
                      strokeDasharray="4,2"
                    />
                    <Circle
                      cx={p.screenX - 12 * p.scale}
                      cy={p.screenY - 8 * p.scale}
                      r={5 * p.scale}
                      fill="#FFFFFF"
                      opacity={0.6}
                    />
                    <SvgText
                      x={p.screenX}
                      y={p.screenY + 4 * p.scale}
                      fontSize="9.5"
                      fontWeight="bold"
                      fill="#E0F2FE"
                      textAnchor="middle"
                    >
                      କୋଷରସ ଧାନୀ (Vacuole)
                    </SvgText>
                  </G>
                );
              })()
            )}

            {/* Ribosomes floating in cytoplasm */}
            <Circle cx={120} cy={60} r={2.5} fill="#FACC15" />
            <Circle cx={135} cy={140} r={2.5} fill="#FACC15" />
            <Circle cx={210} cy={135} r={2.5} fill="#FACC15" />
            <Circle cx={240} cy={70} r={2.5} fill="#FACC15" />

            {/* 3D Angle Indicator */}
            <Rect x={10} y={10} width={85} height={22} rx={4} fill="#0F172A" opacity={0.8} />
            <SvgText x={15} y={24} fontSize="9" fontWeight="bold" fill="#94A3B8">
              3D କୋଣ: {rotAngle}°
            </SvgText>
          </Svg>
        ) : (
          // Osmosis Mode: 3D Beaker with Solution & Dynamic Cell Turgidity
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Beaker Background Fluid */}
            <Rect x="0" y="0" width="340" height="210" fill="#0C4A6E" rx={8} />

            {/* Glass Beaker Isometric Outline */}
            <Polygon points="60,35 280,35 280,185 60,185" fill="#0369A1" opacity={0.4} />
            <Line x1="60" y1="35" x2="60" y2="185" stroke="#38BDF8" strokeWidth="2" />
            <Line x1="280" y1="35" x2="280" y2="185" stroke="#38BDF8" strokeWidth="2" />
            <Line x1="60" y1="185" x2="280" y2="185" stroke="#38BDF8" strokeWidth="2" />

            {/* Beaker Meniscus Fluid Level */}
            <Ellipse cx={170} cy={45} rx={110} ry={10} fill="#0284C7" stroke="#7DD3FC" strokeWidth="1.5" />

            {/* Ground Shadow under the Cell */}
            <Ellipse cx={170} cy={165} rx={60 * cellScale} ry={12} fill="#082F49" opacity={0.6} />

            {/* The 3D Plant / Potato Cell undergoing Osmosis */}
            <G transform={`translate(170, 115) scale(${cellScale}) translate(-170, -115)`}>
              {/* Outer Cell Wall */}
              <Rect
                x={120}
                y={75}
                width={100}
                height={80}
                rx={saltConcentration === 20 ? 12 : 26}
                fill={saltConcentration === 20 ? '#78350F' : '#15803D'}
                stroke={saltConcentration === 20 ? '#D97706' : '#4ADE80'}
                strokeWidth={3}
              />
              {/* Plasmolyzed inner membrane shrinking if 20% salt */}
              {saltConcentration === 20 ? (
                <Rect
                  x={132}
                  y={88}
                  width={76}
                  height={54}
                  rx={10}
                  fill="#991B1B"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              ) : (
                <Rect
                  x={124}
                  y={79}
                  width={92}
                  height={72}
                  rx={22}
                  fill="#166534"
                  stroke="#86EFAC"
                  strokeWidth={1.5}
                />
              )}
              {/* Central Nucleus */}
              <Circle cx={170} cy={115} r={14} fill="#2563EB" />
              <Circle cx={166} cy={111} r={3.5} fill="#FFFFFF" opacity={0.85} />
              <SvgText x={170} y={119} fontSize="8.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
                କୋଷ
              </SvgText>
            </G>

            {/* Animated 3D Water Molecules (H2O) Moving In or Out */}
            {[
              { x: 90, y: 80, phase: 0 },
              { x: 85, y: 130, phase: 15 },
              { x: 250, y: 85, phase: 30 },
              { x: 245, y: 135, phase: 45 },
            ].map((mol, idx) => {
              // Calculate animation trajectory based on tick and flow direction
              let offsetX = 0;
              if (waterFlowDirection === 'INWARD') {
                offsetX = ((osmosisTick + mol.phase) % 30) * 1.5;
                if (mol.x > 170) offsetX = -offsetX;
              } else if (waterFlowDirection === 'OUTWARD') {
                offsetX = ((osmosisTick + mol.phase) % 30) * 1.5;
                if (mol.x < 170) offsetX = -offsetX;
              }

              return (
                <G key={`water-${idx}`} x={mol.x + offsetX} y={mol.y}>
                  <Circle cx={0} cy={0} r={5} fill="#38BDF8" opacity={0.9} />
                  <Circle cx={-3} cy={-2} r={1.5} fill="#FFFFFF" />
                  <SvgText x={-5} y={12} fontSize="7" fontWeight="bold" fill="#BAE6FD">
                    H₂O
                  </SvgText>
                </G>
              );
            })}

            {/* Salt Particles (NaCl) */}
            {saltConcentration > 0 &&
              [
                { x: 75, y: 65 },
                { x: 260, y: 65 },
                { x: 80, y: 160 },
                { x: 265, y: 155 },
                { x: 100, y: 110 },
                { x: 235, y: 110 },
              ].map((salt, sIdx) => (
                <Circle key={`salt-${sIdx}`} cx={salt.x} cy={salt.y} r={4} fill="#FACC15" />
              ))}

            {/* Status Badges Overlay */}
            <Rect x={10} y={10} width={130} height={42} rx={6} fill="#0F172A" stroke="#0284C7" strokeWidth={1} />
            <SvgText x={15} y={24} fontSize="9.5" fontWeight="bold" fill="#38BDF8">
              ଦ୍ରବଣ: {saltConcentration}% Salt ({saltConcentration === 0 ? 'Hypotonic' : saltConcentration === 0.9 ? 'Isotonic' : 'Hypertonic'})
            </SvgText>
            <SvgText x={15} y={40} fontSize="9" fontWeight="bold" fill="#FFFFFF">
              ଜଳ ପ୍ରବାହ: {waterFlowDirection === 'INWARD' ? 'ଅନ୍ତଃସ୍ରାବ ➔ ଭିତରକୁ' : waterFlowDirection === 'OUTWARD' ? 'ବହିଃସ୍ରାବ ➔ ବାହାରକୁ' : 'ସନ୍ତୁଳିତ (Equilibrium)'}
            </SvgText>

            <Rect x={215} y={10} width={115} height={42} rx={6} fill="#0F172A" stroke="#0284C7" strokeWidth={1} />
            <SvgText x={220} y={24} fontSize="9.5" fontWeight="bold" fill="#FBBF24">
              କୋଷ ସ୍ଥିତି:
            </SvgText>
            <SvgText x={220} y={40} fontSize="10" fontWeight="bold" fill="#FFFFFF">
              {saltConcentration === 0
                ? 'ସ୍ଫୀତ (+6.8mm · Turgid)'
                : saltConcentration === 0.9
                ? 'ସ୍ୱାଭାବିକ (Normal)'
                : 'ଶିଥିଳ (-5.5mm · Flaccid)'}
            </SvgText>
          </Svg>
        )}
      </View>

      {/* Interactive Controls Section */}
      {viewMode === 'CELL' ? (
        <View style={styles.controlsSection}>
          {/* Plant vs Animal Toggle */}
          <View style={styles.cellTypeRow}>
            <Pressable
              style={[styles.cellTypeBtn, cellType === 'PLANT' && styles.cellTypeBtnActive]}
              onPress={() => {
                setCellType('PLANT');
                setSelectedOrganelle('mitochondria');
              }}
            >
              <Text style={[styles.cellTypeBtnText, cellType === 'PLANT' && styles.cellTypeBtnTextActive]}>
                🌿 ଉଦ୍ଭିଦ କୋଷ (Plant Cell)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.cellTypeBtn, cellType === 'ANIMAL' && styles.cellTypeBtnActive]}
              onPress={() => {
                setCellType('ANIMAL');
                setSelectedOrganelle('mitochondria');
              }}
            >
              <Text style={[styles.cellTypeBtnText, cellType === 'ANIMAL' && styles.cellTypeBtnTextActive]}>
                🐾 ପ୍ରାଣୀ କୋଷ (Animal Cell)
              </Text>
            </Pressable>
          </View>

          {/* Organelle Inspector Buttons */}
          <View style={styles.organellesRow}>
            {[
              { id: 'mitochondria', label: '⚡ ମାଇଟୋକଣ୍ଡ୍ରିଆ' },
              { id: 'nucleus', label: '🔵 ନ୍ୟୁକ୍ଲିୟସ୍' },
              ...(cellType === 'PLANT'
                ? [
                    { id: 'chloroplast', label: '🌱 ହରିତ୍‌କଣା' },
                    { id: 'vacuole', label: '💧 ରସଧାନୀ' },
                  ]
                : [{ id: 'membrane', label: '🛡️ କୋଷଝିଲ୍ଲୀ' }]),
            ].map((org) => (
              <Pressable
                key={org.id}
                style={[
                  styles.organellePill,
                  selectedOrganelle === org.id && styles.organellePillActive,
                ]}
                onPress={() => setSelectedOrganelle(org.id as OrganelleId)}
              >
                <Text
                  style={[
                    styles.organellePillText,
                    selectedOrganelle === org.id && styles.organellePillTextActive,
                  ]}
                >
                  {org.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Action Row: 3D Rotate */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={[styles.actionBtn, isRotating ? styles.actionBtnStop : styles.actionBtnRotate]}
              onPress={() => setIsRotating(!isRotating)}
            >
              <Text style={styles.actionBtnText}>
                {isRotating ? '⏸️ ରୋକନ୍ତୁ' : '🔄 3D ବୁଲାନ୍ତୁ (Rotate View)'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionBtnReset}
              onPress={() => {
                setIsRotating(false);
                setRotAngle(20);
              }}
            >
              <Text style={styles.actionBtnResetText}>🔄 Reset 3D</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Osmosis Mode Controls: Salt concentration pills
        <View style={styles.controlsSection}>
          <Text style={styles.controlsLabel}>ଦ୍ରବଣର ଲୁଣ ସାନ୍ଦ୍ରତା ଚୟନ କରନ୍ତୁ (Salt Concentration):</Text>
          <View style={styles.saltButtonsRow}>
            {[
              { conc: 0, label: '💧 0% Salt (ଅଳ୍ପ ସାନ୍ଦ୍ର / Hypotonic)', color: '#0284C7' },
              { conc: 0.9, label: '⚖️ 0.9% Salt (ସମ ସାନ୍ଦ୍ର / Isotonic)', color: '#475569' },
              { conc: 20, label: '🧂 20% Salt (ଅତି ସାନ୍ଦ୍ର / Hypertonic)', color: '#DC2626' },
            ].map((item) => (
              <Pressable
                key={item.conc}
                style={[
                  styles.saltBtn,
                  saltConcentration === item.conc && {
                    backgroundColor: item.color,
                    borderColor: item.color,
                  },
                ]}
                onPress={() => setSaltConcentration(item.conc)}
              >
                <Text
                  style={[
                    styles.saltBtnText,
                    saltConcentration === item.conc && styles.saltBtnTextActive,
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
        {viewMode === 'CELL' ? (
          <Text style={styles.explanationText}>
            {selectedOrganelle === 'mitochondria' &&
              '⚡ ମାଇଟୋକଣ୍ଡ୍ରିଆ (Mitochondria): କୋଷର ଶକ୍ତି କେନ୍ଦ୍ର (Powerhouse of the Cell) । ଏହା ଶ୍ୱସନ କ୍ରିୟା ଦ୍ୱାରା ଏ-ଟି-ପି (ATP) ଆକାରରେ ଶକ୍ତି ଉତ୍ପାଦନ କରେ ।'}
            {selectedOrganelle === 'nucleus' &&
              '🔵 ନ୍ୟୁକ୍ଲିୟସ୍ (Nucleus): କୋଷର ନିର୍ଦ୍ଦେଶକ । ଏଥିରେ ଡି-ଏନ୍-ଏ (DNA) ଏବଂ ଜିନ୍ ଥାଏ ଯାହା ବଂଶାନୁକ୍ରମିକ ଗୁଣ ବହନ କରେ ।'}
            {selectedOrganelle === 'chloroplast' &&
              '🌱 ହରିତ୍‌କଣା (Chloroplast): କେବଳ ଉଦ୍ଭିଦ କୋଷରେ ଥାଏ । ଆଲୋକଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାରେ ସୂର୍ଯ୍ୟାଲୋକରୁ ଖାଦ୍ୟ (ଗ୍ଲୁକୋଜ୍) ତିଆରି କରେ ।'}
            {selectedOrganelle === 'vacuole' &&
              '💧 ରସଧାନୀ (Vacuole): ଉଦ୍ଭିଦ କୋଷରେ ଏକ ବୃହତ୍ କେନ୍ଦ୍ରୀୟ ରସଧାନୀ ଥାଏ, ଯାହା ଜଳ ଏବଂ ପୋଷକ ତତ୍ତ୍ୱ ସଞ୍ଚୟ କରି କୋଷକୁ ଟର୍ଗର ଚାପ ଦିଏ ।'}
            {selectedOrganelle === 'membrane' &&
              '🛡️ କୋଷଝିଲ୍ଲୀ (Cell Membrane): ଅର୍ଦ୍ଧପାରଗମ୍ୟ ଝିଲ୍ଲୀ, ଯାହା କେବଳ ଆବଶ୍ୟକୀୟ ପଦାର୍ଥକୁ କୋଷ ଭିତରକୁ ଓ ବାହାରକୁ ଯିବାକୁ ଦିଏ ।'}
          </Text>
        ) : (
          <Text style={styles.explanationText}>
            {saltConcentration === 0 &&
              '💧 0% ଲୁଣ ଦ୍ରବଣ ନେଲେ: କୋଷ ବାହାରେ ଜଳର ସାନ୍ଦ୍ରତା ଅଧିକ ଥିବାରୁ ଅନ୍ତଃସ୍ରାବ (Endosmosis) ଘଟେ । ଜଳ କୋଷ ଭିତରକୁ ପ୍ରବେଶ କରି କୋଷଟି ଫୁଲି ସ୍ଫୀତ (Turgid, +6.8mm) ହୋଇଯାଏ !'}
            {saltConcentration === 0.9 &&
              '⚖️ 0.9% ଲୁଣ ଦ୍ରବଣ ନେଲେ: କୋଷର ଭିତର ଓ ବାହାର ସାନ୍ଦ୍ରତା ସମାନ ଥାଏ । ଜଳ ଯେତିକି ଭିତରକୁ ଯାଏ ସେତିକି ବାହାରକୁ ଆସେ (ସନ୍ତୁଳିତ ଅବସ୍ଥା) ।'}
            {saltConcentration === 20 &&
              '🧂 20% ଲୁଣ ଦ୍ରବଣ ନେଲେ: ବାହାରେ ଲୁଣ ଅଧିକ ଓ ଜଳ କମ୍ ଥିବାରୁ ବହିଃସ୍ରାବ (Exosmosis) ଘଟେ । କୋଷରୁ ସବୁ ପାଣି ବାହାରି କୋଷଟି ସଙ୍କୁଚିତ ଓ ଶିଥିଳ (Plasmolyzed / Flaccid, -5.5mm) ହୋଇଯାଏ !'}
          </Text>
        )}
      </View>

      {/* Launch Pocket Jugaad Lab Banner */}
      {onOpenJugaadLab && (
        <Pressable
          style={styles.jugaadBannerBtn}
          onPress={onOpenJugaadLab}
          accessibilityRole="button"
          accessibilityLabel="Launch Pocket Jugaad Biology Osmosis Lab"
        >
          <Text style={styles.jugaadBannerBtnText}>
            🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ ରେ ଆଳୁ ଅଭିସ୍ରବଣ ପରୀକ୍ଷା (Launch Osmosis Lab) ➔
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
    backgroundColor: '#062817',
  },
  controlsSection: {
    marginTop: spacing.sm,
  },
  cellTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xs + 2,
  },
  cellTypeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
  },
  cellTypeBtnActive: {
    backgroundColor: '#166534',
    borderColor: '#14532D',
  },
  cellTypeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cellTypeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  organellesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs + 2,
  },
  organellePill: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
  },
  organellePillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#0F172A',
  },
  organellePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  organellePillTextActive: {
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
  actionBtnRotate: {
    backgroundColor: '#0284C7',
  },
  actionBtnStop: {
    backgroundColor: '#DC2626',
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
  saltButtonsRow: {
    flexDirection: 'column',
    gap: 6,
  },
  saltBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
  },
  saltBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saltBtnTextActive: {
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

export default Biology3DSimulation;
