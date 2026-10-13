/**
 * PadhAI Pocket Design Tokens & Theme
 * Calm, accessible, low cognitive load, high contrast for Sunita.
 */

export const colors = {
  // Backgrounds
  background: '#07111f',        // Deep navy / dark blue
  surface: '#0e1b2d',           // Card surface
  surfaceElevated: '#15243a',   // Raised surface / input / option
  surfaceSubtle: '#1b2c45',     // Borders / divider
  
  // Accents
  primary: '#10b981',           // Mint / emerald green
  primaryLight: '#6ee7b7',      // Light mint
  primaryDark: '#047857',       // Dark emerald
  
  // Secondary / Attention
  attention: '#f59e0b',         // Warm amber / pending
  attentionLight: '#fbbf24',    // Light amber
  
  // Status & Feedback
  success: '#10b981',           // Correct / complete
  info: '#38bdf8',              // Info / guidance
  calmNotice: '#60a5fa',        // Friendly notice (no red panic)
  subtleBadge: '#1e293b',
  
  // Text
  textPrimary: '#ffffff',       // Pure white headers & options
  textSecondary: '#d9e2ef',     // Primary body
  textMuted: '#94a3b8',         // Subtitles & metadata
  textDisabled: '#475569',      // Inactive
  
  // Borders
  border: '#24364f',
  borderHighlight: '#3b82f6',
  borderSuccess: '#10b981',
  borderActive: '#6ee7b7',
};

export const typography = {
  // Scales with high readability and generous line height
  h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 36, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26, color: colors.textPrimary },
  bodyLarge: { fontSize: 18, fontWeight: '500' as const, lineHeight: 27, color: colors.textSecondary },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: colors.textSecondary },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, color: colors.textMuted, letterSpacing: 0.5 },
  button: { fontSize: 16, fontWeight: '700' as const, color: '#ffffff' },
  mono: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 9999,
};
