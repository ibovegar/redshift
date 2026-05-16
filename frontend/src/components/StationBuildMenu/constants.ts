import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus } from 'models/station-section'

export const COLORS = {
  operational: '#5a9e6f',
  reqMet: '#2e7d32',
  reqUnmet: '#c62828',
  text: '#111',
  textTitle: '#222',
  textMuted: '#888',
  textLocked: '#bbb',
  cardBg: '#fff',
  overlayBg: 'rgba(255, 255, 255, 0.55)',
  cardShadow: '0 2px 12px rgba(0,0,0,0.12)',
  cardShadowHover: '0 8px 28px rgba(0,0,0,0.18)'
} as const

export const BLUEPRINT_IMAGE = '/images/materials/blueprint.jpg'

export const STATUS_LABEL: Record<SectionStatus, string> = {
  operational: '● Online',
  available: '○ Available',
  locked: '○ Locked'
}

export const heldAmount = (storage: CargoItem[], material: AsteroidMaterial): number =>
  storage.find((s) => s.material === material)?.amount ?? 0

export const canAfford = (costs: Partial<Record<AsteroidMaterial, number>>, storage: CargoItem[]): boolean =>
  Object.entries(costs).every(([m, n]) => heldAmount(storage, m as AsteroidMaterial) >= n)
