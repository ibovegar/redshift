import type { Spacecraft } from 'models'

export const STAT_LABELS: { key: keyof Spacecraft['baseStats']; label: string }[] = [
  { key: 'speed', label: 'Speed' },
  { key: 'shield', label: 'Shield' },
  { key: 'damage', label: 'Damage' },
  { key: 'hull', label: 'Hull' },
  { key: 'manuvrability', label: 'Manuvrability' }
]

export const TYPE_LABELS: Record<Spacecraft['type'], string> = {
  interceptor: 'Interceptor',
  fighter: 'Fighter',
  bomber: 'Bomber',
  support: 'Support',
  scout: 'Scout'
}
