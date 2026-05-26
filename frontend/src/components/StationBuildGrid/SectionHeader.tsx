import { Box, type SxProps, type Theme, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export const SectionHeader = ({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) => (
  <Box sx={[{ mb: 3 }, sx] as SxProps<Theme>}>
    <Typography
      variant="hud-tag"
      sx={{ color: 'common.white', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}
    >
      {children}
    </Typography>
  </Box>
)
