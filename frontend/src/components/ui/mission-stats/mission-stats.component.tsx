import React from 'react';
import { styled } from '@mui/material/styles';
import { Mission } from 'models';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material';
import CreditsIcon from '@mui/icons-material/AttachMoney';
import DifficultyIcon from '@mui/icons-material/SignalCellular2Bar';
import TypeIcon from '@mui/icons-material/Layers';
import LocationIcon from '@mui/icons-material/LocationOn';
import ConstellationIcon from '@mui/icons-material/BubbleChart';

const StyledListItem = styled(ListItem)({
  paddingTop: 2,
  paddingBottom: 2
});

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  mission: Mission;
}

const MissionTag: React.FC<Props> = (props) => {
  const { mission, className, style } = props;

  const avatarSx = {
    bgcolor: 'grey.700',
    color: '#fff',
    mr: 5
  };

  return (
    <List className={className} dense style={style}>
      <StyledListItem>
        <ListItemAvatar>
          <Avatar sx={avatarSx}>
            <CreditsIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Credits" secondary={mission.credits} />
      </StyledListItem>
      <StyledListItem>
        <ListItemAvatar>
          <Avatar sx={avatarSx}>
            <DifficultyIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Difficulty" secondary={mission.difficulty} />
      </StyledListItem>
      <StyledListItem>
        <ListItemAvatar>
          <Avatar sx={avatarSx}>
            <TypeIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Type" secondary={mission.type} />
      </StyledListItem>
      <StyledListItem>
        <ListItemAvatar>
          <Avatar sx={avatarSx}>
            <LocationIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Location"
          secondary={`${mission.ascention} / ${mission.declination}`}
        />
      </StyledListItem>
      <StyledListItem>
        <ListItemAvatar>
          <Avatar sx={avatarSx}>
            <ConstellationIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Constellation"
          secondary={mission.constellation}
        />
      </StyledListItem>
    </List>
  );
};

export default MissionTag;
