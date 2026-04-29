import { Box, Button, LinearProgress, Typography } from '@mui/material'
import type { AttachedUpgrades, Spacecraft } from 'models'

interface Props {
  spacecraft: Spacecraft
  attachedUpgrades: AttachedUpgrades
}

const Stats = (props: Props) => {
  const { spacecraft, attachedUpgrades } = props
  // Only rerender if buffs changes
  const { baseStats } = spacecraft
  const { engine, deflector, weapons, stabilizer, plating } = attachedUpgrades

  return (
    <Box
      sx={{
        p: 5,
        pt: 3,
        bgcolor: 'background.default',
        width: '20%',
        position: 'absolute'
      }}
    >
      {/* <Box m={2}>
        <Typography variant="body1">
          <strong>Name:</strong> {spacecraft.name}
        </Typography>
        <Typography variant="body1">
          <strong>Type:</strong> {spacecraft.type}
        </Typography>
        <Typography variant="body1">
          <strong>Manufacturer:</strong> {spacecraft.manufacturer}
        </Typography>
        <Typography variant="body1">
          <strong>Manufactured:</strong> {spacecraft.manufactured}
        </Typography>
        <Typography variant="body1">
          <strong>Height:</strong> {spacecraft.height}
        </Typography>
        <Typography variant="body1">
          <strong>Length:</strong> {spacecraft.length}
        </Typography>
        <Typography variant="body1">
          <strong>Registry:</strong> {spacecraft.registry}
        </Typography>
      </Box> */}

      <Typography variant="overline">Speed</Typography>
      <LinearProgress variant="determinate" color="secondary" value={baseStats.speed + (engine?.gain || 0)} />
      <Typography variant="overline">Shield</Typography>
      <LinearProgress color="secondary" variant="determinate" value={baseStats.shield + (deflector?.gain || 0)} />
      <Typography variant="overline">Damage</Typography>
      <LinearProgress color="secondary" variant="determinate" value={baseStats.damage + (weapons?.gain || 0)} />
      <Typography variant="overline">Hull</Typography>
      <LinearProgress color="secondary" variant="determinate" value={baseStats.hull + (plating?.gain || 0)} />
      <Typography variant="overline">Manuvrability</Typography>
      <LinearProgress
        color="secondary"
        variant="determinate"
        value={baseStats.manuvrability + (stabilizer?.gain || 0)}
      />
      <Box sx={{ mt: 5 }}>
        <Button color="primary" variant="contained" size="small">
          DETAILS
        </Button>
      </Box>
    </Box>
  )
}

export default Stats
