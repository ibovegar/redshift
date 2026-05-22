import { CARD_HEIGHT, CARD_WIDTH } from './ResearchCard/ResearchCard'

// Horizontal tree: depth advances along X, siblings stack along Y.
export const DEPTH_GAP = 150
export const SIBLING_GAP = 40
export const DEPTH_STEP = CARD_WIDTH + DEPTH_GAP

// Per-node frame chrome — thin border + small uppercase label sitting OUTSIDE the box at the top.
export const FRAME_LABEL_HEIGHT = 16
export const FRAME_BORDER_COLOR = 'rgba(150, 175, 200, 0.35)'
export const FRAME_LABEL_COLOR = 'rgba(210, 225, 240, 0.8)'

// Single muted color used for every connection line (no per-category color).
export const EDGE_COLOR = '#8ebdd8'

// Layout-time dimensions of the framed node bbox: the box snugly fits the card, the label sits
// above it. No internal padding — the card extends edge-to-edge inside its frame.
export const CARD_FRAME_WIDTH = CARD_WIDTH
export const CARD_FRAME_HEIGHT = CARD_HEIGHT + FRAME_LABEL_HEIGHT

// Ship group: ship card on the left + 3×2 addon grid on the right, each in its own frame.
// Width  = ship card (80) + gap (4) + 3 × addon (80) + 2 × inter-card gap (12) = 348
// Height = 2 × addon (80) + inter-row gap (12) = 172
export const SHIP_FRAME_WIDTH = 348
export const SHIP_FRAME_HEIGHT = 172
