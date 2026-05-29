import { Box, Stack, Typography } from '@mui/material'
import { FillBar } from 'components/FillBar/FillBar'
import { NotchPanel } from 'components/NotchPanel/NotchPanel'
import { MATERIAL_SYMBOLS } from 'data/materials'
import type { StorageSectionData } from '../allocate'

interface Props {
  data: StorageSectionData
}

export const StorageSection = ({ data }: Props) => {
  const pct = data.capacity > 0 ? Math.round((data.used / data.capacity) * 100) : 0
  const stored = data.items.filter((item) => item.amount > 0)

  return (
    <NotchPanel
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'hud.surfaceDeep',
        borderColor: 'hud.borderSubtle',
        p: 4
      }}
    >
      <Typography variant="hud-heading" sx={{ color: 'common.white' }}>
        {data.title}
      </Typography>
      <Typography variant="hud-data" sx={{ color: 'hud.textBrightSoft', mt: 0.75 }}>
        {data.used} / {data.capacity} ({pct}%)
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, mt: 2.5, minHeight: 180 }}>
        <FillBar pct={pct} />
        <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
          {stored.length === 0 ? (
            <Typography variant="hud-data" sx={{ color: 'hud.textBrightDim' }}>
              Empty
            </Typography>
          ) : (
            stored.map((item) => (
              <Box
                key={item.material}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.6,
                  borderBottom: '1px solid',
                  borderColor: 'hud.borderFaint'
                }}
              >
                <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
                  {MATERIAL_SYMBOLS[item.material]}
                </Typography>
                <Typography variant="hud-data" sx={{ color: 'common.white' }}>
                  {item.amount}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </NotchPanel>
  )
}
