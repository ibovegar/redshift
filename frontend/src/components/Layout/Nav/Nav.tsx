import { Grid } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { useLocation, useNavigate } from 'react-router'

export const Nav = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onWiki = pathname.startsWith('/wiki')

  return (
    <Grid container sx={{ alignItems: 'center' }} spacing={2}>
      <HudButton variant={onWiki ? 'secondary' : 'primary'} onClick={() => navigate('/tactical')}>
        HOME
      </HudButton>
      <HudButton variant={onWiki ? 'primary' : 'secondary'} onClick={() => navigate('/wiki')}>
        WIKI
      </HudButton>
    </Grid>
  )
}
