import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { hudColors } from 'ui/theme/typography'

interface Props {
  children?: ReactNode
  sx?: SxProps<Theme>
  /** Color of each dot. */
  dotColor?: string
  /** Spacing between dot centers, in px. */
  gap?: number
  /** Dot radius in px. */
  dotSize?: number
}

// Default `dotColor` is slightly darker than the StationBuisldGrid panel bg (#C2C7C2) so the dots
// read as a subtle texture rather than a strong overlay. `dotSize` is sub-pixel for a fine stipple.
export const DottedBackground = ({ children, sx, dotColor = hudColors.borderFaint, gap = 5, dotSize = 0.6 }: Props) => (
  <Box
    sx={{
      backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, rgba(0, 0, 0, 0) ${dotSize}px)`,
      backgroundSize: `${gap}px ${gap}px`,
      width: '100%',
      height: '100%',
      ...sx
    }}
  >
    {children}
  </Box>
)
