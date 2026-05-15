import { LinearProgress } from '@mui/material'
import { forwardRef } from 'react'

export const HudProgressBar = forwardRef<HTMLDivElement>(function HudProgressBar(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        display: 'none',
        position: 'fixed',
        transform: 'translateX(-50%)',
        zIndex: 15,
        pointerEvents: 'none',
        width: 110,
      }}
    >
      <div
        data-bar-label
        style={{
          fontSize: 9,
          color: '#88aaff',
          textAlign: 'center',
          marginBottom: 5,
          textShadow: '0 0 4px rgba(0,0,0,0.9)',
          fontFamily: 'monospace',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}
      />
      <LinearProgress
        variant="determinate"
        value={0}
        sx={{
          backgroundColor: 'rgba(0,0,0,0.45)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#4488ff',
            transition: 'transform 0.1s linear',
          },
        }}
      />
      <div
        data-bar-text
        style={{
          fontSize: 9,
          color: '#aaccff',
          textAlign: 'center',
          marginTop: 3,
          textShadow: '0 0 4px rgba(0,0,0,0.9)',
          fontFamily: 'monospace',
        }}
      />
    </div>
  )
})
