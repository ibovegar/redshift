import AddBoxIcon from '@mui/icons-material/AddBox'
import { Button, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { BarButton } from 'components/BarButton/BarButton'
import { NavLink, useMatch } from 'react-router'

const StyledIcon = styled(AddBoxIcon)(({ theme }) => ({
  marginRight: theme.spacing(2)
}))

interface NavBarButtonProps {
  to: string
  label: string
}

export const NavBarButton = ({ to, label }: NavBarButtonProps) => {
  const isActive = useMatch(`${to}/*`)

  return (
    <Grid>
      <BarButton active={!!isActive}>
        <Button
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
            '&.active': {
              backgroundColor: 'transparent',
              color: '#fff',
              boxShadow: 'none'
            }
          }}
          color="primary"
          variant="contained"
          size="small"
          component={NavLink}
          to={to}
          disableRipple
        >
          <StyledIcon fontSize="small" />
          {label}
        </Button>
      </BarButton>
    </Grid>
  )
}
