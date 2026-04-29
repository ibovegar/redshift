import { styled } from '@mui/material/styles'
import type { Spacecraft } from 'models'
import type React from 'react'
import { NavLink } from 'react-router'
import SpacecraftCard from './spacecraft-card/spacecraft-card.component'

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  border: `1px dashed${theme.palette.grey[700]}`,
  margin: 10,
  display: 'flex',
  textDecoration: 'none',
  color: theme.palette.text.primary,
  outline: 'none',
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    backgroundColor: theme.palette.grey[400]
  },
  '&.active': {
    backgroundColor: `${theme.palette.primary.main}!important`,
    border: 'none',
    borderRadius: 2,
    clipPath: `polygon(
      0 0, 0 0,
      calc(100% - 10px) 0%, 100% 10px,
      100% 100%, 100% 100%,
      10px 100%, 0% calc(100% - 10px))`
  }
}))

interface StateProps {
  spacecrafts: Spacecraft[]
  onSpacecraftClick?: (event: React.MouseEvent) => void
}

const SpacecraftList = (props: StateProps) => {
  const { spacecrafts, onSpacecraftClick } = props

  return (
    <>
      {spacecrafts.map((spacecraft: Spacecraft) => (
        <StyledNavLink
          key={spacecraft.id}
          to={`/engineering/${spacecraft.id}`}
          onClick={onSpacecraftClick}
          id={spacecraft.id}
        >
          <SpacecraftCard spacecraft={spacecraft} />
        </StyledNavLink>
      ))}
    </>
  )
}

export default SpacecraftList
