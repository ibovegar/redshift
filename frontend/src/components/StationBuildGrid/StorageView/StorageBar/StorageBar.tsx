import { Box } from '@mui/material'
import { hudColors } from 'ui/theme/typography'

// Fullness-as-warning: plenty of free space reads green, filling up turns amber, near/at capacity
// turns red so the bar signals "running out of space".
const fillColor = (pct: number): string => {
  if (pct >= 90) return hudColors.error
  if (pct >= 70) return hudColors.statusAvailable
  return hudColors.success
}

interface Props {
  pct: number
}

export const StorageBar = ({ pct }: Props) => (
  <Box
    sx={{
      position: 'relative',
      width: 16,
      flexShrink: 0,
      alignSelf: 'stretch',
      borderRadius: 0.5,
      bgcolor: 'hud.overlayBlack',
      overflow: 'hidden'
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: `${Math.min(100, pct)}%`,
        bgcolor: fillColor(pct),
        transition: 'height 0.3s ease'
      }}
    />
  </Box>
)
