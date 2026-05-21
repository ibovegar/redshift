import ImageIcon from '@mui/icons-material/Image'
import { Box } from '@mui/material'
import type { Blueprint, BlueprintCategory } from 'models/blueprint'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES } from 'models/station-section'
import type { ResearchStatus } from '../../utils'

export const CARD_WIDTH = 80
export const CARD_HEIGHT = 80
const STATUS_INDICATOR_SIZE = 14

const CARD_HOVER_BORDER_COLOR = 'rgba(220, 200, 110, 0.85)'
const CARD_BG_COLOR = 'rgba(15, 28, 42, 0.55)'

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
  return null
}

interface Props {
  blueprint: Blueprint
  status: ResearchStatus
  onClick: () => void
}

export const ResearchCard = ({ blueprint, status, onClick }: Props) => {
  const isLocked = status === 'locked'
  const image = getBlueprintImage(blueprint)

  return (
    <Box
      onClick={onClick}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        cursor: 'pointer',
        opacity: isLocked ? 0.55 : 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: CARD_BG_COLOR,
        overflow: 'hidden',
        transition: 'border-color 0.15s, filter 0.15s',
        '&:hover': { borderColor: CARD_HOVER_BORDER_COLOR, filter: 'brightness(1.1)' }
      }}
    >
      <CardThumbnail image={image} />
      <StatusCorner status={status} />
    </Box>
  )
}

const CardThumbnail = ({ image }: { image: string | null }) => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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
