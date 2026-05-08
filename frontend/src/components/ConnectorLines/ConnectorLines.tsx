import { styled } from '@mui/material/styles'
import { forwardRef } from 'react'

const SvgLayer = styled('svg')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 9
})

interface ConnectorLinesProps {
  menuLineRef: React.Ref<SVGLineElement>
  scanLineRef: React.Ref<SVGLineElement>
}

export const ConnectorLines = forwardRef<SVGSVGElement, ConnectorLinesProps>((props, ref) => {
  const { menuLineRef, scanLineRef } = props

  return (
    <SvgLayer ref={ref} role="img" aria-label="Menu connector line">
      <line ref={menuLineRef} stroke="#ffffff" strokeWidth="1" opacity="0" strokeDasharray="6 4" />
      <line ref={scanLineRef} stroke="#ffffff" strokeWidth="1" opacity="0" strokeDasharray="6 4" />
    </SvgLayer>
  )
})
