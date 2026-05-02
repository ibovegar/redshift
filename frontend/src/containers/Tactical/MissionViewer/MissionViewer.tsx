import CloseIcon from '@mui/icons-material/Close'
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { MissionProgress, MissionStats } from 'components'
import { useCompleteMission } from 'hooks'
import type { Mission } from 'models'
import { useState } from 'react'

const ProgressOverlay = styled(MissionProgress)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: 1000
})

const MissionImage = styled('img')({
  height: '440px',
  width: '100%',
  objectFit: 'cover',
  display: 'block'
})

interface Props {
  mission: Mission
  onClose: () => void
}

export const MissionViewer = (props: Props) => {
  const { mission, onClose } = props

  const [inProgress, setInProgress] = useState(false)
  const completeMission = useCompleteMission()

  const handleOnCompleted = () => {
    completeMission.mutate(mission)
    onClose()
  }

  return (
    <Card sx={{ position: 'relative' }}>
      {inProgress && <ProgressOverlay onCompleted={handleOnCompleted} />}
      <CardHeader
        avatar={<Avatar sx={{ ml: 2, mr: 1, bgcolor: 'primary.main' }}>R</Avatar>}
        action={
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title={mission.title}
        subheader={mission.shortDescription}
      />
      <MissionImage src={`/images/art/${mission.id}.jpg`} alt="" />
      <MissionStats style={{ position: 'absolute', top: 100, left: 10, zIndex: 1 }} mission={mission} />
      <CardContent sx={{ p: 10 }}>
        <Typography variant="body2" color="text.secondary" component="p" sx={{ lineHeight: 1.8 }}>
          {mission.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => setInProgress(true)}>
          LAUNCH MISSION
        </Button>
      </CardActions>
    </Card>
  )
}
