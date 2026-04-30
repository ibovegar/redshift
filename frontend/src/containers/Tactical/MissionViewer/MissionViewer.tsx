import CloseIcon from '@mui/icons-material/Close'
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { MissionProgress, MissionStats } from 'components'
import { useCompleteMission, useMissions } from 'hooks'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router'

const Root = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

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

export const MissionViewer = () => {
  const [redirect, setRedirect] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const { missionId } = useParams()
  const { data: missions } = useMissions()
  const completeMission = useCompleteMission()

  const mission = missions.find((m) => m.id === missionId)

  const handleOnCompleted = () => {
    if (!mission) return
    completeMission.mutate(mission)
    setRedirect(true)
  }

  if (redirect) return <Navigate to="/tactical" />
  if (!mission) return <Navigate to="/tactical" />

  return (
    <Root>
      <Card sx={{ width: '50%', position: 'relative' }}>
        {inProgress && <ProgressOverlay onCompleted={handleOnCompleted} />}
        <CardHeader
          avatar={<Avatar sx={{ ml: 2, mr: 1, bgcolor: 'primary.main' }}>R</Avatar>}
          action={
            <IconButton aria-label="Settings" onClick={() => setRedirect(true)}>
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
    </Root>
  )
}
