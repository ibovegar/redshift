import { styled } from '@mui/material/styles'

export const FullscreenLayer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none'
})
