import { Box, Stack, type SxProps, Typography } from '@mui/material'
import { MATERIAL_ICONS, MATERIAL_NAMES, RARITY_COLORS, RARITY_LABELS } from 'data'
import type { AsteroidMaterial, ResourceRarity } from 'models/asteroid'
import type { ReactNode } from 'react'

interface ResourceRowProps {
  material: AsteroidMaterial
  rarity: ResourceRarity
  detail?: string
  rightDetail?: ReactNode
  sx?: SxProps
}

export const ResourceRow = ({ material, rarity, detail, rightDetail, sx }: ResourceRowProps) => {
  const rarityColor = RARITY_COLORS[rarity]

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        bgcolor: '#fff',
        p: '8px 10px 8px 4px',
        borderRadius: '2px',
        gap: '20px',
        ...sx
      }}
    >
      <Box
        component="img"
        src={MATERIAL_ICONS[material]}
        alt={material}
        loading="lazy"
        sx={{ width: 52, height: 'auto', flexShrink: 0 }}
      />
      <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="hud-badge" sx={{ color: rarityColor }}>
          {RARITY_LABELS[rarity]}
        </Typography>
        <Typography variant="hud-body" sx={{ color: '#000', fontWeight: 700 }}>
          {MATERIAL_NAMES[material] ?? material}
        </Typography>
        {detail && (
          <Typography variant="hud-body" sx={{ color: 'rgba(0,0,0,0.7)' }}>
            {detail}
          </Typography>
        )}
      </Stack>
      {rightDetail && (
        <Typography variant="hud-data" sx={{ fontWeight: 700, color: '#000', flexShrink: 0, pr: 0.5 }}>
          {rightDetail}
        </Typography>
      )}
    </Stack>
  )
}
