import { Grid } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'

export const Nav = () => {
  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={2}>
      {/* <Grid>
        <Typography variant="overline">MENU</Typography>
      </Grid> */}
      {/* <NavBarButton to="/tactical" label="TACTICAL" /> */}
      <HudButton variant="secondary">HOME</HudButton>
      <HudButton variant="primary">WIKI</HudButton>
    </Grid>
  )
}
