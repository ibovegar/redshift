import type { BuildTask, ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus, SectionType } from 'models/station-section'

// Shared props the InfoPanel dispatcher forwards to every per-module sub-view. Some views only
// need a subset (e.g. PowerInfo doesn't read storage), but keeping a single shape means the
// dispatcher doesn't have to know what each view consumes.
export interface InfoPanelProps {
  type: SectionType
  status: SectionStatus
  storage: CargoItem[]
  storageCapacity: number
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  buildInProgress: BuildTask | null
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
