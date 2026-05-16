import { Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface LabelProps {
  children: ReactNode
}

export const Label = ({ children }: LabelProps) => (
  <Typography variant="hud-tag" sx={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
    {children}
  </Typography>
)
