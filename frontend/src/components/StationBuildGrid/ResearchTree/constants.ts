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

// Ship group: ship card on the left + single-row 5×1 addon grid on the right.
// Each addon card is wrapped in its own NodeFrame (label-above-card) so each upgrade shows its
// name — height is doubled: 16px label + 80px card per addon, plus another 16px label for the
// outer "Upgrades" frame = 112px total.
// Width  = ship card (80) + 5 × addon (80) + 4 × inter-card gap (8) = 512
export const SHIP_FRAME_WIDTH = 512
export const SHIP_FRAME_HEIGHT = CARD_FRAME_HEIGHT + FRAME_LABEL_HEIGHT
