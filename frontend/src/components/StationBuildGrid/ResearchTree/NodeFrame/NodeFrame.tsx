import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { FRAME_LABEL_COLOR } from '../constants'

interface NodeFrameProps {
  label: string
  width: number
  height: number
  children: ReactNode
}

export const NodeFrame = ({ label, width, height, children }: NodeFrameProps) => {
  return (
    <Box sx={{ position: 'relative', width, height }}>
      <Typography
        variant="hud-tag"
        sx={{
          fontSize: 9,
          letterSpacing: 0.6,
          color: FRAME_LABEL_COLOR,
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          //   border: `1px solid ${FRAME_BORDER_COLOR}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
