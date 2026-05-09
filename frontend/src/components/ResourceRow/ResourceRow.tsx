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
        sx={{ width: 52, height: 'auto', flexShrink: 0 }}
      />
      <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 8, color: rarityColor, fontWeight: 'bold', letterSpacing: 0.5 }}>
          {RARITY_LABELS[rarity]}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#000', fontWeight: 'bold' }}>
          {MATERIAL_NAMES[material] ?? material}
        </Typography>
        {detail && <Typography sx={{ fontSize: 11, color: 'rgba(0,0,0,0.7)' }}>{detail}</Typography>}
      </Stack>
      {rightDetail && (
        <Typography
          sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', color: '#000', flexShrink: 0, pr: 0.5 }}
        >
          {rightDetail}
        </Typography>
      )}
    </Stack>
  )
}
