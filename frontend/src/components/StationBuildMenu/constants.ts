import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus } from 'models/station-section'

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
