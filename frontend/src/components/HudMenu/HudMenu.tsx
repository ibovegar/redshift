import { HudButton } from 'components/HudButton/HudButton'

export interface MenuItem {
  label: string
  id?: string
  onClick?: () => void
}

const DEFAULT_ITEMS: MenuItem[] = [
  { label: 'Move', id: 'travel-btn' },
  { label: 'Scan', id: 'scan-btn' },
  { label: 'Mining', id: 'mining-btn' },
  { label: 'Dock', id: 'dock-btn' },
  { label: 'Details', id: 'details-btn' }
]

interface HudMenuProps {
  items?: MenuItem[]
}

export const HudMenu = (props: HudMenuProps) => {
  const { items = DEFAULT_ITEMS } = props

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
      {items.map(({ label, id, onClick }) => (
        <HudButton key={id ?? label} id={id} onClick={onClick}>
          {label}
        </HudButton>
      ))}
    </div>
  )
}
