import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Mission } from 'models'

const rotateKeyframes = {
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
}

const Root = styled('div', {
  shouldForwardProp: (prop) => prop !== 'disabled' && prop !== 'position' && prop !== 'onSelect'
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
  position: 'fixed',
  flexDirection: 'column',
  display: 'flex',
  alignItems: 'center',
  width: 320,
  padding: theme.spacing(2),
  borderRadius: 5,
  cursor: 'pointer',
  transition: 'all 0.2s',
  ...(disabled && {
    filter: 'blur(10px)',
    pointerEvents: 'none'
  }),
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `inset 0 0 30px 2px ${theme.palette.primary.main}`
  }
}))

const Tag = styled('div')(({ theme }) => ({
  width: '100%',
  padding: `0 ${theme.spacing(6)}`,
  paddingBottom: theme.spacing(4),
  paddingTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: 10
}))

const Spinner = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '50%',
  height: 80,
  clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
  background: `radial-gradient(circle at center 35%, transparent 20%, ${theme.palette.background.paper} 21%)`,
  '&:after': {
    content: '" "',
    display: 'block',
    width: 54,
    height: 54,
    margin: 1,
    borderRadius: '50%',
    border: `4px solid ${theme.palette.primary.main}`,
    borderColor: `${theme.palette.primary.main} transparent ${theme.palette.primary.main} transparent`,
    animation: 'rotate 0.7s linear infinite'
  },
  ...rotateKeyframes
}))

interface Props {
  mission: Mission
  position: { x: number; y: number }
  disabled?: boolean
  onSelect: () => void
}

const MissionTag = (props: Props) => {
  const { mission, position, onSelect, disabled } = props

  return (
    <Root disabled={disabled} style={{ left: `${position.x}%`, top: `${position.y}%` }} onClick={() => onSelect()}>
      <Tag>
        <Typography variant="h6">{mission.title}</Typography>
        <Typography variant="overline" color="textSecondary" sx={{ lineHeight: 1 }}>
          {mission.shortDescription}
        </Typography>
      </Tag>
      <Spinner />
    </Root>
  )
}

export default MissionTag
