import { Button } from '@mui/material'
import { BarButton } from 'components/BarButton/BarButton'

const BUTTONS = [
  { label: 'Travel', id: 'travel-btn' },
  { label: 'Dock', id: 'dock-btn' },
  { label: 'Scan', id: 'scan-btn' },
  { label: 'Mining', id: 'mining-btn' }
]

export const ShipMenu = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: '1px dashed #ffffff',
        padding: '20px'
      }}
    >
      {BUTTONS.map(({ label, id }) => (
        <BarButton key={label}>
          <Button
            id={id}
            sx={{
              px: 4,
              backgroundColor: '#fff',
              color: '#000',
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
            color="primary"
            variant="contained"
            size="small"
            disableRipple
          >
            {label}
          </Button>
        </BarButton>
      ))}
    </div>
  )
}
