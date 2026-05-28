import { Box, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'

// Size of the clipped bottom-left corner, in px.
export const NOTCH_SIZE = 14

// HUD surface with a clipped bottom-left corner — shared by the Station Layout grid cells and the
// storage-section cards. The caller supplies the surface (bgcolor, border, size) via `sx`; this
// only owns the notch shape so the clip-path isn't duplicated across components.
export const NotchPanel = ({ children, sx }: { children?: ReactNode; sx?: SxProps<Theme> }) => (
  <Box
    sx={
      [
        { clipPath: `polygon(0 0, 100% 0, 100% 100%, ${NOTCH_SIZE}px 100%, 0 calc(100% - ${NOTCH_SIZE}px))` },
        sx
      ] as SxProps<Theme>
    }
  >
    {children}
  </Box>
)
