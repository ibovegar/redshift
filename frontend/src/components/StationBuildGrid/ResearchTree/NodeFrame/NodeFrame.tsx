import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { FRAME_BORDER_COLOR, FRAME_LABEL_COLOR } from '../constants'

interface NodeFrameProps {
  label: string
  width: number
  height: number
  /** When true, draws a 1px border around the frame's content box (the area below the label). */
  bordered?: boolean
  children: ReactNode
}

export const NodeFrame = ({ label, width, height, bordered, children }: NodeFrameProps) => {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: bordered ? `1px solid ${FRAME_BORDER_COLOR}` : undefined
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
