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
  const color = met ? '#66bb6a' : '#ef5350'
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={image}
        alt=""
        sx={{
          width: 24,
          height: 24,
          objectFit: 'contain',
          borderRadius: '4px',
          flexShrink: 0,
          filter: met ? 'none' : 'grayscale(0.6) brightness(0.6)'
        }}
      />
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.4, flex: 1, fontFamily: 'monospace' }}>
        {label}
      </Typography>
      <Icon sx={{ fontSize: 16, color, flexShrink: 0 }} />
    </Box>
  )
}
