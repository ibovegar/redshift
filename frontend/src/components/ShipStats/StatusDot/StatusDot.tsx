import { Box } from '@mui/material'
import { keyframes } from '@mui/material/styles'

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
`

interface StatusDotProps {
  color: string
}

export const StatusDot = ({ color }: StatusDotProps) => (
  <Box
    sx={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      bgcolor: color,
      boxShadow: `0 0 6px ${color}`,
      flexShrink: 0,
      animation: `${pulse} 2s ease-in-out infinite`,
    }}
  />
)
