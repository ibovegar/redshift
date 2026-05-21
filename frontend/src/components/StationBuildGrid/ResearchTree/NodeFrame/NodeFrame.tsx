import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { FRAME_BORDER_COLOR, FRAME_LABEL_COLOR, FRAME_LABEL_HEIGHT } from '../constants'

interface NodeFrameProps {
  label: string
  width: number
  height: number
  children: ReactNode
}

export const NodeFrame = ({ label, width, height, children }: NodeFrameProps) => {
  return (
    <Box sx={{ position: 'relative', width, height }}>
      {/* Label sits OUTSIDE the box, above it — EVE-ISIS style */}
      <Typography
        variant="hud-tag"
        sx={{
          position: 'absolute',
          top: 0,
          height: FRAME_LABEL_HEIGHT,
          lineHeight: `${FRAME_LABEL_HEIGHT}px`,
          fontSize: 9,
          letterSpacing: 0.6,
          color: FRAME_LABEL_COLOR,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          top: FRAME_LABEL_HEIGHT,
          left: 0,
          right: 0,
          bottom: 0,
          border: `1px solid ${FRAME_BORDER_COLOR}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
