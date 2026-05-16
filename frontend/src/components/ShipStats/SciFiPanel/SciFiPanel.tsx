import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface SciFiPanelProps {
  title: string
  children: ReactNode
  accent?: boolean
}

export const SciFiPanel = ({ title, children, accent = false }: SciFiPanelProps) => (
  <Box
    sx={{
      position: 'relative',
      width: 300,
      bgcolor: accent ? '#0d2d6b' : '#040b18',
      p: 6,
      boxShadow: accent
        ? `0 0 32px rgba(33,150,243,0.45), inset 0 0 24px rgba(33,150,243,0.06)`
        : `0 0 14px rgba(33,150,243,0.1)`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -1,
        left: -1,
        width: 10,
        height: 10,
        borderTop: '2px solid #42a5f5',
        borderLeft: '2px solid #42a5f5',
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 10,
        height: 10,
        borderBottom: '2px solid #42a5f5',
        borderRight: '2px solid #42a5f5',
        pointerEvents: 'none',
      },
    }}
  >
    <Box
      sx={{
        pb: 1,
        mb: 1.5,
        borderBottom: `1px solid ${accent ? 'rgba(255,255,255,0.15)' : 'rgba(33,150,243,0.35)'}`,
      }}
    >
      <Typography
        variant="hud-tag"
        sx={{ color: accent ? 'rgba(255,255,255,0.55)' : '#42a5f5', fontFamily: 'monospace' }}
      >
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
)
