import AddIcon from '@mui/icons-material/Add'
import { Box, LinearProgress, Typography } from '@mui/material'
import { keyframes, type SxProps, type Theme } from '@mui/material/styles'
import { HudButton } from 'components/HudButton/HudButton'
import { useTaskProgress } from 'components/InProgressBlock/InProgressBlock'
import type { BuildTask } from 'models/blueprint'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import type { ReactNode } from 'react'
import { hudColors } from 'ui/theme/typography'
import type { CellState } from '../../utils'

export const CELL = 168
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
  /** Active build task when THIS cell's section is under construction, else null. Drives the
   *  in-cell progress bar and takes precedence over the available/build affordance. */
  buildTask?: BuildTask | null
  /** Triggers the one-shot fade-in animation on the online cell — used right after a build
   *  completes so the new module fades in instead of popping in when the menu reopens. */
  justBuilt?: boolean
  onBuild?: (element: HTMLElement) => void
}

// Blur the Available card's image uses while idle — also the start point of the build-complete
// reveal, so a finished module appears to "focus" into place from the same blur.
const CARD_BLUR_PX = 4

// Build-complete reveal: unblur from CARD_BLUR_PX down to crisp over 2s when a module finishes.
const moduleReveal = keyframes`
  from { filter: blur(${CARD_BLUR_PX}px); }
  to   { filter: blur(0px); }
`

export const GridCell = ({ type, state, canBuild, buildTask, justBuilt, onBuild }: GridCellProps) => {
  if (!type) return <EmptyCell />
  // A build in progress on this section overrides the available/build affordance — show progress.
  if (buildTask) return <BuildingCell type={type} task={buildTask} />
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
        fontSize: 20,
        color: 'hud.textBrightDim'
      }}
    />
  </Box>
)

const UnavailableCell = () => (
  <Box
    sx={{
      ...cellBaseSx,
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
      ...(justBuilt && { animation: `${moduleReveal} 0.5s ease-out both` })
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

const BuildingCell = ({ type, task }: { type: SectionType; task: BuildTask }) => {
  const pct = useTaskProgress(task)
  return (
    <Box sx={cellBaseSx}>
      <Box sx={{ position: 'absolute', inset: -8, opacity: 0.3, filter: 'blur(4px)' }}>
        <SectionImage type={type} />
      </Box>
      <CenteredOverlay>
        <Box sx={{ width: '78%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            variant="hud-tag"
            sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.statusInProgress', textAlign: 'center' }}
          >
            Building
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 3,
              borderRadius: 0,
              backgroundColor: 'hud.overlayBlack',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'hud.progressBar',
                transition: 'transform 0.2s linear'
              }
            }}
          />
          <Typography sx={{ fontFamily: 'monospace', fontSize: 10, color: 'hud.progressLabel', textAlign: 'center' }}>
            {pct}%
          </Typography>
        </Box>
      </CenteredOverlay>
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, pt: 2, pb: 2 }}>
        <CellLabel color="common.white">{SECTION_NAMES[type]}</CellLabel>
      </Box>
    </Box>
  )
}

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
    <Box sx={{ position: 'absolute', inset: -8, opacity: 0.35, filter: `blur(${CARD_BLUR_PX}px)` }}>
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
