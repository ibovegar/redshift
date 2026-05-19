import CircleIcon from '@mui/icons-material/Circle'
import { Box, Typography } from '@mui/material'
import type { SectionType } from 'models/station-section'
import { SECTION_ICONS, SECTION_NAMES } from 'models/station-section'

interface ModuleListItemProps {
  type: SectionType
  selected: boolean
  onSelect: () => void
}

export const ModuleListItem = ({ type, selected, onSelect }: ModuleListItemProps) => (
  <Box
    onClick={onSelect}
    sx={{
      bgcolor: selected ? 'hud.cardBgActive' : 'hud.cardBg',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      cursor: 'pointer',
      '&:hover': !selected ? { bgcolor: 'hud.cardBgHover' } : undefined
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
      <Box sx={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="img"
          src={SECTION_ICONS[type]}
          alt=""
          sx={{
            width: 48,
            height: 48,
            objectFit: 'contain',
            display: 'block',
            opacity: selected ? 1 : 0.7,
            filter: selected ? 'invert(1)' : 'none'
          }}
        />
      </Box>

      <Box sx={{ flex: 1, px: 1.5, py: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="hud-heading" sx={{ color: selected ? 'common.white' : 'hud.text' }}>
          {SECTION_NAMES[type]}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.75,
            color: selected ? 'rgba(255,255,255,0.75)' : 'hud.success'
          }}
        >
          <CircleIcon sx={{ fontSize: 10 }} />
          <Typography variant="hud-data" sx={{ color: 'inherit' }}>
            Online
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
)
