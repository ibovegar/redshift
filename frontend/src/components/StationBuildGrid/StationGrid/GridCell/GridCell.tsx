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

// "Materialise" reveal — no scale, just a brightness flash with a cyan drop-shadow halo as the
// cell fades in. Drop-shadow (not box-shadow) so the halo respects the cell's clipPath notch.
// Glow values come from `hudColors` so the palette stays centralised even inside the keyframe.
const moduleReveal = keyframes`
  0%   { opacity: 0; filter: brightness(2.8) saturate(1.4) drop-shadow(0 0 0 transparent); }
//   45%  { opacity: 1; filter: brightness(1.6) saturate(1.2) drop-shadow(0 0 16px ${hudColors.glowCyanStrong}); }
//   75%  { filter: brightness(1.1) drop-shadow(0 0 6px ${hudColors.glowCyanSoft}); }
  100% { opacity: 1; filter: brightness(1) drop-shadow(0 0 0 transparent); }
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
  <Box
    sx={{
      width: CELL,
      height: CELL,
      position: 'relative',
      // Same alpha as listRest, but shifted toward the progressLabel blue hue (170, 204, 255)
      // so the empty slot reads as a faint blue tint instead of the blue-grey from listRest.
      // Visibility unchanged — only the hue moves.
      bgcolor: 'rgba(170, 204, 255, 0.05)',
      clipPath: NOTCH,
      opacity: 0.4
    }}
  >
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
      // Pre-composited solid equivalent of `listRest` (rgba(180,200,220,0.05)) painted over the
      // menu gradient — same tint the cell had before, but fully opaque so the dotted backdrop
      // no longer bleeds through. Stripes still use `listRest` so the unavailable look-and-feel
      // is preserved.
      bgcolor: '#1f2c3e',
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
      // Online cells sit on the dotted menu backdrop. The default surfaceDeep is too dark
      // around the image edges and makes the cell read as a dark patch — this lighter,
      // lower-alpha override blends the cell into the surrounding navy gradient.
      bgcolor: 'rgba(10, 18, 28, 0.6)',
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
}: {
  type: SectionType
  canBuild: boolean
  onBuild?: (element: HTMLElement) => void
}) => (
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
