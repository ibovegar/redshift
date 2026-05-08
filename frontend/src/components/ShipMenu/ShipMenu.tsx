import { HudButton } from 'components/HudButton/HudButton'

const BUTTONS = [
  { label: 'Move', id: 'travel-btn' },
  { label: 'Scan', id: 'scan-btn' },
  { label: 'Mining', id: 'mining-btn' },
  { label: 'Dock', id: 'dock-btn' },
  { label: 'Details', id: 'details-btn' }
]

export const ShipMenu = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: '1px dashed #ffffff',
        padding: '20px'
      }}
    >
      {BUTTONS.map(({ label, id }) => (
        <HudButton key={label} id={id}>
          {label}
        </HudButton>
      ))}
    </div>
  )
}
