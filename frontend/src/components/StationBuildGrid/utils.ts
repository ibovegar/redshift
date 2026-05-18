import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus, SectionType, StationSection } from 'models/station-section'
import { SECTION_BLUEPRINT } from 'models/station-section'

export const heldAmount = (storage: CargoItem[], mat: AsteroidMaterial | string) =>
  storage.find((s) => s.material === mat)?.amount ?? 0

export const canAfford = (costs: Partial<Record<string, number>>, storage: CargoItem[]) =>
  Object.entries(costs).every(([m, n]) => heldAmount(storage, m) >= (n ?? 0))

export const statusOf = (sections: StationSection[], type: SectionType): SectionStatus =>
  sections.find((s) => s.type === type)?.status ?? 'locked'

export const isBlueprintUnmet = (sections: StationSection[], type: SectionType) => {
  const bp = SECTION_BLUEPRINT[type]
  return !!bp && statusOf(sections, bp) !== 'operational'
}
