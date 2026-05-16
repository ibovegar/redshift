import { WarningRounded } from '@mui/icons-material'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

export interface WarningBannerProps {
  color: 'warning.main' | 'error.main'
  animation: string
  sx?: SxProps<Theme>
  children: ReactNode
}

export const WarningBanner = ({ color, animation, sx, children }: WarningBannerProps) => (
  <Box
    sx={{
      position: 'fixed',
      top: 120,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      pointerEvents: 'none',
      animation,
      backgroundColor: color,
      borderRadius: 1,
      display: 'inline-flex',
      alignItems: 'stretch',
      ...sx
    }}
  >
    <Box sx={{ textAlign: 'left', flex: 1, alignContent: 'center', pl: 6, pr: 7 }}>{children}</Box>
    <Box
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      <WarningRounded sx={{ fontSize: 56, color: 'common.black', opacity: 0.8 }} />
    </Box>
  </Box>
)
