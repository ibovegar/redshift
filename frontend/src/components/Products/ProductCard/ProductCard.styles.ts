import { Chip, Divider } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'

export const StyledCard = styled(Card)({
  display: 'flex'
})

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flex: '1',
  padding: theme.spacing(8)
}))

export const Cover = styled('img')({
  width: 320,
  minWidth: 320,
  maxWidth: 320,
  height: 220,
  objectFit: 'cover'
})

export const Controls = styled('div')(({ theme }) => ({
  padding: theme.spacing(8),
  textAlign: 'right'
}))

export const StyledDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(6)
}))

export const StyledChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(4)
}))
