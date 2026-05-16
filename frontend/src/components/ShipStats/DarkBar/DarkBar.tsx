import { Box } from '@mui/material'

interface DarkBarProps {
  value: number
  color?: string
}

export const DarkBar = ({ value, color = '#1e88e5' }: DarkBarProps) => (
  <Box sx={{ position: 'relative', height: 3, bgcolor: 'rgba(255,255,255,0.08)', width: '100%' }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${Math.min(100, Math.max(0, value))}%`,
        bgcolor: color,
        boxShadow: `0 0 6px ${color}80`,
        transition: 'width 0.3s ease',
      }}
    />
  </Box>
)
