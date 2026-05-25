import type { CSSProperties } from 'react'

// Semantic HUD color tokens — import in components that need to reference these in sx props
export const hudColors = {
  // Text scale on light HUD card surfaces (grey-blue base #414649 at varying alpha)
  text: '#414649', // primary body text (1.0)
  textMuted: 'rgba(65,70,73,0.6)', // secondary labels, symbols
  textDim: 'rgba(65,70,73,0.4)', // locked/disabled, empty cell icon
  textFaint: 'rgba(65,70,73,0.35)', // de-emphasized data, zero-value rows
  textBorder: 'rgba(65,70,73,0.3)', // dividers, dashed strokes

  // Text on dark / colored surfaces
  muted: 'rgba(0,0,0,0.5)', // labels on white panels
  faint: 'rgba(0,0,0,0.35)', // de-emphasized data on white panels
  alarm: '#000000', // text on colored alarm backgrounds

  // Status colors
  success: '#66bb6a', // operational, cost met
  error: '#cc6655', // cost unmet

  // Light card surfaces (module list items, pre-dark-menu era)
  cardBg: '#A4ABA9', // resting
  cardBgActive: '#707D7E', // selected
  cardBgHover: '#909898', // hover

  // === Dark build-menu palette ===
  // Surfaces (blue-navy, translucent)
  surface: 'rgba(22, 42, 63, 0.55)', // sub-cards, cost cells, hero thumbnail, ResearchCard
  surfaceDeep: 'rgba(0, 6, 12, 0.55)', // station-grid cell base
  // List-item tint scale — also reused for unavailable cell bg + zebra stripes (close enough
  // that a single low-alpha-white token works for all three).
  listRest: 'rgba(180, 200, 220, 0.05)',
  listHover: 'rgba(180, 200, 220, 0.1)',
  listActive: 'rgba(180, 200, 220, 0.18)',

  // Bright (blue-tinted neutral) text scale on dark surfaces — 3 levels covers everything.
  textBright: 'rgba(220, 235, 250, 0.95)', // primary body / titles
  textBrightSoft: 'rgba(220, 235, 250, 0.65)', // descriptions, labels, secondary text
  textBrightDim: 'rgba(220, 235, 250, 0.35)', // idle / disabled / placeholder

  // Borders on dark — 3 levels
  borderStrong: 'rgba(150, 175, 200, 0.35)', // outer panel border
  borderSubtle: 'rgba(150, 175, 200, 0.2)', // sub-card / divider / buildable card
  borderFaint: 'rgba(180, 200, 220, 0.08)', // DottedBackground + stat-row underline

  // Semantic status colors used in modal badges and ResearchCard status corner
  statusResearched: '#4caf50',
  statusInProgress: '#26c6da',
  statusAvailable: '#ffb74d',
  statusLocked: '#5a6675',

  // HUD progress bar — accent fill + bluish % label (both distinct from the bright text scale).
  progressBar: '#4488ff',
  progressLabel: 'rgba(170, 204, 255, 0.85)',

  // Black-tinted overlay (single token covers modal backdrop, progress-bar track, dark cell underlays)
  overlayBlack: 'rgba(0, 0, 0, 0.55)',

  // Cyan glow used by the GridCell `moduleReveal` keyframe — kept here so the colour palette
  // stays in one place even though the values land inside a CSS keyframes template string.
  glowCyanStrong: 'rgba(68, 200, 255, 0.7)',
  glowCyanSoft: 'rgba(68, 200, 255, 0.3)',

  // The build-menu wrapper background — also used by ExpandModal so detail panels read as the
  // same surface as the menu beneath. Exported as a full CSS gradient string so consumers can
  // drop it into `background` directly.
  menuGradient: 'linear-gradient(135deg, rgba(24, 38, 55, 0.98) 0%, rgba(14, 22, 32, 0.98) 100%)'
} as const

export type HudTypographyVariant =
  | 'hud-title'
  | 'hud-heading'
  | 'hud-label'
  | 'hud-tag'
  | 'hud-badge'
  | 'hud-data-xl'
  | 'hud-data'
  | 'hud-body'
  | 'hud-mono'
  | 'hud-alarm'

export const hudTypographyVariants: Record<HudTypographyVariant, CSSProperties> = {
  // Panel / card title — spacecraft name, "Mining Summary"
  'hud-title': {
    fontSize: 20,
    fontWeight: 700
  },

  // Sub-section heading — asteroid name, stat group titles
  'hud-heading': {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1
  },

  // Uppercase category label — "EXTRACTION COMPLETE", status results
  'hud-label': {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    lineHeight: 1
  },

  // Uppercase field label — "FUEL", "CARGO HOLD", row headers; muted by default
  'hud-tag': {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    lineHeight: 1,
    color: hudColors.muted
  },

  // Micro badge — rarity labels (COMMON, RARE…)
  'hud-badge': {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.5
  },

  // Large monospace number — arc gauge value display
  'hud-data-xl': {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: 'monospace',
    lineHeight: 1
  },

  // Monospace data — stat values, amounts, symbols
  'hud-data': {
    fontSize: 12,
    fontFamily: 'monospace'
  },

  // General prose — names, descriptions, metadata, captions
  'hud-body': {
    fontSize: 12
  },

  // Monospace prose — tooltip labels, console-style UI
  'hud-mono': {
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1
  },

  // Alert / warning banner text — always on a colored background
  'hud-alarm': {
    fontSize: 18,
    fontWeight: 700,
    color: hudColors.alarm
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants extends Record<HudTypographyVariant, CSSProperties> {}
  interface TypographyVariantsOptions extends Partial<Record<HudTypographyVariant, CSSProperties>> {}
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides extends Record<HudTypographyVariant, true> {}
}
