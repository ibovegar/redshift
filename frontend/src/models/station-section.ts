import type { AsteroidMaterial } from './asteroid'

// `storage-extension` is a buildable upgrade — researching + constructing it grows the
// station's overall `storageCapacity` and reveals the cargo-pod mesh in the 3D scene. The
// always-visible `storage` entry stays a static abstraction (pre-researched + pre-built) that
// just displays the running capacity in the module list.
export type SectionType = 'command' | 'research' | 'engineering' | 'storage' | 'power' | 'storage-extension'
export type SectionStatus = 'operational' | 'available' | 'locked'

// Storage capacity is measured in raw stored units (the sum of CargoItem amounts). The station
// starts with BASE_STORAGE_CAPACITY (the "Internal Storage"); each built Storage Extension adds
// STORAGE_EXTENSION_CAPACITY. The number of extension sections is derived from the running
// `storageCapacity`: (storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY.
export const BASE_STORAGE_CAPACITY = 1000
export const STORAGE_EXTENSION_CAPACITY = 500

// Hard cap on how many Storage Extensions can be built (and shown in the Station Layout grid).
export const MAX_STORAGE_EXTENSIONS = 3

export interface StationSection {
  type: SectionType
  status: SectionStatus
}

export const SECTION_COSTS: Record<SectionType, Partial<Record<AsteroidMaterial, number>>> = {
  command: {},
  research: { iron: 20, copper: 10 },
  engineering: { iron: 30, titanium: 15 },
  storage: { iron: 25, carbon: 15 },
  power: { copper: 20, uranium: 5 },
  'storage-extension': { iron: 20, carbon: 15 }
}

export const SECTION_NAMES: Record<SectionType, string> = {
  command: 'Command Module',
  research: 'Research Lab',
  engineering: 'Engineering Bay',
  storage: 'Storage Hub',
  power: 'Power Core',
  'storage-extension': 'Storage Extension'
}

// Descriptions are written to wrap to ~3 lines at the InfoPanel width (≈280px content) so the
// layout doesn't jitter when the user switches between modules. Pair with a `minHeight` on the
// description Typography for an exact lock.
export const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  command:
    'Central hub responsible for constructing every other station module. Coordinates docking, logistics, and the overall station systems.',
  research:
    'Dedicated research facility for developing blueprints — ships, ship addons, and advanced station modules. Does not produce raw materials.',
  engineering:
    'Heavy fabrication bay for manufacturing ships and ship upgrades. Performs structural repairs on docked spacecraft using bulk materials.',
  storage:
    'Central cargo hub for the station. Holds refined ores and processed materials, with total capacity growing as Storage Extensions are added.',
  power:
    'Reactor module providing additional power capacity to the station. Required by manufacturing and other high-draw modules to stay online.',
  'storage-extension':
    'Add-on cargo pod that grows the station storage capacity. Built once the Storage Extension blueprint has been researched in the lab.'
}

export const SECTION_COLORS: Record<SectionType, number> = {
  command: 0x66ccff,
  research: 0x88ffcc,
  engineering: 0xff8844,
  storage: 0x44ff88,
  power: 0xffdd44,
  'storage-extension': 0x44ffaa
}

// Which module must be operational to unlock this one (its "blueprint" source)
export const SECTION_BLUEPRINT: Record<SectionType, SectionType | null> = {
  command: null,
  research: 'command',
  engineering: 'research',
  power: 'engineering',
  storage: 'engineering',
  'storage-extension': 'storage'
}

// Storage sits second so it appears right beneath Command in the operational module list.
// `storage-extension` is intentionally placed at the end — it's a buildable upgrade in the
// grid but is filtered out of the always-visible operational module list in StationBuildGrid.
export const SECTION_ORDER: readonly SectionType[] = [
  'command',
  'storage',
  'engineering',
  'research',
  'power',
  'storage-extension'
]

export const SECTION_IMAGES: Record<SectionType, string> = {
  command: '/images/modules/command.png',
  research: '/images/modules/research.png',
  engineering: '/images/modules/engineering_1.png',
  storage: '/images/modules/storage.png',
  power: '/images/modules/power_1.png',
  'storage-extension': '/images/modules/storage.png'
}

export const SECTION_ICONS: Record<SectionType, string> = {
  command: '/icons/modules/module-1.svg',
  engineering: '/icons/modules/module-2.svg',
  research: '/icons/modules/module-3.svg',
  power: '/icons/modules/module-4.svg',
  storage: '/icons/modules/module-5.svg',
  'storage-extension': '/icons/modules/module-5.svg'
}
