/**
 * PadhAI Pocket Light-First Design System
 * Modern, clean, calm, accessible, and student-focused.
 */

export const colors = {
  // Primary Backgrounds
  background: '#FAF7F0',         // Warm parchment / cream canvas (matches screenshot #FAF7F0 / #F9F6ED)
  surface: '#FFFFFF',            // Crisp card surfaces (keep white)
  surfaceAlt: '#F5EFEB',         // Warm sand beige panels / container sections
  surfaceSubtle: '#F5EBE1',      // Soft warm sand input fields, telemetry boxes, tag backgrounds
  surfaceBorder: '#EDE1CB',      // Soft warm sand dividers & borders (matches screenshot #EDE1CB)
  surfaceElevated: '#FFFFFF',    // Elevated white cards
  
  // Brand Palettes
  primary: '#C2410C',            // Terracotta / Burnt Orange (Rich clay action color)
  primaryLight: '#FDEEE9',       // Soft warm peach / terracotta tint for pills & highlights
  primaryDark: '#8C2B0E',        // Deep terracotta rust headers
  
  // Secondary Brand
  secondary: '#0D3F43',          // Deep Spruce / Forest Teal for prominent Odia titles & headers (matches screenshot #0D3F43 / #143F46)
  secondaryLight: '#D9ECF2',     // Soft pastel sky blue tint for online pill & calm badges (matches screenshot #D9ECF2)
  
  // Feedback & Accents
  success: '#15803D',            // Deep calm forest green
  successLight: '#DCFCE7',
  
  error: '#DC2626',              // Clean Red for errors and diagnostic flags
  errorLight: '#FEE2E2',

  accent: '#EA580C',             // Warm terracotta amber for milestones & streaks
  accentLight: '#FFEDD5',
  
  warning: '#D97706',            // Warm golden amber
  warningLight: '#FEF3C7',
  attention: '#D97706',
  attentionLight: '#FEF3C7',
  
  // Typography Colors
  textPrimary: '#143F46',        // Deep Dark Spruce / Charcoal (accessible contrast, matches screenshot #143F46)
  textSecondary: '#57534E',      // Warm Stone Slate body text
  textMuted: '#78716C',          // Warm muted stone for subtitles & captions
  textDisabled: '#A8A29E',       // Warm muted grey for disabled / inactive labels
  textOnPrimary: '#FFFFFF',      // High contrast on dark terracotta buttons
  
  // Borders
  border: '#EDE1CB',             // Soft warm tan border (matches screenshot #EDE1CB)
  borderFocus: '#C2410C',        // Terracotta focus border
  borderSuccess: '#15803D',
  borderTeal: '#0D3F43',

  // Shadow Tint
  shadowColor: '#451A03',        // Warm terracotta umber shadow tint
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
