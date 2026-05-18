import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export const SectionHeader = ({ children }: { children: ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="hud-tag" sx={{ color: 'hud.text', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>
      {children}
    </Typography>
  </Box>
)
