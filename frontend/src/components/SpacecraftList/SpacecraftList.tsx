import { styled } from '@mui/material/styles'
import type { Spacecraft } from 'models'
import type React from 'react'
import { NavLink, useMatch } from 'react-router'
import { GridButton } from '../GridButton/GridButton'
import { SpacecraftCard } from './SpacecraftCard/SpacecraftCard'

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  display: 'flex',
  textDecoration: 'none',
  color: theme.palette.text.primary,
  outline: 'none',
  backgroundColor: theme.palette.grey[500],
  clipPath: `polygon(
    0 0, 0 0,
    calc(100% - 10px) 0%, 100% 10px,
    100% 100%, 100% 100%,
    10px 100%, 0% calc(100% - 10px))`,
  '&.active': {
    backgroundColor: theme.palette.grey[600],
    border: 'none',
    borderRadius: 2
  }
}))

interface StateProps {
  spacecrafts: Spacecraft[]
  onSpacecraftClick?: (event: React.MouseEvent) => void
}

const SpacecraftItem = ({
  spacecraft,
  onClick
}: {
  spacecraft: Spacecraft
  onClick?: (event: React.MouseEvent) => void
}) => {
  const isActive = useMatch(`/engineering/${spacecraft.id}`)

  return (
    <StyledNavLink to={`/engineering/${spacecraft.id}`} onClick={onClick} id={spacecraft.id}>
      <GridButton active={!!isActive}>
        <SpacecraftCard spacecraft={spacecraft} />
      </GridButton>
    </StyledNavLink>
  )
}

export const SpacecraftList = (props: StateProps) => {
  const { spacecrafts, onSpacecraftClick } = props

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {spacecrafts.map((spacecraft: Spacecraft) => (
        <SpacecraftItem key={spacecraft.id} spacecraft={spacecraft} onClick={onSpacecraftClick} />
      ))}
    </div>
  )
}
