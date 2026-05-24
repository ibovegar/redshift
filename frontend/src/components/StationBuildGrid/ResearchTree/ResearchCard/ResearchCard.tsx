import ImageIcon from '@mui/icons-material/Image'
import { Box } from '@mui/material'
import type { Blueprint, BlueprintCategory } from 'models/blueprint'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES } from 'models/station-section'
import type { ResearchStatus } from '../../utils'

export const CARD_WIDTH = 80
export const CARD_HEIGHT = 80
const STATUS_INDICATOR_SIZE = 14

const CARD_BG_COLOR = 'rgba(22, 42, 63, 0.55)'

// 45° zebra stripes overlaid on cards that haven't been researched yet. Sits above the dimmed
// thumbnail but under the status corner, so the "not yet built" hatching is clearly visible.
const UNRESEARCHED_STRIPES =
  'repeating-linear-gradient(45deg, rgba(140, 175, 210, 0.18) 0, rgba(140, 175, 210, 0.18) 4px, transparent 4px, transparent 10px)'

// Per-category color retained for the connecting lines / external references; cards themselves
// no longer carry a category fill — the EVE-style status corner is the only color signal on a card.
export const CATEGORY_COLORS: Record<BlueprintCategory, { base: string; active: string }> = {
  module: { base: '#6f8aa6', active: '#4d6982' },
  ship: { base: '#b08658', active: '#85633e' },
  'ship-addon': { base: '#6fa07a', active: '#4f7a59' }
}

// EVE-style status corner colors — small triangle in the top-left of each tile.
const STATUS_INDICATOR_COLORS: Record<ResearchStatus, string | null> = {
  researched: '#4caf50',
  'in-progress': '#26c6da',
  available: '#ffb74d',
  locked: '#5a6675'
}

const getBlueprintImage = (bp: Blueprint): string | null => {
  if (bp.category === 'module') return SECTION_IMAGES[bp.targetId as SectionType] ?? null
  // Ships use `public/images/spacecraft_lg/<targetId>.png`. The targetId is intentionally kept
  // in sync with the image filename in `models/blueprint.ts`.
  if (bp.category === 'ship') return `/images/spacecraft_lg/${bp.targetId}.png`
  // Ship-addon targetIds are `<addonType>-<shipTargetId>` (e.g. `engine-tellrx5`); the matching
  // image filename is `<shipTargetId>_<addonType>.png` (e.g. `tellrx5_engine.png`).
  if (bp.category === 'ship-addon') {
    const dash = bp.targetId.indexOf('-')
    if (dash === -1) return null
    const type = bp.targetId.slice(0, dash)
    const shipTargetId = bp.targetId.slice(dash + 1)
    return `/images/upgrade_lg/${shipTargetId}_${type}.png`
  }
  return null
}

interface Props {
  blueprint: Blueprint
  status: ResearchStatus
  onClick: () => void
}

export const ResearchCard = ({ blueprint, status, onClick }: Props) => {
  const isResearched = status === 'researched'
  const image = getBlueprintImage(blueprint)

  return (
    <Box
      onClick={(e) => {
        // Stop the click from bubbling up to ReactFlow's `onNodeClick`. Otherwise the same click
        // would fire `handleCardClick` twice — once for THIS specific blueprint (from here), and
        // once for the parent ReactFlow node's blueprint (which for an addon inside ShipGroupNode
        // would mistakenly try to research the SHIP instead of the addon).
        e.stopPropagation()
        onClick()
      }}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        cursor: 'pointer',
        position: 'relative',
        bgcolor: CARD_BG_COLOR
      }}
    >
      <CardThumbnail image={image} dim={!isResearched} />
      {!isResearched && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: UNRESEARCHED_STRIPES,
            pointerEvents: 'none'
          }}
        />
      )}
      <StatusCorner status={status} />
    </Box>
  )
}

const CardThumbnail = ({ image, dim }: { image: string | null; dim: boolean }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: dim ? 0.35 : 1
    }}
  >
    {image ? (
      <Box component="img" src={image} alt="" sx={{ width: '85%', height: '85%', objectFit: 'contain' }} />
    ) : (
      <ImageIcon sx={{ fontSize: 36, color: 'rgba(200,220,240,0.45)' }} />
    )}
  </Box>
)

const StatusCorner = ({ status }: { status: ResearchStatus }) => {
  const color = STATUS_INDICATOR_COLORS[status]
  if (!color) return null
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderTop: `${STATUS_INDICATOR_SIZE}px solid ${color}`,
        borderRight: `${STATUS_INDICATOR_SIZE}px solid transparent`,
        pointerEvents: 'none'
      }}
    />
  )
}
