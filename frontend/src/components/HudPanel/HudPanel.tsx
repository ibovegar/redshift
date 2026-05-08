import type { ReactNode } from 'react'
import { forwardRef } from 'react'

interface HudPanelProps {
  children: ReactNode
}

export const HudPanel = forwardRef<HTMLDivElement, HudPanelProps>(({ children }, ref) => (
  <div
    ref={ref}
    style={{
      position: 'fixed',
      opacity: 0,
      pointerEvents: 'none',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '16px',
      transformOrigin: 'left center'
    }}
  >
    {children}
  </div>
))
