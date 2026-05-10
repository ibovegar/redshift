import { Box, LinearProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  progress: number
  loaded: boolean
}

export const LoadingScreen = (props: LoadingScreenProps) => {
  const { progress, loaded } = props

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => setVisible(false), 600)
    return () => clearTimeout(timer)
  }, [loaded])

  if (!visible) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        transition: 'opacity 0.5s ease',
        opacity: loaded ? 0 : 1,
        pointerEvents: loaded ? 'none' : 'auto'
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(140, 200, 255, 0.7)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          mb: 2,
          fontWeight: 300,
          fontSize: '0.7rem'
        }}
      >
        Loading systems
      </Typography>
      <Box sx={{ width: 240 }}>
        <LinearProgress
          variant="determinate"
          color="primary"
          value={progress * 100}
          sx={{
            height: 2,
            borderRadius: 0,
            '& .MuiLinearProgress-bar': {
              transition: 'transform 0.2s linear'
            }
          }}
        />
      </Box>
    </Box>
  )
}
