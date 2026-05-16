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
      backgroundColor: 'rgba(255, 255, 255, 0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      px: 3
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: '#000'
      }}
    >
      Blueprint Required
    </Typography>
    {blueprint && (
      <Typography sx={{ fontSize: 14, color: '#000', textAlign: 'center', lineHeight: 1.6, fontWeight: 500 }}>
        Build the{' '}
        <Box component="span" sx={{ color: '#000', fontWeight: 700 }}>
          {SECTION_NAMES[blueprint]}
        </Box>
        {' '}to unlock this module
      </Typography>
    )}
  </Box>
)
