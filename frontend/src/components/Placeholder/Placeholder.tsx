import { CardActions, Typography } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import type React from 'react'

const Root = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4)
}))

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  '&:last-child': {
    paddingBottom: theme.spacing(4)
  }
}))

const StyledCardActions = styled(CardActions)({
  display: 'flex',
  justifyContent: 'center'
})

interface Props {
  action?: React.JSX.Element
  message: string
}

export const Placeholder = (props: Props) => {
  const { action } = props

  return (
    <Root>
      <StyledCard>
        <StyledCardContent>
          <Typography variant="h6">{props.message}</Typography>
        </StyledCardContent>
        {action && <StyledCardActions>{props.action}</StyledCardActions>}
      </StyledCard>
    </Root>
  )
}
