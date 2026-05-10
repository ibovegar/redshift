import { forwardRef } from 'react'

interface HudTooltipProps {
  name: string
}

export const HudTooltip = forwardRef<HTMLDivElement, HudTooltipProps>((props, ref) => {
  const { name } = props

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
        transform: 'translateX(-50%) perspective(300px) rotateX(20deg) rotateY(-14deg) skewY(4deg)',
        transition: 'opacity 0.15s',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          background: '#2040e0',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '2px',
          fontSize: '12px',
          fontFamily: 'monospace',
          letterSpacing: '1px',
          whiteSpace: 'nowrap'
        }}
      >
        {name}
      </div>
      <div
        style={{
          width: '2px',
          height: '60px',
          background: 'linear-gradient(to bottom, #2040e0, rgba(32, 64, 224, 0))'
        }}
      />
    </div>
  )
})
