import type { AsteroidMaterial } from './asteroid'

// `storage-extension` is a buildable upgrade — researching + constructing it grows the
// station's overall `storageCapacity` and reveals the cargo-pod mesh in the 3D scene. The
// always-visible `storage` entry stays a static abstraction (pre-researched + pre-built) that
// just displays the running capacity in the module list.
// `engineering-2/3/4` are progressive Engineering Bay upgrades — each level has its own blueprint
// chained off the previous one, and unlocks a new buildable slot stacked beneath the base bay.
export type SectionType =
  | 'command'
  | 'research'
  | 'engineering'
  | 'engineering-2'
  | 'engineering-3'
  | 'engineering-4'
  | 'storage'
  | 'power'
  | 'storage-extension'

// SectionTypes for the chain of Engineering Bay upgrades — ordered so each level builds on the one
// before it. Used by the grid to render the column stack and by getResearchStatus to chain bps.
export const ENGINEERING_LEVELS: SectionType[] = ['engineering-2', 'engineering-3', 'engineering-4']

// Top tier the Engineering Bay can reach (base = 1, plus each ENGINEERING_LEVELS upgrade tier).
export const MAX_ENGINEERING_LEVEL = ENGINEERING_LEVELS.length + 1
export type SectionStatus = 'operational' | 'available' | 'locked'

// Storage capacity is measured in raw stored units (the sum of CargoItem amounts). The station
// starts with BASE_STORAGE_CAPACITY (the "Internal Storage"); each built Storage Extension adds
// STORAGE_EXTENSION_CAPACITY. The number of extension sections is derived from the running
// `storageCapacity`: (storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY.
export const BASE_STORAGE_CAPACITY = 1000
export const STORAGE_EXTENSION_CAPACITY = 500

// Hard cap on how many Storage Extensions can be built (and shown in the Station Layout grid).
export const MAX_STORAGE_EXTENSIONS = 3

// Power economy. The station has BASE_POWER capacity to start; each built Power Core adds
// POWER_PER_CORE. Power Cores are repeatable like Storage Extensions, capped at MAX_POWER_CORES.
// Built-core count is derived: (powerCapacity - BASE_POWER) / POWER_PER_CORE.
export const BASE_POWER = 100
export const POWER_PER_CORE = 50
export const MAX_POWER_CORES = 4

// Power each section draws while operational. Power Core draws nothing (it produces capacity);
// Storage Extensions draw per built pod. Tuned so the base modules fit under BASE_POWER and a few
// Storage Extensions push the station to the cap, forcing Power Cores to keep expanding.
export const SECTION_POWER: Record<SectionType, number> = {
  command: 10,
  research: 20,
  engineering: 30,
  'engineering-2': 10,
  'engineering-3': 15,
  'engineering-4': 20,
  storage: 10,
  power: 0,
  'storage-extension': 15
}

export interface StationSection {
  type: SectionType
  status: SectionStatus
}

export const SECTION_COSTS: Record<SectionType, Partial<Record<AsteroidMaterial, number>>> = {
  command: {},
  research: { iron: 20, copper: 10 },
  engineering: { iron: 30, titanium: 15 },
  'engineering-2': { iron: 25, titanium: 10 },
  'engineering-3': { iron: 40, titanium: 15, copper: 10 },
  'engineering-4': { iron: 60, titanium: 25, copper: 15, uranium: 2 },
  storage: { iron: 25, carbon: 15 },
  power: { copper: 10, uranium: 2 },
  'storage-extension': { iron: 20, carbon: 15 }
}

export const SECTION_NAMES: Record<SectionType, string> = {
  command: 'Command Module',
  research: 'Research Lab',
  engineering: 'Engineering Bay',
  'engineering-2': 'Engineering LVL 2',
  'engineering-3': 'Engineering LVL 3',
  'engineering-4': 'Engineering LVL 4',
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
  'engineering-2':
    'Engineering Bay upgrade tier 2. Expands the fabrication line with a second hull rig and tooling for mid-sized hulls.',
  'engineering-3':
    'Engineering Bay upgrade tier 3. Adds heavy-frame jigs and parallel addon assembly so larger ships and more upgrades flow through.',
  'engineering-4':
    'Engineering Bay upgrade tier 4. The top-tier fabrication suite — capital-grade jigs, automated welders, full upgrade throughput.',
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
  'engineering-2': 0xff8844,
  'engineering-3': 0xff8844,
  'engineering-4': 0xff8844,
  storage: 0x44ff88,
  power: 0xffdd44,
  'storage-extension': 0x44ffaa
}

// Which module must be operational to unlock this one (its "blueprint" source)
export const SECTION_BLUEPRINT: Record<SectionType, SectionType | null> = {
  command: null,
  research: 'command',
  engineering: 'research',
  // Each Engineering upgrade tier anchors to the base Engineering Bay being operational, not to the
  // previous level — the research chain handles tier-by-tier progression; each tier is otherwise an
  // independent one-time build off the base bay.
  'engineering-2': 'engineering',
  'engineering-3': 'engineering-2',
  'engineering-4': 'engineering-3',
  // Power Core anchors to the always-operational Command hub (not Engineering), so researching its
  // blueprint makes it buildable right away — mirroring how Storage Extension unlocks off the
  // pre-built Storage Hub. It also avoids a chicken-and-egg gate (Engineering itself draws power).
  power: 'command',
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
  'engineering-2',
  'engineering-3',
  'engineering-4',
  'research',
  'power',
  'storage-extension'
]

export const SECTION_IMAGES: Record<SectionType, string> = {
  command: '/images/modules/command.png',
  research: '/images/modules/research.png',
  engineering: '/images/modules/engineering_1.png',
  // Engineering upgrade tiers reuse the base bay's image — they extend the same module visually.
  'engineering-2': '/images/modules/engineering_1.png',
  'engineering-3': '/images/modules/engineering_1.png',
  'engineering-4': '/images/modules/engineering_1.png',
  storage: '/images/modules/storage.png',
  power: '/images/modules/power_1.png',
  'storage-extension': '/images/modules/storage.png'
}

export const SECTION_ICONS: Record<SectionType, string> = {
  command: '/icons/modules/module-1.svg',
  engineering: '/icons/modules/module-2.svg',
  'engineering-2': '/icons/modules/module-2.svg',
  'engineering-3': '/icons/modules/module-2.svg',
  'engineering-4': '/icons/modules/module-2.svg',
  research: '/icons/modules/module-3.svg',
  power: '/icons/modules/module-4.svg',
  storage: '/icons/modules/module-5.svg',
  'storage-extension': '/icons/modules/module-5.svg'
}
