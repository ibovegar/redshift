import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_ICONS, MATERIAL_NAMES } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType } from 'models/station-section'
import { SECTION_COSTS, SECTION_DESCRIPTIONS, SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import { canAfford, heldAmount } from '../../utils'

interface Props {
  type: SectionType
  storage: CargoItem[]
  isPending: boolean
  onBuild: () => void
  onClose: () => void
}

export const ModuleDetail = ({ type, storage, isPending, onBuild, onClose }: Props) => {
  const costs = SECTION_COSTS[type]
  const costEntries = Object.entries(costs) as [string, number][]
  const affordable = canAfford(costs, storage)
  const image = SECTION_IMAGES[type]
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          position: 'relative',
          height: 280,
          bgcolor: 'hud.surface',
          borderBottom: '1px solid',
          borderColor: 'hud.borderSubtle',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {image ? (
          <Box component="img" src={image} alt="" sx={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
        ) : (
          <ImageIcon sx={{ fontSize: 96, color: 'hud.textBrightDim' }} />
        )}
      </Box>

      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h5" sx={{ color: 'inherit' }}>
            {SECTION_NAMES[type]}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'hud.textBrightSoft' }} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography sx={{ color: 'hud.textBrightSoft', fontSize: 14, lineHeight: 1.6 }}>
          {SECTION_DESCRIPTIONS[type]}
        </Typography>

        {costEntries.length > 0 && (
          <Box>
            <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
              Cost
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {costEntries.map(([material, required]) => {
                const mat = material as AsteroidMaterial
                const held = heldAmount(storage, mat)
                const met = held >= (required ?? 0)
                return <CostRow key={material} material={mat} held={held} required={required} met={met} />
              })}
            </Stack>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <HudButton onClick={onBuild} disabled={!affordable || isPending}>
            Build Module
          </HudButton>
        </Box>
      </Box>
    </Box>
  )
}

const CostRow = ({
  material,
  held,
  required,
  met
}: {
  material: AsteroidMaterial
  held: number
  required: number
  met: boolean
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2,
      py: 1.5,
      bgcolor: 'hud.surface',
      border: '1px solid',
      borderColor: 'hud.borderSubtle'
    }}
  >
    <Box
      component="img"
      src={MATERIAL_ICONS[material]}
      alt=""
      sx={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
    />
    <Typography sx={{ flex: 1, fontSize: 14, color: 'inherit' }}>{MATERIAL_NAMES[material]}</Typography>
    <Typography
      sx={{
        fontSize: 14,
        fontVariantNumeric: 'tabular-nums',
        color: met ? 'hud.success' : 'hud.error'
      }}
    >
      {held} / {required}
    </Typography>
  </Box>
)
