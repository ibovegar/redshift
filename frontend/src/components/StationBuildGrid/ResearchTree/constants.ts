import { CARD_HEIGHT, CARD_WIDTH } from './ResearchCard/ResearchCard'

// Horizontal tree: depth advances along X, siblings stack along Y.
export const DEPTH_GAP = 70
export const SIBLING_GAP = 40
export const DEPTH_STEP = CARD_WIDTH + DEPTH_GAP

// Per-node frame chrome — thin border + small uppercase label sitting OUTSIDE the box at the top.
export const FRAME_LABEL_HEIGHT = 16
export const FRAME_PADDING = 6
export const FRAME_BORDER_COLOR = 'rgba(150, 175, 200, 0.35)'
export const FRAME_LABEL_COLOR = 'rgba(210, 225, 240, 0.8)'

// Single muted color used for every connection line (no per-category color).
export const EDGE_COLOR = 'rgba(170, 195, 220, 0.45)'
export const EDGE_NOTCH_SIZE = 4
export const EDGE_NOTCH_COLOR = 'rgba(170, 195, 220, 0.75)'

// Layout-time dimensions of the framed node bbox (label space included).
export const CARD_FRAME_WIDTH = CARD_WIDTH + 2 * FRAME_PADDING
export const CARD_FRAME_HEIGHT = CARD_HEIGHT + 2 * FRAME_PADDING + FRAME_LABEL_HEIGHT

// Ship group: ship card on the left + 3×2 addon grid on the right, each in its own frame.
// Total width = SHIP_BOX_WIDTH (CARD_FRAME_WIDTH) + BOX_GAP + UPGRADES_BOX_WIDTH.
// Total height matches the upgrades frame (the taller of the two sub-frames).
export const SHIP_FRAME_WIDTH = 372
export const SHIP_FRAME_HEIGHT = 184
