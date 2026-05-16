import { Button, Grid } from '@mui/material'
import { NavLink, useMatch } from 'react-router'
import { BarButton } from 'components/BarButton/BarButton'
import { StyledIcon, buttonSx } from '../constants'

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
          sx={buttonSx}
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
