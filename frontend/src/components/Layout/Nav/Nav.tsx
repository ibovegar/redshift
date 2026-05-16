import { Button, Grid, Typography } from '@mui/material'
import { BarButton } from '../../BarButton/BarButton'
import { StyledIcon, buttonSx } from './constants'
import { NavBarButton } from './NavBarButton/NavBarButton'

export const Nav = () => {
  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={4}>
      <Grid>
        <Typography variant="overline">MENU</Typography>
      </Grid>
      <NavBarButton to="/tactical" label="TACTICAL" />
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
