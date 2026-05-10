import { LinearProgress } from '@mui/material'
import { forwardRef } from 'react'

export const FuelBar = forwardRef<HTMLDivElement>(function FuelBar(_props, ref) {
  return (
    <div
      ref={ref}
      style={{
        display: 'none',
        position: 'fixed',
        transform: 'translateX(-50%)',
        zIndex: 15,
        pointerEvents: 'none',
        width: 80
      }}
    >
      <LinearProgress
        variant="determinate"
        color="primary"
        value={0}
        sx={{ '& .MuiLinearProgress-bar': { transition: 'transform 0.2s ease' } }}
      />
      <div
        data-fuel-text
        style={{
          fontSize: 10,
          color: '#aaddff',
          textAlign: 'center',
          marginTop: 2,
          textShadow: '0 0 4px rgba(0,0,0,0.8)'
        }}
      />
    </div>
  )
})
