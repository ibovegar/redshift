import { Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { Spacecraft } from 'models'

interface Props {
  spacecraft: Spacecraft
}

export const SpacecraftCard = (props: Props) => {
  const { spacecraft } = props
  return (
    <Stack direction="row" spacing={2} sx={{ p: 1, alignItems: 'center', justifyContent: 'center' }}>
      <img
        style={{ display: 'block' }}
        height="50"
        alt="spacecraft"
        src={`/icons/spacecraft/${spacecraft.spacecraftRegistry}.png`}
      />
      <div>
        <Typography variant="h6">{spacecraft.name}</Typography>
        <Typography variant="body2">{spacecraft.manufacturer}</Typography>
      </div>
    </Stack>
  )
}
