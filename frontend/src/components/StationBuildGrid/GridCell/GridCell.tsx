import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import type { SectionStatus, SectionType } from 'models/station-section'

export const CELL = 160

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 1px currentColor, 0 0 14px currentColor; }
  50%       { box-shadow: 0 0 0 1px currentColor, 0 0 32px currentColor; }
`

const scanline = keyframes`
  0%   { top: -35%; opacity: 0.7; }
  100% { top: 100%;  opacity: 0; }
`

const NOTCH = 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))'

export const HIGHLIGHT = '#6699bb'

interface GridCellProps {
  type?: SectionType
  status?: SectionStatus
  selected?: boolean
  unavailable?: boolean
}

const Corners = ({ size = 16 }: { size?: number }) => (
  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', top: 3, left: 3, width: size, height: size,
      borderTop: '1.5px solid currentColor', borderLeft: '1.5px solid currentColor' }} />
    <Box sx={{ position: 'absolute', top: 3, right: 3, width: size, height: size,
      borderTop: '1.5px solid currentColor', borderRight: '1.5px solid currentColor' }} />
    <Box sx={{ position: 'absolute', bottom: 3, left: 3, width: size, height: size,
      borderBottom: '1.5px solid currentColor', borderLeft: '1.5px solid currentColor' }} />
    <Box sx={{ position: 'absolute', bottom: 3, right: 3, width: size, height: size,
      borderBottom: '1.5px solid currentColor', borderRight: '1.5px solid currentColor' }} />
  </Box>
)

export const GridCell = ({ type, status, selected, unavailable }: GridCellProps) => {
  // ── Empty cell — transparent with notched outline ───────────────────────────
  if (!type) {
    return (
      <Box sx={{ width: CELL, height: CELL, position: 'relative' }}>
        <svg width={CELL} height={CELL} style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <polygon
            points={`0.5,0.5 ${CELL - 0.5},0.5 ${CELL - 0.5},${CELL - 0.5} 14,${CELL - 0.5} 0.5,${CELL - 14}`}
            fill="none"
            stroke="rgba(65,70,73,0.3)"
            strokeWidth="1"
            strokeDasharray="6 4"
          />
        </svg>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 3, height: 3, borderRadius: '50%',
          bgcolor: 'rgba(65,70,73,0.4)',
        }} />
      </Box>
    )
  }

  const img = (
    <Box
      component="img"
      src={SECTION_IMAGES[type]}
      alt=""
      sx={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  )

  const nameLabel = (textColor = '#FEFEFE', opacity = 1) => (
    <Box sx={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
      pt: 5, pb: 1, px: 1,
    }}>
      <Typography sx={{
        fontSize: 11, color: textColor, fontFamily: 'monospace',
        letterSpacing: 1, textTransform: 'uppercase',
        lineHeight: 1, textAlign: 'center', opacity,
      }}>
        {SECTION_NAMES[type]}
      </Typography>
    </Box>
  )

  // ── Unavailable — striped placeholder ───────────────────────────────────────
  if (unavailable) {
    return (
      <Box sx={{
        width: CELL, height: CELL, position: 'relative', overflow: 'hidden', clipPath: NOTCH,
        bgcolor: 'rgba(112,125,126,0.25)',
        backgroundImage:
          'repeating-linear-gradient(45deg, transparent 0 8px, rgba(65,70,73,0.18) 8px 16px)',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{
            fontSize: 11, fontFamily: 'monospace', letterSpacing: 2,
            textTransform: 'uppercase', color: 'rgba(65,70,73,0.7)',
            px: 1, py: 0.5, bgcolor: 'rgba(193,198,193,0.85)',
          }}>
            Unavailable
          </Typography>
        </Box>
      </Box>
    )
  }

  // ── Locked ──────────────────────────────────────────────────────────────────
  if (status === 'locked') {
    return (
      <Box sx={{ width: CELL, height: CELL, position: 'relative', overflow: 'hidden', clipPath: NOTCH }}>
        <Box sx={{ position: 'absolute', inset: -6, filter: 'blur(4px)' }}>
          {img}
        </Box>
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <LockOutlinedIcon sx={{ fontSize: 32, color: '#A3A9A8' }} />
          {nameLabel('#A3A9A8')}
        </Box>
      </Box>
    )
  }

  // ── Operational ─────────────────────────────────────────────────────────────
  if (status === 'operational') {
    return (
      <Box sx={{ width: CELL, height: CELL, position: 'relative', overflow: 'hidden', clipPath: NOTCH, color: HIGHLIGHT }}>
        <Corners />
        <Box sx={{ position: 'absolute', inset: 0, filter: 'brightness(0.88)' }}>{img}</Box>
        <Box sx={{
          position: 'absolute', top: 10, right: 10,
          width: 9, height: 9, borderRadius: '50%',
          bgcolor: '#66bb6a', boxShadow: '0 0 9px #66bb6a',
        }} />
        {nameLabel()}
      </Box>
    )
  }

  // ── Available — selected (placement preview) ────────────────────────────────
  if (selected) {
    return (
      <Box sx={{
        width: CELL, height: CELL, position: 'relative', overflow: 'hidden',
        clipPath: NOTCH, color: HIGHLIGHT,
        animation: `${pulse} 1.2s ease-in-out infinite`,
      }}>
        <Corners />
        <Box sx={{ position: 'absolute', inset: 0, filter: 'brightness(0.65)' }}>{img}</Box>
        <Box sx={{
          position: 'absolute', left: 0, right: 0, height: '40%',
          background: `linear-gradient(to bottom, transparent, ${HIGHLIGHT}30, transparent)`,
          animation: `${scanline} 1.5s linear infinite`,
          pointerEvents: 'none',
        }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: HIGHLIGHT }} />
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 0.5, zIndex: 1,
        }}>
          <Typography sx={{
            fontSize: 14, color: HIGHLIGHT, fontFamily: 'monospace', letterSpacing: 3,
            textTransform: 'uppercase', textShadow: `0 0 12px ${HIGHLIGHT}`,
          }}>
            BUILD
          </Typography>
          <Typography sx={{
            fontSize: 9, color: `${HIGHLIGHT}99`, fontFamily: 'monospace',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            SITE
          </Typography>
        </Box>
      </Box>
    )
  }

  // ── Available — disabled (requirements not met) ─────────────────────────────
  return (
    <Box sx={{ width: CELL, height: CELL, position: 'relative', overflow: 'hidden', clipPath: NOTCH }}>
      <Box sx={{ position: 'absolute', inset: 0, filter: 'brightness(0.5) saturate(0) grayscale(1)' }}>
        {img}
      </Box>
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(65,70,73,0.3)' }} />
      {nameLabel('rgba(254,254,254,0.5)')}
    </Box>
  )
}
