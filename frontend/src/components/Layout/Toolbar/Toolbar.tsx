import { styled } from '@mui/material/styles'
import type { CargoItem } from 'models/spacecraft'
import { Nav } from '../Nav/Nav'

const Root = styled('div')(({ theme }) => ({
  borderStyle: 'solid',
  borderWidth: '1px 0 1px 0',
  borderColor: theme.palette.grey[800],
  display: 'flex',
  alignItems: 'center',
  height: 50,
  pointerEvents: 'auto',
  position: 'fixed',
  top: theme.spacing(6),
  left: theme.spacing(6),
  right: theme.spacing(6),
  zIndex: 20
}))

const Left = styled('div')({
  flex: '1'
})

// const Right = styled('div')(({ theme }) => ({
//   height: '100%',
//   display: 'flex',
//   alignItems: 'center',
//   gap: theme.spacing(3),
//   paddingLeft: theme.spacing(5),
//   paddingRight: theme.spacing(5),
//   backgroundColor: theme.palette.background.paper
// }))

interface Props {
  storage?: CargoItem[]
}

export const Toolbar = (_props: Props) => {
  return (
    <Root>
      <Left>
        <Nav />
      </Left>
      {/* <Right></Right> */}
    </Root>
  )
}
