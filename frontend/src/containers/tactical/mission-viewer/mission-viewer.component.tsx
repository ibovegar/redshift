import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router';
import { AppState } from 'store';
import { useSelector, useDispatch } from 'react-redux';
import { addCredits } from 'store/user';
import { getMissionById, completeMission } from 'store/missions';
import CloseIcon from '@mui/icons-material/Close';
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MissionStats, MissionProgress } from 'components/ui';

const Root = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const StyledCard = styled(Card)({
  width: '50%',
  position: 'relative'
});

const StyledCardActions = styled(CardActions)({
  display: 'flex',
  justifyContent: 'center'
});

const MissionViewer = () => {
  const [redirect, setRedirect] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const dispatch = useDispatch();
  const { missionId } = useParams();
  const mission = useSelector((state: AppState) =>
    getMissionById(state, missionId!)
  );

  const handleOnCompleted = () => {
    dispatch(completeMission(mission) as any);
    dispatch(addCredits(mission.credits) as any);
    setRedirect(true);
  };

  if (redirect) return <Navigate to="/tactical" />;
  if (!mission) return <div>loading mission...</div>;

  return (
    <Root>
      <StyledCard>
        {inProgress && (
          <MissionProgress
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 1000
            }}
            onCompleted={handleOnCompleted}
          />
        )}
        <CardHeader
          avatar={
            <Avatar sx={{ ml: 2, mr: 1, bgcolor: 'primary.main' }}>R</Avatar>
          }
          action={
            <IconButton aria-label="Settings" onClick={() => setRedirect(true)}>
              <CloseIcon />
            </IconButton>
          }
          title={mission.title}
          subheader={mission.shortDescription}
        />
        <img
          style={{
            height: '440px',
            width: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          src={`${process.env.PUBLIC_URL}/images/art/${mission.id}.jpg`}
          alt=""
        />
        <MissionStats
          style={{ position: 'absolute', top: 100, left: 10, zIndex: 1 }}
          mission={mission}
        />
        <CardContent sx={{ p: 10 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            component="p"
            sx={{ lineHeight: 1.8 }}
          >
            {mission.description}
          </Typography>
        </CardContent>
        <StyledCardActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setInProgress(true)}
          >
            LAUNCH MISSION
          </Button>
        </StyledCardActions>
      </StyledCard>
    </Root>
  );
};

export default MissionViewer;
