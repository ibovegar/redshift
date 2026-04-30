import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { formatCurrency } from 'utils/helpers'
import Nav from '../Nav/Nav'

const Root = styled('div')(({ theme }) => ({
  borderStyle: 'solid',
  borderWidth: '1px 0 1px 0',
  borderColor: theme.palette.grey[800],
  display: 'flex',
  alignItems: 'center',
  height: 60
}))

const Left = styled('div')({
  flex: '1'
})

const Right = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
  backgroundColor: theme.palette.background.paper
}))

interface Props {
  credits: number
}

const Toolbar = (props: Props) => {
  const { credits } = props
  return (
    <Root>
      <Left>
        <Nav />
      </Left>
      <Right>
        <Typography variant="h6">{formatCurrency(credits)}</Typography>
      </Right>
    </Root>
  )
}

export default Toolbar
