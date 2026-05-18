import { Box, Divider, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_ICONS, MATERIAL_NAMES, MATERIAL_SYMBOLS } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus, SectionType } from 'models/station-section'
import { SECTION_BLUEPRINT, SECTION_COSTS, SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../SectionHeader'
import { canAfford, heldAmount } from '../utils'

const ALL_MATERIALS = Object.keys(MATERIAL_NAMES) as AsteroidMaterial[]

interface Props {
  type: SectionType
  status: SectionStatus
  storage: CargoItem[]
  isPending: boolean
  onBuild: () => void
}

export const InfoPanel = ({ type, status, storage, isPending, onBuild }: Props) => {
  const costs = SECTION_COSTS[type]
  const blueprint = SECTION_BLUEPRINT[type]
  const affordable = canAfford(costs, storage)
  const hasCosts = Object.keys(costs).length > 0

  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300 }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>

      <Typography variant="hud-body" sx={{ color: 'hud.text', lineHeight: 1.6, mb: 2.5 }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>

      {blueprint && (
        <Typography variant="hud-data" sx={{ color: 'hud.textMuted', letterSpacing: 0.5, mb: 2 }}>
          REQUIRES: {SECTION_NAMES[blueprint]}
        </Typography>
      )}

      {hasCosts && (
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          {Object.entries(costs).map(([mat, required]) => {
            const material = mat as AsteroidMaterial
            const held = heldAmount(storage, material)
            const met = held >= (required ?? 0)
            return (
              <Box key={material} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="img"
                  src={MATERIAL_ICONS[material]}
                  alt={material}
                  sx={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    flexShrink: 0,
                    filter: met ? 'none' : 'grayscale(0.5) brightness(1.2)'
                  }}
                />
                <Typography variant="hud-data" sx={{ flex: 1, color: 'hud.textMuted' }}>
                  {MATERIAL_SYMBOLS[material]}
                </Typography>
                <Typography variant="hud-data" sx={{ color: met ? 'hud.success' : 'hud.error' }}>
                  {held} / {required}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      )}

      {status === 'available' && (
        <HudButton variant="secondary" disabled={!affordable || isPending} onClick={onBuild}>
          Build Module
        </HudButton>
      )}

      <Divider sx={{ my: 3, borderColor: 'hud.textBorder' }} />

      <SectionHeader>Resources</SectionHeader>

      <Stack spacing={0}>
        {ALL_MATERIALS.map((material) => {
          const amount = heldAmount(storage, material)
          const empty = amount === 0
          return (
            <Box key={material} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box
                component="img"
                src={MATERIAL_ICONS[material]}
                alt={material}
                sx={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="hud-data" sx={{ flex: 1, color: 'hud.text' }}>
                {MATERIAL_NAMES[material]}
              </Typography>
              <Typography variant="hud-data" sx={{ color: empty ? 'hud.textFaint' : 'hud.text' }}>
                {amount}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
