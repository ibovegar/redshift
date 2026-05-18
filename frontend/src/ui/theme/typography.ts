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

  // Light card surfaces (module list items)
  cardBg: '#A4ABA9', // resting
  cardBgActive: '#707D7E', // selected
  cardBgHover: '#909898' // hover
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
