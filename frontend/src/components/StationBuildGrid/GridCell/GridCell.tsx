import AddIcon from '@mui/icons-material/Add'
import { Box, Typography } from '@mui/material'
import type { SectionStatus, SectionType } from 'models/station-section'
import { SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import { hudColors } from 'ui/theme/typography'

export const CELL = 160

const NOTCH = 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))'

interface GridCellProps {
  type?: SectionType
  status?: SectionStatus
  unavailable?: boolean
}

export const GridCell = ({ type, status, unavailable }: GridCellProps) => {

  // ── Empty cell — dashed outline with plus icon ──────────────────────────────
  if (!type) {
    return (
      <Box sx={{ width: CELL, height: CELL, position: 'relative' }}>
        <svg aria-hidden="true" width={CELL} height={CELL} style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <polygon
            points={`0.5,0.5 ${CELL - 0.5},0.5 ${CELL - 0.5},${CELL - 0.5} 14,${CELL - 0.5} 0.5,${CELL - 14}`}
            fill="none"
            stroke={hudColors.textBorder}
            strokeWidth="1"
            strokeDasharray="6 4"
          />
        </svg>
        <AddIcon
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            fontSize: 24,
            color: 'hud.textDim'
          }}
        />
      </Box>
    )
  }

  const img = (
    <Box
      component="img"
      src={SECTION_IMAGES[type]}
      alt=""
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  )

  // ── Unavailable — striped placeholder ───────────────────────────────────────
  if (unavailable) {
    return (
      <Box
        sx={{
          width: CELL,
          height: CELL,
          position: 'relative',
          overflow: 'hidden',
          clipPath: NOTCH,
          bgcolor: 'rgba(112,125,126,0.25)',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 10px, rgba(65,70,73,0.08) 10px 20px)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant="hud-label"
            sx={{
              fontFamily: 'monospace',
              color: 'hud.textMuted',
              px: 1,
              py: 0.5,
              bgcolor: 'rgba(193,198,193,0.85)'
            }}
          >
            Unavailable
          </Typography>
        </Box>
      </Box>
    )
  }

  // ── Online (operational) — full image with corner brackets ─────────────────
  if (status === 'operational') {
    return (
      <Box
        sx={{
          width: CELL,
          height: CELL,
          position: 'relative',
          overflow: 'hidden',
          clipPath: NOTCH,
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, filter: 'brightness(0.88)' }}>{img}</Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            pt: 2,
            pb: 2,
          }}
        >
          <Typography
            variant="hud-mono"
            sx={{ fontSize: 11, color: 'common.white', textTransform: 'uppercase', lineHeight: 1, textAlign: 'center' }}
          >
            {SECTION_NAMES[type]}
          </Typography>
        </Box>
      </Box>
    )
  }

  // ── Available — blueprint met, not yet built ────────────────────────────────
  return (
    <Box sx={{ width: CELL, height: CELL, position: 'relative', overflow: 'hidden', clipPath: NOTCH }}>
      <Box sx={{ position: 'absolute', inset: -8, opacity: 0.35, filter: 'blur(4px)' }}>{img}</Box>
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, pt: 5, pb: 1, px: 1 }}>
        <Typography
          variant="hud-mono"
          sx={{ fontSize: 11, color: 'common.black', textTransform: 'uppercase', lineHeight: 1, textAlign: 'center' }}
        >
          {SECTION_NAMES[type]}
        </Typography>
      </Box>
    </Box>
  )
}
