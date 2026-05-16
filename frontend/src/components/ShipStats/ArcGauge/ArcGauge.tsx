import { Box, Stack, Typography } from '@mui/material'
import { Label } from '../Label/Label'
import { StatusDot } from '../StatusDot/StatusDot'

interface ArcGaugeProps {
  value: number
  label: string
  color: string
}

export const ArcGauge = ({ value, label, color }: ArcGaugeProps) => {
  const radius = 42
  const stroke = 6
  const circumference = Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', width: 96, height: 58 }}>
        <svg width="96" height="58" viewBox="0 0 96 58" style={{ overflow: 'visible' }}>
          <path
            d={`M 6 54 A ${radius} ${radius} 0 0 1 90 54`}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M 6 54 A ${radius} ${radius} 0 0 1 90 54`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <Typography
          variant="hud-data-xl"
          sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', color: '#fff' }}
        >
          {value}
        </Typography>
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        <StatusDot color={color} />
        <Label>{label}</Label>
      </Stack>
    </Stack>
  )
}
