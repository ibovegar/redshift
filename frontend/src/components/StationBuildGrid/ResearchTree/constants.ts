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

// Ship group: ship card on the left + single-row 5×1 addon grid on the right, each in its own
// frame. Total height matches the card frame (single row of cards), so the ship's bbox doesn't
// grow vertically when it's researched — keeps the tree compact.
// Width  = ship card (80) + 5 × addon (80) + 4 × inter-card gap (8) = 512
// Height = single addon row (80) + label space (16) = CARD_FRAME_HEIGHT (96)
export const SHIP_FRAME_WIDTH = 512
export const SHIP_FRAME_HEIGHT = CARD_FRAME_HEIGHT
