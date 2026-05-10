import { Box, Stack } from '@mui/material'
import type { CargoItem } from 'models/spacecraft'
import type { ReactNode } from 'react'
import { Toolbar } from './Toolbar/Toolbar'

// const Background = styled('img')({
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   bottom: 0,
//   right: 0,
//   zIndex: -1,
//   backgroundImage: `url(${backgroundImage})`,
//   backgroundSize: 'cover',
//   filter: 'grayscale(20%) brightness(30%)',
//   transition: 'filter 0.5s ease-in-out, transform 1.2s ease-in-out',
//   transform: 'scale(1.05)'
// })

// const TacticalWrapper = styled('div')({
//   display: 'contents',
//   [`& ${Background}`]: {
//     transform: 'scale(1)',
//     filter: 'grayscale(10%) brightness(80%)'
//   }
// })

interface Props {
  authenticated: boolean
  storage?: CargoItem[]
  children: ReactNode
}

export const Layout = (props: Props) => {
  const { children, storage = [] } = props
  // const location = useLocation()
  // const isTactical = location.pathname === '/tactical'

  // const Wrapper = isTactical ? TacticalWrapper : React.Fragment

  return (
    <Stack sx={{ height: '100vh', p: 6, position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
      {/* <Wrapper>
        <Background id="app-background" alt=" " />
      </Wrapper> */}
      <Toolbar storage={storage} />
      <Box sx={{ flex: 1, mt: 6, minHeight: 0, pointerEvents: 'auto' }}>{children}</Box>
    </Stack>
  )
}
