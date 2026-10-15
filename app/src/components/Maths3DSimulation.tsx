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

export interface Maths3DSimulationProps {
  onOpenJugaadLab?: () => void;
  playingVoice?: boolean;
  onToggleVoice?: () => void;
}

type MathMode = 'SPIRAL' | 'TRIGONOMETRY';

interface NumberValueOption {
  id: string;
  label: string;
  subLabel: string;
  val: number;
  type: 'RATIONAL' | 'IRRATIONAL';
  baseX: number;
  heightY: number;
}

export const Maths3DSimulation: React.FC<Maths3DSimulationProps> = ({
  onOpenJugaadLab,
  playingVoice,
  onToggleVoice,
}) => {
  // Mode: 3D Real Number Spiral vs 3D Shadow Trigonometry
  const [viewMode, setViewMode] = useState<MathMode>('SPIRAL');

  // Spiral Mode State
  const numberOptions: NumberValueOption[] = [
    { id: 'sqrt2', label: '√2 ≈ 1.414', subLabel: 'ଅପରିମେୟ (Irrational)', val: 1.414, type: 'IRRATIONAL', baseX: 1, heightY: 1 },
    { id: 'sqrt3', label: '√3 ≈ 1.732', subLabel: 'ଅପରିମେୟ (Irrational)', val: 1.732, type: 'IRRATIONAL', baseX: 1.414, heightY: 1 },
    { id: 'sqrt5', label: '√5 ≈ 2.236', subLabel: 'ଅପରିମେୟ (Irrational)', val: 2.236, type: 'IRRATIONAL', baseX: 2, heightY: 1 },
    { id: 'rational', label: '3/4 = 0.75', subLabel: 'ପରିମେୟ (p/q, q ≠ 0)', val: 0.75, type: 'RATIONAL', baseX: 0.75, heightY: 0 },
    { id: 'pi', label: 'π ≈ 3.142', subLabel: 'ଅପରିମେୟ (Transcendental)', val: 3.142, type: 'IRRATIONAL', baseX: 3.142, heightY: 0 },
  ];
  const [selectedNum, setSelectedNum] = useState<NumberValueOption>(numberOptions[0]);
  const [rotAngle, setRotAngle] = useState<number>(20);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Trigonometry Mode State: Distance d (4m, 8m, 12m), Angle theta (30, 45, 60 deg)
  const [distance, setDistance] = useState<number>(8);
  const [angleDeg, setAngleDeg] = useState<number>(45);

  const spinTimerRef = useRef<any>(null);

  // 3D Rotation Animation
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

  // Trigonometry Calculation: Height = d * tan(theta) + eyeHeight (1.2m)
  const tanMap: Record<number, number> = { 30: 0.577, 45: 1.0, 60: 1.732 };
  const currentTan = tanMap[angleDeg] || 1.0;
  const eyeHeight = 1.2;
  const treeHeight = Number((distance * currentTan + eyeHeight).toFixed(2));
  const shadowLength = Number((treeHeight / currentTan).toFixed(1));

  // 3D Isometric projection math for number spiral
  const project3D = (x: number, y: number, z: number, cx = 170, cy = 110) => {
    const radY = (rotAngle * Math.PI) / 180;
    const radX = (20 * Math.PI) / 180;

    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const dist = 320;
    const scale = dist / (dist + z2);

    return {
      screenX: cx + x1 * scale,
      screenY: cy + y2 * scale,
      depth: z2,
      scale,
    };
  };

  // Convert number value to X pixel on number line
  // Origin (0) at screenX = 110, Unit 1 = 60px
  const unitScale = 52;
  const originX = 90;

  return (
    <View style={styles.card}>
      {/* Simulation Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.titleOr}>୩-D ଗାଣିତିକ ଜ୍ୟାମିତି ଓ ତ୍ରିକୋଣମିତି</Text>
          <Text style={styles.titleEn}>
            {viewMode === 'SPIRAL'
              ? '3D Number Spiral & Pythagoras Construction (√2, √3, √5)'
              : '3D Clinometer & Shadow Trigonometry (h = d·tanθ + 1.2m)'}
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

        {/* View Mode Switcher */}
        <View style={styles.modeSwitchRow}>
          <Pressable
            style={[styles.modeTab, viewMode === 'SPIRAL' && styles.modeTabActive]}
            onPress={() => setViewMode('SPIRAL')}
          >
            <Text style={[styles.modeTabText, viewMode === 'SPIRAL' && styles.modeTabTextActive]}>
              📐 3D ସ୍ପାଇରାଲ୍
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, viewMode === 'TRIGONOMETRY' && styles.modeTabActive]}
            onPress={() => setViewMode('TRIGONOMETRY')}
          >
            <Text style={[styles.modeTabText, viewMode === 'TRIGONOMETRY' && styles.modeTabTextActive]}>
              🌲 3D ଛାୟା ତ୍ରିକୋଣ
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main 3D Canvas */}
      <View style={styles.canvasContainer}>
        {viewMode === 'SPIRAL' ? (
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Dark Studio Coordinate Background */}
            <Rect x="0" y="0" width="340" height="210" fill="#090D16" rx={8} />

            {/* 3D Floor Depth Grid */}
            <Line x1="10" y1="160" x2="330" y2="160" stroke="#1E293B" strokeWidth="1" />
            <Line x1="30" y1="180" x2="310" y2="180" stroke="#1E293B" strokeWidth="1" />
            <Line x1="60" y1="200" x2="280" y2="200" stroke="#1E293B" strokeWidth="1" />
            <Line x1="90" y1="160" x2="50" y2="210" stroke="#1E293B" strokeWidth="0.8" />
            <Line x1="190" y1="160" x2="190" y2="210" stroke="#1E293B" strokeWidth="0.8" />
            <Line x1="290" y1="160" x2="320" y2="210" stroke="#1E293B" strokeWidth="0.8" />

            {/* Real Number Axis (X-Axis) with 3D Depth */}
            <Line x1="20" y1="150" x2="320" y2="150" stroke="#38BDF8" strokeWidth="3" />
            <Polygon points="320,146 328,150 320,154" fill="#38BDF8" />
            <Polygon points="20,146 12,150 20,154" fill="#38BDF8" />

            {/* Ticks: -1, 0, 1, 2, 3 */}
            {[-1, 0, 1, 2, 3].map((num) => {
              const tx = originX + num * unitScale;
              return (
                <G key={`tick-${num}`}>
                  <Line x1={tx} y1="143" x2={tx} y2="157" stroke="#BAE6FD" strokeWidth="2" />
                  <SvgText
                    x={tx}
                    y="172"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#E0F2FE"
                    textAnchor="middle"
                  >
                    {num}
                  </SvgText>
                </G>
              );
            })}

            {/* 3D Pythagoras Triangle Construction for √2, √3, √5 */}
            {selectedNum.heightY > 0 && (
              (() => {
                // Origin (0,0) in 3D
                const p0 = project3D(0, 0, 0, originX, 150);
                // Base point (baseX, 0) in 3D
                const pBase = project3D(selectedNum.baseX * unitScale, 0, 0, originX, 150);
                // Elevated Perpendicular apex in 3D
                const pApex = project3D(
                  selectedNum.baseX * unitScale,
                  -selectedNum.heightY * unitScale,
                  selectedNum.id === 'sqrt3' ? 25 : 0,
                  originX,
                  150
                );
                // Target projected point on axis
                const pTarget = originX + selectedNum.val * unitScale;

                return (
                  <G>
                    {/* Triangle Filled Face with translucent 3D gradient look */}
                    <Polygon
                      points={`${p0.screenX},${p0.screenY} ${pBase.screenX},${pBase.screenY} ${pApex.screenX},${pApex.screenY}`}
                      fill="#3B82F6"
                      opacity={0.25}
                    />

                    {/* Base Segment [0 to baseX] */}
                    <Line
                      x1={p0.screenX}
                      y1={p0.screenY}
                      x2={pBase.screenX}
                      y2={pBase.screenY}
                      stroke="#60A5FA"
                      strokeWidth={3}
                    />

                    {/* Perpendicular Segment (Unit 1 height) */}
                    <Line
                      x1={pBase.screenX}
                      y1={pBase.screenY}
                      x2={pApex.screenX}
                      y2={pApex.screenY}
                      stroke="#F59E0B"
                      strokeWidth={3}
                    />
                    {/* Right Angle 90-deg symbol */}
                    <Rect
                      x={pBase.screenX - 8}
                      y={pBase.screenY - 10}
                      width={8}
                      height={8}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                    />
                    <SvgText
                      x={pBase.screenX + 12}
                      y={pBase.screenY - 20}
                      fontSize="9.5"
                      fontWeight="bold"
                      fill="#FBBF24"
                    >
                      ୧ ଏକକ (1 unit)
                    </SvgText>

                    {/* Hypotenuse (କର୍ଣ୍ଣ = √value) */}
                    <Line
                      x1={p0.screenX}
                      y1={p0.screenY}
                      x2={pApex.screenX}
                      y2={pApex.screenY}
                      stroke="#EC4899"
                      strokeWidth={3.5}
                    />
                    <SvgText
                      x={(p0.screenX + pApex.screenX) / 2 - 15}
                      y={(p0.screenY + pApex.screenY) / 2 - 8}
                      fontSize="11"
                      fontWeight="bold"
                      fill="#F472B6"
                    >
                      {selectedNum.label.split('≈')[0]}
                    </SvgText>

                    {/* 3D Compass Sweeping Arc from Apex to Number Line */}
                    <Path
                      d={`M ${pApex.screenX} ${pApex.screenY} Q ${pTarget - 10} ${pApex.screenY + 20} ${pTarget} 150`}
                      stroke="#EC4899"
                      strokeWidth={2}
                      strokeDasharray="4,3"
                      fill="none"
                    />

                    {/* Apex Spherical Vertex */}
                    <Circle cx={pApex.screenX} cy={pApex.screenY} r={6} fill="#F43F5E" />
                    <Circle cx={pApex.screenX - 2} cy={pApex.screenY - 2} r={2} fill="#FFFFFF" opacity={0.85} />
                  </G>
                );
              })()
            )}

            {/* Selected Value Marker Pin on the Number Line */}
            {(() => {
              const targetX = originX + selectedNum.val * unitScale;
              const isIrr = selectedNum.type === 'IRRATIONAL';
              const pinColor = isIrr ? '#DC2626' : '#2563EB';

              return (
                <G>
                  {/* Vertical Projection Drop Line */}
                  <Line x1={targetX} y1={150} x2={targetX} y2={60} stroke={pinColor} strokeWidth={2} strokeDasharray="3,3" />

                  {/* Surface Contact Point Ring */}
                  <Circle cx={targetX} cy={150} r={6} fill={pinColor} />
                  <Circle cx={targetX} cy={150} r={3} fill="#FFFFFF" />

                  {/* Floating Pin Badge */}
                  <Rect
                    x={targetX - 42}
                    y={32}
                    width={84}
                    height={28}
                    rx={6}
                    fill="#1E293B"
                    stroke={pinColor}
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={targetX}
                    y={46}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    {selectedNum.label}
                  </SvgText>
                  <SvgText
                    x={targetX}
                    y={56}
                    fontSize="7.5"
                    fontWeight="bold"
                    fill={isIrr ? '#FCA5A5' : '#93C5FD'}
                    textAnchor="middle"
                  >
                    {selectedNum.subLabel.split(' ')[0]}
                  </SvgText>
                </G>
              );
            })()}

            {/* 3D Angle Overlay */}
            <Rect x={10} y={10} width={80} height={20} rx={4} fill="#1E293B" opacity={0.8} />
            <SvgText x={15} y={24} fontSize="9" fontWeight="bold" fill="#94A3B8">
              3D କୋଣ: {rotAngle}°
            </SvgText>
          </Svg>
        ) : (
          // Trigonometry Mode: 3D Tree Height & Shadow Angle Visualization
          <Svg width="100%" height={210} viewBox="0 0 340 210">
            {/* Sky Background */}
            <Rect x="0" y="0" width="340" height="210" fill="#0F172A" rx={8} />

            {/* Sun Indicator & Directional Rays */}
            <G x={50} y={35}>
              <Circle cx={0} cy={0} r={18} fill="#F59E0B" opacity={0.3} />
              <Circle cx={0} cy={0} r={12} fill="#FBBF24" />
              <SvgText x={-18} y={26} fontSize="8" fontWeight="bold" fill="#FDE68A">
                ସୂର୍ଯ୍ୟ ({angleDeg}°)
              </SvgText>
            </G>

            {/* 3D Ground Plane */}
            <Polygon points="10,175 330,175 290,205 30,205" fill="#14532D" opacity={0.5} />
            <Line x1="10" y1="175" x2="330" y2="175" stroke="#166534" strokeWidth="2" />

            {/* Tree Base at X = 255, ground Y = 175 */}
            {/* Cast Shadow of the Tree on ground */}
            <Polygon
              points={`255,175 ${255 - shadowLength * 4.5},175 ${255 - shadowLength * 4},185 255,185`}
              fill="#064E3B"
              opacity={0.65}
            />

            {/* Tall 3D Tree / Pole */}
            <G x={255} y={175}>
              {/* Trunk */}
              <Rect x={-5} y={-85} width={10} height={85} fill="#78350F" />
              {/* 3D Conical Foliage Layers */}
              <Polygon points="0,-125 -26,-75 26,-75" fill="#15803D" stroke="#166534" strokeWidth={1.5} />
              <Polygon points="0,-105 -22,-60 22,-60" fill="#16A34A" stroke="#15803D" strokeWidth={1.5} />
              <Polygon points="0,-85 -18,-45 18,-45" fill="#22C55E" />
              {/* Tree Top Marker */}
              <Circle cx={0} cy={-125} r={3} fill="#FACC15" />
            </G>

            {/* Student Clinometer Observer at X = 85 (Distance d away) */}
            <G x={85} y={175}>
              {/* Ground Shadow under student */}
              <Ellipse cx={0} cy={2} rx={12} ry={4} fill="#022C22" opacity={0.7} />
              {/* Student Body */}
              <Line x1={0} y1={0} x2={0} y2={-22} stroke="#38BDF8" strokeWidth={3} />
              <Circle cx={0} cy={-28} r={6} fill="#FDBA74" />
              {/* Eye level line (1.2m) */}
              <Line x1={0} y1={-25} x2={170} y2={-25} stroke="#64748B" strokeWidth={1.5} strokeDasharray="3,3" />
              <SvgText x={-15} y={-38} fontSize="8" fontWeight="bold" fill="#BAE6FD">
                ଆଖି (1.2m)
              </SvgText>
            </G>

            {/* Hypotenuse: Line of Sight from Student Eye (85, 150) to Tree Top (255, 50) */}
            <Line x1={85} y1={150} x2={255} y2={50} stroke="#EF4444" strokeWidth={2.5} />

            {/* Angle of Elevation Arc at Student Eye */}
            <Path d="M 110 150 A 25 25 0 0 0 102 135" stroke="#F59E0B" strokeWidth={2} fill="none" />
            <SvgText x={112} y={142} fontSize="9" fontWeight="bold" fill="#FBBF24">
              θ = {angleDeg}°
            </SvgText>

            {/* Horizontal Distance Line [d = distance meters] */}
            <Line x1={85} y1={190} x2={255} y2={190} stroke="#38BDF8" strokeWidth={2} />
            <Polygon points="85,187 77,190 85,193" fill="#38BDF8" />
            <Polygon points="255,187 263,190 255,193" fill="#38BDF8" />
            <SvgText x={170} y={203} fontSize="10" fontWeight="bold" fill="#7DD3FC" textAnchor="middle">
              ଦୂରତା (d) = {distance} ମିଟର
            </SvgText>

            {/* Vertical Total Height Indicator [H = treeHeight meters] */}
            <Line x1={285} y1={50} x2={285} y2={175} stroke="#4ADE80" strokeWidth={2} />
            <Polygon points="282,50 285,42 288,50" fill="#4ADE80" />
            <Polygon points="282,175 285,183 288,175" fill="#4ADE80" />
            <SvgText x={292} y={115} fontSize="11" fontWeight="bold" fill="#86EFAC">
              {treeHeight}m
            </SvgText>

            {/* Calculation Badge Box */}
            <Rect x={110} y={10} width={220} height={34} rx={6} fill="#1E293B" stroke="#334155" strokeWidth={1} />
            <SvgText x={116} y={23} fontSize="9" fontWeight="bold" fill="#F8FAFC">
              ସୂତ୍ର: ଉଚ୍ଚତା h = d × tan({angleDeg}°) + 1.2m
            </SvgText>
            <SvgText x={116} y={37} fontSize="9.5" fontWeight="bold" fill="#4ADE80">
              = {distance} × {currentTan} + 1.2 = {treeHeight} ମିଟର
            </SvgText>
          </Svg>
        )}
      </View>

      {/* Interactive Controls Section */}
      {viewMode === 'SPIRAL' ? (
        <View style={styles.controlsSection}>
          <Text style={styles.controlsLabel}>ସଂଖ୍ୟା ରେଖାରେ ବିନ୍ଦୁ ଚୟନ କରନ୍ତୁ (Select Number):</Text>
          {/* Number Selector Pills */}
          <View style={styles.numbersGrid}>
            {numberOptions.map((opt) => (
              <Pressable
                key={opt.id}
                style={[
                  styles.numPill,
                  selectedNum.id === opt.id && styles.numPillActive,
                ]}
                onPress={() => setSelectedNum(opt)}
              >
                <Text
                  style={[
                    styles.numPillText,
                    selectedNum.id === opt.id && styles.numPillTextActive,
                  ]}
                >
                  {opt.label}
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
        // Trigonometry Controls: Distance & Angle Selectors
        <View style={styles.controlsSection}>
          <Text style={styles.controlsLabel}>ଦୂରତା (d) ଏବଂ ଉନ୍ନତି କୋଣ (θ) ନିୟନ୍ତ୍ରଣ କରନ୍ତୁ:</Text>
          {/* Distance Row */}
          <View style={styles.trigControlsRow}>
            <Text style={styles.trigSubLabel}>ଦୂରତା (d):</Text>
            {[4, 8, 12, 16].map((d) => (
              <Pressable
                key={`dist-${d}`}
                style={[
                  styles.paramPill,
                  distance === d && styles.paramPillActive,
                ]}
                onPress={() => setDistance(d)}
              >
                <Text style={[styles.paramPillText, distance === d && styles.paramPillTextActive]}>
                  {d}m
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Angle Row */}
          <View style={[styles.trigControlsRow, { marginTop: 4 }]}>
            <Text style={styles.trigSubLabel}>କୋଣ (θ):</Text>
            {[
              { deg: 30, label: '30° (tan = 0.58)' },
              { deg: 45, label: '45° (tan = 1.00)' },
              { deg: 60, label: '60° (tan = 1.73)' },
            ].map((ang) => (
              <Pressable
                key={`ang-${ang.deg}`}
                style={[
                  styles.paramPill,
                  angleDeg === ang.deg && styles.paramPillActive,
                ]}
                onPress={() => setAngleDeg(ang.deg)}
              >
                <Text style={[styles.paramPillText, angleDeg === ang.deg && styles.paramPillTextActive]}>
                  {ang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Dynamic Pedagogical Explanation ("By taking these values you get this") */}
      <View style={styles.explanationBox}>
        {viewMode === 'SPIRAL' ? (
          <Text style={styles.explanationText}>
            {selectedNum.id === 'sqrt2' &&
              '📐 √2 ର ଜ୍ୟାମିତିକ ଅଙ୍କନ: ଭୂମି = ୧ ଏକକ ଏବଂ ଲମ୍ବ = ୧ ଏକକ ନେଲେ ପିଥାଗୋରାସ୍ ଉପପାଦ୍ୟ ଅନୁସାରେ କର୍ଣ୍ଣ = √(୧² + ୧²) = √2 ହୁଏ । କମ୍ପାସ୍ ସାହାଯ୍ୟରେ ଏହି କର୍ଣ୍ଣକୁ ସଂଖ୍ୟା ରେଖାରେ ସ୍ଥାପନ କଲେ 1.414 ବିନ୍ଦୁ ମିଳେ !'}
            {selectedNum.id === 'sqrt3' &&
              '📐 √3 ର ଜ୍ୟାମିତିକ ଅଙ୍କନ: ଭୂମି = √2 ଏବଂ ଲମ୍ବ = ୧ ଏକକ ନେଲେ କର୍ଣ୍ଣ = √(2 + ୧) = √3 ≈ 1.732 ମିଳେ ।'}
            {selectedNum.id === 'sqrt5' &&
              '📐 √5 ର ଜ୍ୟାମିତିକ ଅଙ୍କନ: ଭୂମି = ୨ ଏବଂ ଲମ୍ବ = ୧ ଏକକ ନେଲେ କର୍ଣ୍ଣ = √(୨² + ୧²) = √5 ≈ 2.236 ମିଳେ ।'}
            {selectedNum.id === 'rational' &&
              '🔢 ପରିମେୟ ସଂଖ୍ୟା (Rational 3/4 = 0.75): ୦ ଏବଂ ୧ ମଧ୍ୟରେ ଥିବା ଦୂରତାକୁ ୪ ଭାଗ କରି ୩ୟ ଭାଗ ନେଲେ ସଠିକ୍ ପରିମେୟ ବିନ୍ଦୁ ମିଳେ ।'}
            {selectedNum.id === 'pi' &&
              '⭕ ପାଇ (π ≈ 3.14159...): ଏକ ଅପରିମେୟ ସଂଖ୍ୟା (ବୃତ୍ତର ପରିଧି ÷ ବ୍ୟାସ) । ସଂଖ୍ୟା ରେଖାରେ ୩ ର ଠିକ୍ ଡାହାଣକୁ ଏହା ଅବସ୍ଥିତ ।'}
          </Text>
        ) : (
          <Text style={styles.explanationText}>
            💡 ତ୍ରିକୋଣମିତିକ ସିଦ୍ଧାନ୍ତ: ଦୂରତା d = {distance}m ଏବଂ ଉନ୍ନତି କୋଣ θ = {angleDeg}° ନେଲେ (tan {angleDeg}° = {currentTan}), ଆଖି ଉଚ୍ଚତା 1.2m ମିଶାଇଲେ ଗଛର ପ୍ରକୃତ ଉଚ୍ଚତା {treeHeight} ମିଟର ବାହାରେ ! କୌଣସି ଉଚ୍ଚ ସ୍ଥାନକୁ ନ ଚଢ଼ି ତଳେ ଥାଇ ତ୍ରିକୋଣମିତି ସାହାଯ୍ୟରେ ସଠିକ୍ ଉଚ୍ଚତା ମାପିହୁଏ ।
          </Text>
        )}
      </View>

      {/* Launch Pocket Jugaad Lab Banner */}
      {onOpenJugaadLab && (
        <Pressable
          style={styles.jugaadBannerBtn}
          onPress={onOpenJugaadLab}
          accessibilityRole="button"
          accessibilityLabel="Launch Pocket Jugaad Maths Shadow Lab"
        >
          <Text style={styles.jugaadBannerBtnText}>
            🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ ରେ ଛାୟା ଓ କ୍ଲିନୋମିଟର୍ ପରୀକ୍ଷା (Launch Shadow Lab) ➔
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
    backgroundColor: '#090D16',
  },
  controlsSection: {
    marginTop: spacing.sm,
  },
  controlsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs + 2,
  },
  numPill: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
  },
  numPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#0F172A',
  },
  numPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  numPillTextActive: {
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
  trigControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  trigSubLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    minWidth: 60,
  },
  paramPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  paramPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0369A1',
  },
  paramPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  paramPillTextActive: {
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

export default Maths3DSimulation;
