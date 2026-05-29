import type { SectionType, StationSection } from 'models/station-section'
import {
  BASE_POWER,
  BASE_STORAGE_CAPACITY,
  POWER_PER_CORE,
  SECTION_NAMES,
  SECTION_POWER,
  STORAGE_EXTENSION_CAPACITY
} from 'models/station-section'

export interface PowerLine {
  label: string
  value: number
}

// Power produced: the base reactor plus the built Power Cores (aggregated).
export const powerProducers = (powerCapacity: number): PowerLine[] => {
  const cores = Math.max(0, Math.round((powerCapacity - BASE_POWER) / POWER_PER_CORE))
  const lines: PowerLine[] = [{ label: 'Base Reactor', value: BASE_POWER }]
  if (cores > 0) lines.push({ label: `Power Cores (${cores})`, value: cores * POWER_PER_CORE })
  return lines
}

// Power drawn: each operational consuming module, plus the built Storage Extensions aggregated.
export const powerConsumers = (sections: StationSection[], storageCapacity: number): PowerLine[] => {
  const lines: PowerLine[] = []
  for (const section of sections) {
    if (section.status !== 'operational') continue
    if (section.type === 'power' || section.type === 'storage-extension') continue
    const draw = SECTION_POWER[section.type]
    if (draw > 0) lines.push({ label: SECTION_NAMES[section.type as SectionType], value: draw })
  }
  const builtExtensions = Math.max(
    0,
    Math.round((storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY)
  )
  if (builtExtensions > 0) {
    lines.push({
      label: `Storage Extensions (${builtExtensions})`,
      value: builtExtensions * SECTION_POWER['storage-extension']
    })
  }
  return lines
}
