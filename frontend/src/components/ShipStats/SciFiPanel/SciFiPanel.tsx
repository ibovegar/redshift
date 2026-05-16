import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ACCENT, CORNER, COL_WIDTH, PANEL_BG, PANEL_BORDER, CRITICAL_BG } from '../constants'

interface SciFiPanelProps {
  title: string
  children: ReactNode
  accent?: boolean
}

export const SciFiPanel = ({ title, children, accent = false }: SciFiPanelProps) => (
  <Box
    sx={{
      position: 'relative',
      width: COL_WIDTH,
      bgcolor: accent ? CRITICAL_BG : PANEL_BG,
      p: 6,
      boxShadow: accent
        ? `0 0 32px rgba(33,150,243,0.45), inset 0 0 24px rgba(33,150,243,0.06)`
        : `0 0 14px rgba(33,150,243,0.1)`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -1,
        left: -1,
        width: CORNER,
        height: CORNER,
        borderTop: `2px solid ${ACCENT}`,
        borderLeft: `2px solid ${ACCENT}`,
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: CORNER,
        height: CORNER,
        borderBottom: `2px solid ${ACCENT}`,
        borderRight: `2px solid ${ACCENT}`,
        pointerEvents: 'none',
      },
    }}
  >
    <Box
      sx={{
        pb: 1,
        mb: 1.5,
        borderBottom: `1px solid ${accent ? 'rgba(255,255,255,0.15)' : PANEL_BORDER}`,
      }}
    >
      <Typography
        variant="hud-tag"
        sx={{ color: accent ? 'rgba(255,255,255,0.55)' : ACCENT, fontFamily: 'monospace' }}
      >
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
)
