import CreditsIcon from '@mui/icons-material/AttachMoney'
import ConstellationIcon from '@mui/icons-material/BubbleChart'
import TypeIcon from '@mui/icons-material/Layers'
import LocationIcon from '@mui/icons-material/LocationOn'
import DifficultyIcon from '@mui/icons-material/SignalCellular2Bar'
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Mission } from 'models'
import type React from 'react'

const StyledListItem = styled(ListItem)({
  paddingTop: 2,
  paddingBottom: 2
})

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  mission: Mission
}

export const MissionStats = (props: Props) => {
  const { mission, className, style } = props

  const avatarSx = {
    bgcolor: 'grey.700',
    color: '#fff',
    mr: 5
  }

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
        <ListItemText primary="Location" secondary={`${mission.ascention} / ${mission.declination}`} />
      </StyledListItem>
      <StyledListItem>
        <ListItemAvatar>
          <Avatar sx={avatarSx}>
            <ConstellationIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Constellation" secondary={mission.constellation} />
      </StyledListItem>
    </List>
  )
}
