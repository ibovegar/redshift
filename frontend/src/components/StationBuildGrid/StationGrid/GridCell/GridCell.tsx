import AddIcon from '@mui/icons-material/Add'
import { Box, Typography } from '@mui/material'
import { keyframes, type SxProps, type Theme } from '@mui/material/styles'
import { HudButton } from 'components/HudButton/HudButton'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import type { ReactNode } from 'react'
import { hudColors } from 'ui/theme/typography'
import type { CellState } from '../../utils'

export const CELL = 160
const NOTCH = 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))'

const cellBaseSx: SxProps<Theme> = {
  width: CELL,
  height: CELL,
  position: 'relative',
  overflow: 'hidden',
  clipPath: NOTCH,
  bgcolor: 'hud.surfaceDeep'
}

interface GridCellProps {
  type?: SectionType
  state?: CellState
  canBuild?: boolean
  /** Triggers the one-shot fade-in animation on the online cell — used right after a build
   *  completes so the new module fades in instead of popping in when the menu reopens. */
  justBuilt?: boolean
  onBuild?: (element: HTMLElement) => void
}

// Multi-stage "materialise" reveal: cell starts small + over-bright (looks like a flash), pops
// past full size with a cyan halo (drop-shadow, since the cell has a clipPath and box-shadow
// would be clipped away), then settles. EVE-style "module came online" beat. Glow values come
// from `hudColors` so the palette stays centralised even inside the keyframe template.
const moduleReveal = keyframes`
  0%   { opacity: 0; transform: scale(0.6); filter: brightness(2.8) saturate(1.4) drop-shadow(0 0 0 transparent); }
  45%  { opacity: 1; transform: scale(1.08); filter: brightness(1.6) saturate(1.2) drop-shadow(0 0 16px ${hudColors.glowCyanStrong}); }
  75%  { transform: scale(0.98); filter: brightness(1.1) drop-shadow(0 0 6px ${hudColors.glowCyanSoft}); }
  100% { opacity: 1; transform: scale(1); filter: brightness(1) drop-shadow(0 0 0 transparent); }
`

export const GridCell = ({ type, state, canBuild, justBuilt, onBuild }: GridCellProps) => {
  if (!type) return <EmptyCell />
  switch (state) {
    case 'online':
      return <OnlineCell type={type} justBuilt={justBuilt} />
    case 'unavailable':
      return <UnavailableCell />
    default:
      return <AvailableCell type={type} canBuild={!!canBuild} onBuild={onBuild} />
  }
}

const EmptyCell = () => (
  <Box sx={{ width: CELL, height: CELL, position: 'relative', bgcolor: 'hud.listRest', clipPath: NOTCH }}>
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
        color: 'hud.textBrightDim'
      }}
    />
  </Box>
)

const UnavailableCell = () => (
  <Box
    sx={{
      ...cellBaseSx,
      bgcolor: 'hud.listRest',
      backgroundImage: `repeating-linear-gradient(45deg, transparent 0 10px, ${hudColors.listRest} 10px 20px)`
    }}
  >
    <CenteredOverlay>
      <Typography variant="hud-label" sx={{ color: 'hud.textBrightDim' }}>
        Unavailable
      </Typography>
    </CenteredOverlay>
  </Box>
)

const OnlineCell = ({ type, justBuilt }: { type: SectionType; justBuilt?: boolean }) => (
  <Box
    sx={{
      ...cellBaseSx,
      ...(justBuilt && { animation: `${moduleReveal} 0.9s cubic-bezier(0.2, 0.9, 0.3, 1) 0.2s both` })
    }}
  >
    <Box sx={{ position: 'absolute', inset: 0, filter: 'brightness(0.88)' }}>
      <SectionImage type={type} />
    </Box>
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, pt: 2, pb: 2 }}>
      <CellLabel color="common.white">{SECTION_NAMES[type]}</CellLabel>
    </Box>
  </Box>
)

const AvailableCell = ({
  type,
  canBuild,
  onBuild
}: { type: SectionType; canBuild: boolean; onBuild?: (element: HTMLElement) => void }) => (
  <Box sx={cellBaseSx}>
    <Box sx={{ position: 'absolute', inset: -8, opacity: 0.35, filter: 'blur(4px)' }}>
      <SectionImage type={type} />
    </Box>
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, pt: 2, pb: 2 }}>
      <CellLabel color="common.white">{SECTION_NAMES[type]}</CellLabel>
    </Box>
    {canBuild && onBuild && (
      <CenteredOverlay>
        <Box onClick={(e) => e.stopPropagation()}>
          <HudButton variant="secondary" onClick={(e) => onBuild(e.currentTarget as HTMLElement)}>
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
