import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Typography } from '@mui/material'

interface ReqRowProps {
  met: boolean
  label: string
  image: string
}

export const ReqRow = ({ met, label, image }: ReqRowProps) => {
  const Icon = met ? CheckCircleIcon : CancelOutlinedIcon
  const color = met ? '#2e7d32' : '#c62828'
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={image}
        alt=""
        sx={{
          width: 28,
          height: 28,
          objectFit: 'contain',
          borderRadius: '6px',
          flexShrink: 0,
          filter: met ? 'none' : 'grayscale(0.6) brightness(0.8)'
        }}
      />
      <Typography sx={{ color: '#111', fontSize: 12, lineHeight: 1.4, flex: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Icon sx={{ fontSize: 18, color, flexShrink: 0 }} />
    </Box>
  )
}
