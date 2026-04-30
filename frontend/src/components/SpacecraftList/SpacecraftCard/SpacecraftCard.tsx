import { Box } from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import type { Spacecraft } from 'models'

interface Props {
  spacecraft: Spacecraft
}

const SpacecraftCard = (props: Props) => {
  const { spacecraft } = props
  return (
    <Box sx={{ p: 1 }}>
      <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Grid>
          <img
            style={{ display: 'block' }}
            height="50"
            alt="spacecraft"
            src={`/icons/spacecraft/${spacecraft.spacecraftRegistry}.png`}
          />
        </Grid>
        <Grid style={{ paddingLeft: '20px' }}>
          <Typography variant="h6">{spacecraft.name}</Typography>
          <Typography variant="body2">{spacecraft.manufacturer}</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SpacecraftCard
