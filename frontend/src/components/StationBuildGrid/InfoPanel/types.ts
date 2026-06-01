import type { ResearchTask } from 'models/blueprint'
import type { QueueItem } from 'models/queue'
import type { CargoItem } from 'models/spacecraft'
import type { PowerStatus } from 'models/station'
import type { SectionStatus, SectionType, StationSection } from 'models/station-section'

// Shared props the InfoPanel dispatcher forwards to every per-module sub-view. Some views only
// need a subset (e.g. PowerInfo doesn't read storage), but keeping a single shape means the
// dispatcher doesn't have to know what each view consumes.
export interface InfoPanelProps {
  type: SectionType
  status: SectionStatus
  sections: StationSection[]
  storage: CargoItem[]
  storageCapacity: number
  power: PowerStatus
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  queue: QueueItem[]
  isPending: boolean
  onBuild: () => void
}

// Status + condition labels and colours shared across every per-module view. Status colours
// resolve via theme tokens so the modal status badges and InfoPanel rows agree.
export const STATUS_LABEL: Record<SectionStatus, string> = {
  operational: 'Operational',
  available: 'Available',
  locked: 'Locked'
}

export const STATUS_COLOR: Record<SectionStatus, string> = {
  operational: 'hud.success',
  available: 'hud.statusAvailable',
  locked: 'hud.statusLocked'
}

export const CONDITION_LABEL: Record<SectionStatus, string> = {
  operational: 'Nominal',
  available: 'Awaiting construction',
  locked: 'Offline'
}
