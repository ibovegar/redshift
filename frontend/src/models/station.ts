import type { ResearchTask } from './blueprint'
import type { CargoItem } from './spacecraft'
import type { StationSection } from './station-section'

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
  sections: StationSection[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
}
