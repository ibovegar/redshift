import type { QueueItem } from './queue'
import type { CargoItem } from './spacecraft'
import type { StationSection } from './station-section'
import { BASE_STORAGE_CAPACITY, SECTION_POWER, STORAGE_EXTENSION_CAPACITY } from './station-section'

export interface Station {
  id: string
  name: string
  storage: CargoItem[]
  /**
   * Total cargo storage capacity (units across all materials). Independent of the always-visible
   * "Storage" entry in the module list — that entry displays this value. Building a Storage
   * Module section bumps this number; researching a Storage upgrade unlocks more bumps.
   */
  storageCapacity: number
  /** Total power capacity = BASE_POWER + (built Power Cores) * POWER_PER_CORE. Bumped per core build. */
  powerCapacity: number
  sections: StationSection[]
  researchedBlueprints: string[]
  /** Unified work queue (research + section builds). The station runs at most one active research
   *  and one active build at a time, in queue order; everything else waits. See models/queue.ts. */
  queue: QueueItem[]
}

export interface PowerStatus {
  capacity: number
  consumption: number
  free: number
  /** True when consumption has reached capacity — blocks research / ship / module builds (not cores). */
  atMax: boolean
}

// Derives the live power status. Consumption is the sum of SECTION_POWER over operational sections
// (Power Cores produce, so contribute 0), plus one draw per built Storage Extension (the model
// keeps a single storage-extension section, but each built pod consumes).
export const computePower = (station: Pick<Station, 'sections' | 'storageCapacity' | 'powerCapacity'>): PowerStatus => {
  let consumption = 0
  for (const section of station.sections) {
    if (section.status !== 'operational') continue
    if (section.type === 'power' || section.type === 'storage-extension') continue
    consumption += SECTION_POWER[section.type]
  }
  const builtExtensions = Math.max(
    0,
    Math.round((station.storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY)
  )
  consumption += builtExtensions * SECTION_POWER['storage-extension']
  const capacity = station.powerCapacity
  return { capacity, consumption, free: capacity - consumption, atMax: consumption >= capacity }
}
