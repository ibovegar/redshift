import AddBoxIcon from '@mui/icons-material/AddBox'
import { Button, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router'

const StyledIcon = styled(AddBoxIcon)(({ theme }) => ({
  marginRight: theme.spacing(4)
}))

const buttonSx = { px: 4 } as const

export const Nav = () => {
  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={4}>
      <Grid>
        <Typography variant="overline">MENU</Typography>
      </Grid>
      <Grid>
        <Button sx={buttonSx} color="primary" variant="contained" size="small" component={Link} to="/tactical">
          <StyledIcon fontSize="small" />
          TACTICAL
        </Button>
      </Grid>
      <Grid>
        <Button sx={buttonSx} color="primary" variant="contained" size="small" component={Link} to="/engineering">
          <StyledIcon fontSize="small" />
          ENGINEERING
        </Button>
      </Grid>
      <Grid>
        <Button sx={buttonSx} color="primary" variant="contained" size="small" component={Link} to="/marketplace">
          <StyledIcon fontSize="small" />
          STORE
        </Button>
      </Grid>
      <Grid>
        <Button sx={buttonSx} variant="contained" size="small" disabled>
          <StyledIcon fontSize="small" />
          SOMETHING
        </Button>
      </Grid>
      <Grid>
        <Button sx={buttonSx} variant="contained" size="small" disabled>
          <StyledIcon fontSize="small" />
          INVENTORY
        </Button>
      </Grid>
    </Grid>
  )
}
