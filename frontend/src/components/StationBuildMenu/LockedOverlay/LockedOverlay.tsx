import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Typography } from '@mui/material'
import { SECTION_NAMES } from 'models/station-section'
import type { SectionType } from 'models/station-section'

interface LockedOverlayProps {
  blueprint: SectionType | null
}

export const LockedOverlay = ({ blueprint }: LockedOverlayProps) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(4,11,24,0.82)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      px: 4
    }}
  >
    <LockOutlinedIcon sx={{ fontSize: 28, color: 'rgba(66,165,245,0.4)' }} />
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'monospace'
      }}
    >
      Blueprint Required
    </Typography>
    {blueprint && (
      <Typography
        sx={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
          lineHeight: 1.6,
          fontFamily: 'monospace'
        }}
      >
        Build{' '}
        <Box component="span" sx={{ color: '#42a5f5' }}>
          {SECTION_NAMES[blueprint]}
        </Box>
        {' '}to unlock
      </Typography>
    )}
  </Box>
)
