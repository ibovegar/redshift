import AddBoxIcon from '@mui/icons-material/AddBox'
import { Button, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { BarButton } from '../../BarButton/BarButton'
import { NavBarButton } from './NavBarButton/NavBarButton'

const StyledIcon = styled(AddBoxIcon)(({ theme }) => ({
  marginRight: theme.spacing(2)
}))

export const Nav = () => {
  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={4}>
      <Grid>
        <Typography variant="overline">MENU</Typography>
      </Grid>
      <NavBarButton to="/tactical" label="TACTICAL" />
      <Grid>
        <BarButton>
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
              }
            }}
            variant="contained"
            size="small"
            disabled
          >
            <StyledIcon fontSize="small" />
            RESEARCH
          </Button>
        </BarButton>
      </Grid>
      <Grid>
        <BarButton>
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
              }
            }}
            variant="contained"
            size="small"
            disabled
          >
            <StyledIcon fontSize="small" />
            GALAXY
          </Button>
        </BarButton>
      </Grid>
    </Grid>
  )
}
