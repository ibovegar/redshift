import AddIcon from '@mui/icons-material/Add'
import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { HudButton } from 'components/HudButton/HudButton'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import type { ReactNode } from 'react'
import { hudColors } from 'ui/theme/typography'
import type { CellState } from '../utils'

export const CELL = 160
const NOTCH = 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))'

const cellBaseSx: SxProps<Theme> = {
  width: CELL,
  height: CELL,
  position: 'relative',
  overflow: 'hidden',
  clipPath: NOTCH
}

interface GridCellProps {
  type?: SectionType
  state?: CellState
  canBuild?: boolean
  onBuild?: () => void
}

export const GridCell = ({ type, state, canBuild, onBuild }: GridCellProps) => {
  if (!type) return <EmptyCell />
  switch (state) {
    case 'online':
      return <OnlineCell type={type} />
    case 'unavailable':
      return <UnavailableCell />
    default:
      return <AvailableCell type={type} canBuild={!!canBuild} onBuild={onBuild} />
  }
}

const EmptyCell = () => (
  <Box sx={{ width: CELL, height: CELL, position: 'relative' }}>
    <svg aria-hidden="true" width={CELL} height={CELL} style={{ position: 'absolute', inset: 0, display: 'block' }}>
      <polygon
        points={`0.5,0.5 ${CELL - 0.5},0.5 ${CELL - 0.5},${CELL - 0.5} 14,${CELL - 0.5} 0.5,${CELL - 14}`}
        fill="none"
        stroke={hudColors.textBorder}
        strokeWidth="1"
        strokeDasharray="6 4"
      />
    </svg>
    <AddIcon
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        fontSize: 24,
        color: 'hud.textDim'
      }}
    />
  </Box>
)

const UnavailableCell = () => (
  <Box
    sx={{
      ...cellBaseSx,
      bgcolor: 'rgba(112,125,126,0.25)',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 10px, rgba(65,70,73,0.08) 10px 20px)'
    }}
  >
    <CenteredOverlay>
      <Typography
        variant="hud-label"
        sx={{ color: 'hud.textMuted', px: 1, py: 0.5, bgcolor: 'rgba(193,198,193,0.85)' }}
      >
        Unavailable
      </Typography>
    </CenteredOverlay>
  </Box>
)

const OnlineCell = ({ type }: { type: SectionType }) => (
  <Box sx={cellBaseSx}>
    <Box sx={{ position: 'absolute', inset: 0, filter: 'brightness(0.88)' }}>
      <SectionImage type={type} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        pt: 2,
        pb: 2
      }}
    >
      <CellLabel color="common.white">{SECTION_NAMES[type]}</CellLabel>
    </Box>
  </Box>
)

const AvailableCell = ({
  type,
  canBuild,
  onBuild
}: {
  type: SectionType
  canBuild: boolean
  onBuild?: () => void
}) => (
  <Box sx={cellBaseSx}>
    <Box sx={{ position: 'absolute', inset: -8, opacity: 0.35, filter: 'blur(4px)' }}>
      <SectionImage type={type} />
    </Box>
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, pt: 5, pb: 1, px: 1 }}>
      <CellLabel color="common.black">{SECTION_NAMES[type]}</CellLabel>
    </Box>
    {canBuild && onBuild && (
      <CenteredOverlay>
        <Box onClick={(e) => e.stopPropagation()}>
          <HudButton variant="secondary" onClick={onBuild}>
            Available
          </HudButton>
        </Box>
      </CenteredOverlay>
    )}
  </Box>
)

const SectionImage = ({ type }: { type: SectionType }) => (
  <Box
    component="img"
    src={SECTION_IMAGES[type]}
    alt=""
    sx={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }}
  />
)

const CellLabel = ({ color, children }: { color: string; children: ReactNode }) => (
  <Typography variant="hud-label" sx={{ color, textAlign: 'center' }}>
    {children}
  </Typography>
)

const CenteredOverlay = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {children}
  </Box>
)
