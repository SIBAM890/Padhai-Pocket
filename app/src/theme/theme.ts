/**
 * PadhAI Pocket Light-First Design System
 * Modern, clean, calm, accessible, and student-focused.
 */

export const colors = {
  // Primary Backgrounds
  background: '#FDF6E3',         // Warm cream canvas
  surface: '#FFFFFF',            // Crisp card surfaces (keep white)
  surfaceAlt: '#F5EBD0',         // Nested panels, subtle sections
  surfaceSubtle: '#F5EBD0',      // Input fields, table rows, tag backgrounds
  surfaceBorder: '#E2E8F0',      // Soft clean dividers
  surfaceElevated: '#FFFFFF',    // Elevated white cards
  
  // Brand Palettes
  primary: '#304FFE',            // Deep Blue / Soft Indigo (Refined & Modern)
  primaryLight: '#E8ECFF',       // Soft indigo tint for pills & highlights
  primaryDark: '#1A237E',        // Deep indigo headers
  
  // Secondary Brand
  secondary: '#0F9D8A',          // Calm Teal for learning progress & positive states
  secondaryLight: '#E6F4F1',     // Soft teal tint
  
  // Feedback & Accents
  success: '#22C55E',            // Energetic Green (used sparingly)
  successLight: '#DCFCE7',
  
  error: '#EF4444',              // Clean Red for errors and diagnostic flags
  errorLight: '#FEE2E2',

  accent: '#FF6B5F',             // Warm Coral for milestones & streaks
  accentLight: '#FFEBEA',
  
  warning: '#F59E0B',            // Warm Amber
  warningLight: '#FEF3C7',
  attention: '#F59E0B',
  attentionLight: '#FEF3C7',
  
  // Typography Colors
  textPrimary: '#1E293B',        // Deep Charcoal (never pure black)
  textSecondary: '#475569',      // Slate Body text
  textMuted: '#64748B',          // Subtitles & captions
  textDisabled: '#94A3B8',       // Disabled / inactive labels
  textOnPrimary: '#FFFFFF',      // High contrast on dark buttons
  
  // Borders
  border: '#E2E8F0',
  borderFocus: '#304FFE',
  borderSuccess: '#22C55E',
  borderTeal: '#0F9D8A',

  // Shadow Tint
  shadowColor: '#0F172A',
};

export const typography = {
  appTitle: { fontSize: 30, fontWeight: '800' as const, lineHeight: 38, color: colors.textPrimary },
  h1: { fontSize: 26, fontWeight: '800' as const, lineHeight: 34, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26, color: colors.textPrimary },
  cardHeading: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26, color: colors.textPrimary },
  bodyLarge: { fontSize: 18, fontWeight: '500' as const, lineHeight: 28, color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: colors.textSecondary },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, color: colors.textMuted, letterSpacing: 0.4 },
  button: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF' },
  mono: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  card: 18,
  hero: 24,
  button: 14,
  full: 9999,
};

export const shadows = {
  subtle: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  hover: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};
