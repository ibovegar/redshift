import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_ICONS, MATERIAL_NAMES } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { Blueprint } from 'models/blueprint'
import type { ResearchStatus } from '../../utils'
import { getBlueprintImage } from '../ResearchCard/ResearchCard'

interface Props {
  blueprint: Blueprint
  status: ResearchStatus
  onResearch: () => void
  onClose: () => void
}

const STATUS_LABEL: Record<ResearchStatus, string> = {
  researched: 'Researched',
  'in-progress': 'In progress',
  available: 'Available',
  locked: 'Locked'
}

// Mirrors the status palette in ResearchCard's status corner so the modal badge and the card
// tile agree at a glance. Driven through theme tokens rather than per-component constants.
const STATUS_COLOR_TOKEN: Record<ResearchStatus, string> = {
  researched: 'hud.statusResearched',
  'in-progress': 'hud.statusInProgress',
  available: 'hud.statusAvailable',
  locked: 'hud.statusLocked'
}

export const BlueprintDetail = ({ blueprint, status, onResearch, onClose }: Props) => {
  const costEntries = Object.entries(blueprint.cost) as [string, number][]
  const image = getBlueprintImage(blueprint)
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
          <Box>
            <Typography variant="hud-tag" sx={{ color: STATUS_COLOR_TOKEN[status], fontSize: 11, letterSpacing: 1 }}>
              {STATUS_LABEL[status]}
            </Typography>
            <Typography variant="h5" sx={{ color: 'inherit', mt: 0.5 }}>
              {blueprint.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'hud.textBrightSoft' }} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography sx={{ color: 'hud.textBrightSoft', fontSize: 14, lineHeight: 1.6 }}>
          {blueprint.description}
        </Typography>

        {costEntries.length > 0 && (
          <Box>
            <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
              Cost
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {costEntries.map(([material, amount]) => (
                <CostRow key={material} material={material as AsteroidMaterial} amount={amount} />
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <HudButton onClick={onResearch} disabled={status !== 'available'}>
            Start Research
          </HudButton>
        </Box>
      </Box>
    </Box>
  )
}

const CostRow = ({ material, amount }: { material: AsteroidMaterial; amount: number }) => (
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
    <Typography sx={{ fontSize: 14, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}>{amount}</Typography>
  </Box>
)
