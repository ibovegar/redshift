import AddBoxIcon from '@mui/icons-material/AddBox'
import { Button, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { NavLink, useMatch } from 'react-router'
import { BarButton } from '../../BarButton/BarButton'

const StyledIcon = styled(AddBoxIcon)(({ theme }) => ({
  marginRight: theme.spacing(2)
}))

const buttonSx = {
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
} as const

const NavBarButton = ({ to, label }: { to: string; label: string }) => {
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

export const Nav = () => {
  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={4}>
      <Grid>
        <Typography variant="overline">MENU</Typography>
      </Grid>
      <NavBarButton to="/tactical" label="TACTICAL" />
      <NavBarButton to="/engineering" label="ENGINEERING" />
      <NavBarButton to="/marketplace" label="STORE" />
      <Grid>
        <BarButton>
          <Button sx={buttonSx} variant="contained" size="small" disabled>
            <StyledIcon fontSize="small" />
            RESEARCH
          </Button>
        </BarButton>
      </Grid>
      <Grid>
        <BarButton>
          <Button sx={buttonSx} variant="contained" size="small" disabled>
            <StyledIcon fontSize="small" />
            GALAXY
          </Button>
        </BarButton>
      </Grid>
    </Grid>
  )
}
