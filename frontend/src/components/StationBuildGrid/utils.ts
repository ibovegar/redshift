import type { AsteroidMaterial } from 'models/asteroid'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import { getModuleBlueprint } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus, SectionType, StationSection } from 'models/station-section'
import { ENGINEERING_LEVELS, SECTION_BLUEPRINT, SECTION_COSTS } from 'models/station-section'

export type CellState = 'online' | 'available' | 'unavailable' | 'queued'
export type ResearchStatus = 'researched' | 'in-progress' | 'queued' | 'available' | 'locked'

type CostMap = Partial<Record<string, number>>

export const heldAmount = (storage: CargoItem[], material: AsteroidMaterial | string): number =>
  storage.find((s) => s.material === material)?.amount ?? 0

export const canAfford = (costs: CostMap, storage: CargoItem[]): boolean =>
  Object.entries(costs).every(([material, required]) => heldAmount(storage, material) >= (required ?? 0))

export const statusOf = (sections: StationSection[], type: SectionType): SectionStatus =>
  sections.find((s) => s.type === type)?.status ?? 'locked'

export const isOperational = (sections: StationSection[], type: SectionType): boolean =>
  statusOf(sections, type) === 'operational'

// Top Engineering tier currently operational on the station: 0 if the base bay isn't built yet,
// 1 for just the base, 2/3/4 for each upgrade tier. Used for the "Level" readout in the module
// list and EngineeringInfo (the upgrade tiers don't show as separate modules).
export const currentEngineeringLevel = (sections: StationSection[]): number => {
  if (!isOperational(sections, 'engineering')) return 0
  for (let i = ENGINEERING_LEVELS.length - 1; i >= 0; i--) {
    if (isOperational(sections, ENGINEERING_LEVELS[i])) return i + 2
  }
  return 1
}

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

export const isRepeatableSection = (type: SectionType): boolean => type === 'storage-extension' || type === 'power'

export const canBuildSection = (
  sections: StationSection[],
  storage: CargoItem[],
  researchedBlueprints: string[],
  type: SectionType,
  atMaxPower = false
): boolean => {
  const state = getCellState(sections, researchedBlueprints, type)
  // Repeatable sections (Storage Extension, Power Core) stay buildable even once online — reaching
  // 'online' already implies their parent is operational and their blueprint is researched.
  const buildable = state === 'available' || (isRepeatableSection(type) && state === 'online')
  if (!buildable || !canAfford(SECTION_COSTS[type], storage)) return false
  // Power gate (binary): at max power only Power Cores can be built.
  if (atMaxPower && type !== 'power') return false
  return true
}

export const getResearchStatus = (
  blueprint: Blueprint,
  researchedBlueprints: string[],
  activeResearchId: string | null,
  inProgressResearchIds: string[]
): ResearchStatus => {
  if (researchedBlueprints.includes(blueprint.id)) return 'researched'
  // The active research shows in-progress (with progress bar); pending items show queued.
  if (blueprint.id === activeResearchId) return 'in-progress'
  if (inProgressResearchIds.includes(blueprint.id)) return 'queued'
  if (blueprint.parentBlueprintId && !researchedBlueprints.includes(blueprint.parentBlueprintId)) return 'locked'
  return 'available'
}

export const getResearchProgress = (task: ResearchTask, now: number = Date.now()): number => {
  const start = Date.parse(task.startedAt)
  const end = Date.parse(task.completesAt)
  if (end <= start) return 1
  return Math.min(1, Math.max(0, (now - start) / (end - start)))
}
