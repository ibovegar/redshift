import { WarningRounded } from '@mui/icons-material'
import { Box, Typography, type TypographyProps } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { SolarEventPhase } from 'containers/Tactical/TacticalBackground/SolarEvent'
import type { ReactNode } from 'react'

interface RadiationWarningProps {
  phase: SolarEventPhase
  countdown: number
}

interface WarningBannerProps {
  color: 'warning.main' | 'error.main'
  animation: string
  sx?: SxProps<Theme>
  children: ReactNode
}

const WarningBanner = ({ color, animation, sx, children }: WarningBannerProps) => (
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

const BannerText = ({ sx, ...props }: TypographyProps) => (
  <Typography sx={{ fontWeight: 700, color: 'common.black', ...sx }} {...props} />
)

const SolarWarning = ({ countdown }: { countdown: number }) => {
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const timeStr = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`

  return (
    <WarningBanner
      key={countdown}
      color="warning.main"
      animation="warning-flash 0.3s ease-out"
      sx={{
        '@keyframes warning-flash': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.3 },
          '100%': { opacity: 1 }
        }
      }}
    >
      <BannerText sx={{ fontSize: 16 }}>SOLAR EVENT INCOMING</BannerText>
      <BannerText sx={{ fontSize: 26 }}>{timeStr}</BannerText>
    </WarningBanner>
  )
}

const RadiationActive = () => (
  <WarningBanner
    color="error.main"
    animation="radiation-pulse 0.5s ease-in-out infinite"
    sx={{
      '@keyframes radiation-pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.6 }
      }
    }}
  >
    <BannerText sx={{ fontSize: 18 }}>RADIATION ACTIVE</BannerText>
    <BannerText sx={{ fontSize: 14 }}>SEEK SPACEDOCK IMMEDIATELY</BannerText>
  </WarningBanner>
)

export const RadiationWarning = ({ phase, countdown }: RadiationWarningProps) => {
  if (phase === 'warning') return <SolarWarning countdown={countdown} />
  if (phase === 'active' || phase === 'cooldown') return <RadiationActive />
  return null
}
