import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

interface Props {
  children?: ReactNode
  sx?: SxProps<Theme>
  /** Solid base color of the panel. */
  baseColor?: string
  /** Color of the coarse grid lines (continuous, the primary structure). */
  coarseLineColor?: string
  /** Color of the medium grid lines that divide each coarse cell into a 4×4 sub-grid. */
  mediumLineColor?: string
  /** Color of the fine grid lines that further split each medium cell into a 2×2 sub-grid
   *  (overall 8×8 division of each coarse cell). */
  fineLineColor?: string
}

// 144 (not 140) so MEDIUM = 36 and FINE = 18 stay integer — fractional tile sizes (e.g. 17.5)
// would land half the fine lines on `.5` pixel positions and antialias across two physical pixels,
// making them look thicker than the coarse/medium lines.
const COARSE_GRID = 144
const MEDIUM_GRID = COARSE_GRID / 4
const FINE_GRID = MEDIUM_GRID / 2

// 6-layer stack (top → bottom):
//   1-2. Continuous coarse grid lines (the primary structure)
//   3-4. Solid medium grid lines that divide each coarse cell into a 4×4 sub-grid (16 boxes)
//   5-6. Solid fine grid lines that split each medium cell into a 2×2 sub-grid (4 boxes)
//   7. Solid base color
const buildBackground = (base: string, coarse: string, medium: string, fine: string) =>
  [
    `linear-gradient(-90deg, ${coarse} 1.5px, transparent 1.5px)`,
    `linear-gradient(${coarse} 1.5px, transparent 1.5px)`,
    `linear-gradient(-90deg, ${medium} 1px, transparent 1px)`,
    `linear-gradient(${medium} 1px, transparent 1px)`,
    `linear-gradient(-90deg, ${fine} 1px, transparent 1px)`,
    `linear-gradient(${fine} 1px, transparent 1px)`,
    base
  ].join(', ')

const BACKGROUND_SIZE = [
  `${COARSE_GRID}px ${COARSE_GRID}px`,
  `${COARSE_GRID}px ${COARSE_GRID}px`,
  `${MEDIUM_GRID}px ${MEDIUM_GRID}px`,
  `${MEDIUM_GRID}px ${MEDIUM_GRID}px`,
  `${FINE_GRID}px ${FINE_GRID}px`,
  `${FINE_GRID}px ${FINE_GRID}px`
].join(', ')

export const BlueprintBackground = ({
  children,
  sx,
  baseColor = '#070d14',
  coarseLineColor = '#111C24',
  mediumLineColor = '#0D151C',
  fineLineColor = '#091016'
}: Props) => (
  <Box
    sx={{
      background: buildBackground(baseColor, coarseLineColor, mediumLineColor, fineLineColor),
      backgroundSize: BACKGROUND_SIZE,
      ...sx
    }}
  >
    {children}
  </Box>
)
