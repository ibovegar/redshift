import { Typography } from '@mui/material'
import { WarningBanner } from '../WarningBanner/WarningBanner'

interface SolarWarningProps {
  countdown: number
}

export const SolarWarning = ({ countdown }: SolarWarningProps) => {
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
      <Typography variant="hud-alarm">SOLAR EVENT INCOMING</Typography>
      <Typography variant="hud-alarm" sx={{ fontSize: 26 }}>{timeStr}</Typography>
    </WarningBanner>
  )
}
