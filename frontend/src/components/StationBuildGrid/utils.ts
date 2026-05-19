import { getModuleBlueprint } from 'models/blueprint'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus, SectionType, StationSection } from 'models/station-section'
import { SECTION_BLUEPRINT, SECTION_COSTS } from 'models/station-section'

export type CellState = 'online' | 'available' | 'unavailable'
export type ResearchStatus = 'researched' | 'in-progress' | 'available' | 'locked'

type CostMap = Partial<Record<string, number>>

export const heldAmount = (storage: CargoItem[], material: AsteroidMaterial | string): number =>
  storage.find((s) => s.material === material)?.amount ?? 0

export const canAfford = (costs: CostMap, storage: CargoItem[]): boolean =>
  Object.entries(costs).every(([material, required]) => heldAmount(storage, material) >= (required ?? 0))

export const statusOf = (sections: StationSection[], type: SectionType): SectionStatus =>
  sections.find((s) => s.type === type)?.status ?? 'locked'

export const isOperational = (sections: StationSection[], type: SectionType): boolean =>
  statusOf(sections, type) === 'operational'

const isParentOperational = (sections: StationSection[], type: SectionType): boolean => {
  const parent = SECTION_BLUEPRINT[type]
  return !parent || isOperational(sections, parent)
}

const isModuleBlueprintResearched = (researchedBlueprints: string[], type: SectionType): boolean => {
  const blueprint = getModuleBlueprint(type)
  return !blueprint || researchedBlueprints.includes(blueprint.id)
}

export const getCellState = (
  sections: StationSection[],
  researchedBlueprints: string[],
  type: SectionType
): CellState => {
  if (isOperational(sections, type)) return 'online'
  if (!isParentOperational(sections, type)) return 'unavailable'
  if (!isModuleBlueprintResearched(researchedBlueprints, type)) return 'unavailable'
  return 'available'
}

export const canBuildSection = (
  sections: StationSection[],
  storage: CargoItem[],
  researchedBlueprints: string[],
  type: SectionType
): boolean =>
  getCellState(sections, researchedBlueprints, type) === 'available' && canAfford(SECTION_COSTS[type], storage)

export const getResearchStatus = (
  blueprint: Blueprint,
  researchedBlueprints: string[],
  researchInProgress: ResearchTask | null
): ResearchStatus => {
  if (researchedBlueprints.includes(blueprint.id)) return 'researched'
  if (researchInProgress?.blueprintId === blueprint.id) return 'in-progress'
  if (blueprint.parentBlueprintId && !researchedBlueprints.includes(blueprint.parentBlueprintId)) return 'locked'
  return 'available'
}

export const getResearchProgress = (task: ResearchTask, now: number = Date.now()): number => {
  const start = Date.parse(task.startedAt)
  const end = Date.parse(task.completesAt)
  if (end <= start) return 1
  return Math.min(1, Math.max(0, (now - start) / (end - start)))
}
