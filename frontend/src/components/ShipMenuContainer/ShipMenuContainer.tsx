import type { ScanResultProps } from 'components/ScanResult/ScanResult'
import { ScanResult } from 'components/ScanResult/ScanResult'
import { ShipMenu } from 'components/ShipMenu/ShipMenu'
import { forwardRef } from 'react'

interface ShipMenuContainerProps {
  scanResult?: Omit<ScanResultProps, 'onMiningStart'>
  onMiningStart?: () => void
}

export const ShipMenuContainer = forwardRef<HTMLDivElement, ShipMenuContainerProps>(
  ({ scanResult, onMiningStart }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
          transformOrigin: 'left center'
        }}
      >
        <ShipMenu />
        {scanResult?.visible && scanResult.asteroid && (
          <ScanResult
            visible={scanResult.visible}
            asteroid={scanResult.asteroid}
            revealed={scanResult.revealed}
            progress={scanResult.progress}
            onMiningStart={onMiningStart}
          />
        )}
      </div>
    )
  }
)
