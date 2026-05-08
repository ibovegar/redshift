import { LinearProgress, type LinearProgressProps } from '@mui/material'

interface ProgressBarProps {
  value: number
  color?: LinearProgressProps['color']
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

const SIZE_MAP = { small: 2, medium: 4, large: 6 }

export const ProgressBar = ({ value, color = 'primary', size = 'large', animated = false }: ProgressBarProps) => {
  return (
    <LinearProgress
      variant="determinate"
      color={color}
      value={value}
      sx={{
        width: '100%',
        height: SIZE_MAP[size],
        borderRadius: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        '& .MuiLinearProgress-bar': animated ? { transition: 'transform 0.1s linear' } : undefined
      }}
    />
  )
}
