import { Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface ValueProps {
  children: ReactNode
  sx?: object
}

export const Value = ({ children, sx }: ValueProps) => (
  <Typography variant="hud-data" sx={{ color: '#fff', fontWeight: 700, ...sx }}>
    {children}
  </Typography>
)
