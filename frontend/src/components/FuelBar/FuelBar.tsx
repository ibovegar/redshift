import { forwardRef } from 'react'

export const FuelBar = forwardRef<HTMLDivElement>(function FuelBar(_props, ref) {
  return (
    <div
      ref={ref}
      style={{
        display: 'none',
        position: 'fixed',
        transform: 'translateX(-50%)',
        zIndex: 15,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          width: 80,
          height: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}
      >
        <div
          data-fuel-fill
          style={{
            height: '100%',
            backgroundColor: '#66ddff',
            transition: 'width 0.2s ease',
            position: 'absolute',
            left: 0,
            top: 0
          }}
        />
        <div
          data-fuel-cost
          style={{
            height: '100%',
            backgroundColor: '#ff8800',
            position: 'absolute',
            top: 0,
            display: 'none'
          }}
        />
      </div>
      <div
        data-fuel-text
        style={{
          fontSize: 10,
          color: '#aaddff',
          textAlign: 'center',
          marginTop: 2,
          textShadow: '0 0 4px rgba(0,0,0,0.8)'
        }}
      />
    </div>
  )
})
