import AddBoxIcon from '@mui/icons-material/AddBox'
import { Button, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { NavLink } from 'react-router'
import { BarButton } from '../../BarButton/BarButton'

const StyledIcon = styled(AddBoxIcon)(({ theme }) => ({
  marginRight: theme.spacing(4)
}))

const buttonSx = {
  px: 4,
  backgroundColor: '#fff',
  color: '#000',
  position: 'relative',
  zIndex: 2,
  '&:hover': {
    color: '#fff'
  },
  '&.active': {
    backgroundColor: 'red',
    color: '#fff'
  }
} as const

export const Nav = () => {
  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={4}>
      <Grid>
        <Typography variant="overline">MENU</Typography>
      </Grid>
      <Grid>
        <BarButton>
          <Button sx={buttonSx} color="primary" variant="contained" size="small" component={NavLink} to="/tactical">
            <StyledIcon fontSize="small" />
            TACTICAL
          </Button>
        </BarButton>
      </Grid>
      <Grid>
        <BarButton>
          <Button sx={buttonSx} color="primary" variant="contained" size="small" component={NavLink} to="/engineering">
            <StyledIcon fontSize="small" />
            ENGINEERING
          </Button>
        </BarButton>
      </Grid>
      <Grid>
        <BarButton>
          <Button sx={buttonSx} color="primary" variant="contained" size="small" component={NavLink} to="/marketplace">
            <StyledIcon fontSize="small" />
            STORE
          </Button>
        </BarButton>
      </Grid>
      <Grid>
        <BarButton>
          <Button sx={buttonSx} variant="contained" size="small" disabled>
            <StyledIcon fontSize="small" />
            SOMETHING
          </Button>
        </BarButton>
      </Grid>
      <Grid>
        <BarButton>
          <Button sx={buttonSx} variant="contained" size="small" disabled>
            <StyledIcon fontSize="small" />
            INVENTORY
          </Button>
        </BarButton>
      </Grid>
    </Grid>
  )
}
