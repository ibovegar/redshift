import { Box, Paper } from '@mui/material'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'

type HudCardSize = 'small' | 'medium' | 'large'

const SIZE_CONFIG: Record<HudCardSize, { minWidth: string | number; padding: string }> = {
  small: { minWidth: '200px', padding: '14px 18px' },
  medium: { minWidth: '260px', padding: '20px 24px' },
  large: { minWidth: '380px', padding: '28px 32px' }
}

interface HudCardProps {
  children: ReactNode
  visible?: boolean
  interactive?: boolean
  size?: HudCardSize
  minWidth?: string | number
}

export const HudCard = forwardRef<HTMLDivElement, HudCardProps>(
  ({ children, visible = true, interactive = false, size = 'medium', minWidth }, ref) => {
    const config = SIZE_CONFIG[size]

    return (
      <Box
        ref={ref}
        sx={{
          opacity: visible ? 1 : 0,
          pointerEvents: interactive ? 'auto' : 'none',
          transition: 'opacity 0.4s'
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: '2px',
            p: config.padding,
            fontFamily: 'monospace',
            color: '#111',
            minWidth: minWidth ?? config.minWidth,
            bgcolor: '#ffffff'
          }}
        >
          {children}
        </Paper>
      </Box>
    )
  }
)
