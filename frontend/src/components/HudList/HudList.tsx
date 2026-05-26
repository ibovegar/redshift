import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export interface HudListItem {
  label: string
  value: ReactNode
  /** Optional override for the value's colour. Accepts a theme path like 'hud.success'. */
  valueColor?: string
}

interface Props {
  items: HudListItem[]
}

// Stacked label/value rows separated by a thin border — used in InfoPanel-style stat sheets.
// Rows have symmetric vertical padding and the bottom border is suppressed on the last row
// so the dividers sit visually centred between adjacent rows.
export const HudList = ({ items }: Props) => (
  <Stack spacing={1} sx={{ mt: 1 }}>
    {items.map((item) => (
      <Box
        key={item.label}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 2,
          pb: 2.6,
          borderBottom: '1px solid',
          borderColor: 'hud.borderFaint'
          //   '&:last-of-type': { borderBottom: 'none' }
        }}
      >
        <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
          {item.label}
        </Typography>
        <Typography variant="hud-data" sx={{ color: item.valueColor ?? 'common.white', textAlign: 'right' }}>
          {item.value}
        </Typography>
      </Box>
    ))}
  </Stack>
)
