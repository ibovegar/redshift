import CircleIcon from '@mui/icons-material/Circle'
import { Box, Typography } from '@mui/material'
import type { SectionType } from 'models/station-section'
import { SECTION_ICONS, SECTION_NAMES } from 'models/station-section'

interface ModuleListItemProps {
  type: SectionType
  selected: boolean
  /** Overrides the default `SECTION_NAMES[type]` label — used to suffix the Engineering Bay entry
   *  with its current upgrade level (e.g. "Engineering Bay LVL 3"). */
  label?: string
  onSelect: () => void
}

export const ModuleListItem = ({ type, selected, label, onSelect }: ModuleListItemProps) => (
  <Box
    onClick={onSelect}
    sx={{
      bgcolor: selected ? 'hud.listActive' : 'hud.listRest',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      cursor: 'pointer',
      '&:hover': !selected ? { bgcolor: 'hud.listHover' } : undefined
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
            opacity: selected ? 1 : 0.65,
            filter: 'invert(1)'
          }}
        />
      </Box>

      <Box sx={{ flex: 1, px: 1.5, py: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="hud-heading" sx={{ color: 'common.white' }}>
          {label ?? SECTION_NAMES[type]}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.75,
            color: 'hud.success'
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
