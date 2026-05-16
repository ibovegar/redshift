import { Typography } from '@mui/material'
import { WarningBanner } from '../WarningBanner/WarningBanner'

export const RadiationActive = () => (
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
    <Typography variant="hud-alarm">RADIATION ACTIVE</Typography>
    <Typography variant="hud-alarm" sx={{ fontSize: 14 }}>SEEK SPACEDOCK IMMEDIATELY</Typography>
  </WarningBanner>
)
