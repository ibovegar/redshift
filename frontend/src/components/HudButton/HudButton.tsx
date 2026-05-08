import { Button, type ButtonProps } from '@mui/material'
import { BarButton } from 'components/BarButton/BarButton'

interface HudButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  id?: string
  onClick?: ButtonProps['onClick']
  disabled?: boolean
}

export const HudButton = ({ children, variant = 'primary', id, onClick, disabled }: HudButtonProps) => (
  <BarButton color={variant}>
    <Button
      id={id}
      onClick={onClick}
      disabled={disabled}
      disableRipple
      variant="contained"
      color="primary"
      size="small"
      sx={{
        px: 4,
        backgroundColor: variant === 'primary' ? '#fff' : 'primary.main',
        color: variant === 'primary' ? '#000' : '#fff',
        position: 'relative',
        zIndex: 2,
        boxShadow: 'none',
        border: 'none',
        clipPath: 'none',
        lineHeight: 1,
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fff',
          boxShadow: 'none'
        },
        '&.Mui-disabled': {
          backgroundColor: '#555',
          color: '#999',
          opacity: 0.5
        }
      }}
    >
      {children}
    </Button>
  </BarButton>
)
