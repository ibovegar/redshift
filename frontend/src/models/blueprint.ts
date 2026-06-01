import type { AsteroidMaterial } from './asteroid'
import type { SectionType } from './station-section'

export type BlueprintCategory = 'module' | 'ship' | 'ship-addon'

export interface Blueprint {
  id: string
  category: BlueprintCategory
  name: string
  description: string
  targetId: string
  cost: Partial<Record<AsteroidMaterial, number>>
  durationMs: number
  /**
   * Dependency edge: this blueprint can only be researched once parentBlueprintId is researched.
   * The whole research tree is defined by these edges — see the ASCII diagram above BLUEPRINTS.
   */
  parentBlueprintId?: string
}

export interface ResearchTask {
  blueprintId: string
  startedAt: string
  completesAt: string
}

// Active station-section construction. Same time-based shape as ResearchTask (start/complete
// timestamps) so it maps straight onto InProgressBlock / the grid-cell progress bar. Keyed by
// section type since module builds target a station section, not a blueprint id.
export interface BuildTask {
  sectionType: SectionType
  startedAt: string
  completesAt: string
}

/**
 * Research tree (encoded via parentBlueprintId on each entry below):
 *
 *   bp-mod-command
 *     └── bp-mod-research
 *           ├── bp-mod-engineering
 *           │     ├── bp-mod-engineering-2 → bp-mod-engineering-3 → bp-mod-engineering-4
 *           │     ├── bp-ship-tellrx5   (Tellus RX 5 — support)    → engine, stabilizer, weapons
 *           │     ├── bp-ship-cygf35    (Cygnus F-35 — fighter)    → deflector, stabilizer, weapons
 *           │     ├── bp-ship-drax22    (Drax 22 — interceptor)    → engine, stabilizer, weapons
 *           │     ├── bp-ship-hamm2     (Hammerhead 2 — scout)     → deflector, stabilizer, weapons
 *           │     └── bp-ship-vanguard  (Vanguard — bomber)        → engine, plating, stabilizer, weapons
 *           ├── bp-mod-power
 *           └── bp-mod-storage
 *
 * Ship and addon targetIds are kept in sync with the image filenames in
 * `public/images/spacecraft_lg/<targetId>.png` and `public/images/upgrade_lg/<shipTargetId>_<addon>.png`
 * so ResearchCard can derive the right image path directly from the blueprint.
 *
 * Command and Research are pre-researched on a fresh station (see mocks/data.ts).
 */
type ShipAddonType = 'engine' | 'deflector' | 'plating' | 'stabilizer' | 'weapons'

const ADDON_INFO: Record<
  ShipAddonType,
  { name: string; description: string; cost: Partial<Record<AsteroidMaterial, number>> }
> = {
  engine: {
    name: 'Engine MK1',
    description: 'Schematics for a basic engine upgrade.',
    cost: { copper: 8, titanium: 4 }
  },
  deflector: {
    name: 'Deflector MK1',
    description: 'Schematics for a basic deflector array.',
    cost: { titanium: 6, silicates: 3 }
  },
  plating: {
    name: 'Plating MK1',
    description: 'Schematics for reinforced hull plating.',
    cost: { iron: 12, titanium: 6 }
  },
  stabilizer: {
    name: 'Stabilizer MK1',
    description: 'Schematics for a flight stabilizer system.',
    cost: { copper: 5, gold: 2 }
  },
  weapons: {
    name: 'Weapons MK1',
    description: 'Schematics for a basic weapons system.',
    cost: { iron: 10, antimatter: 1 }
  }
}

interface ShipFamilySpec {
  shipId: string
  targetId: string
  name: string
  description: string
  cost: Partial<Record<AsteroidMaterial, number>>
  addons: ShipAddonType[]
}

// Expands a ship's spec into ship blueprint + N addon blueprints, where each addon is one of the
// 5 known MK1 upgrade types. The addons array per ship is intentionally NOT a fixed set of 5 —
// each ship only gets the upgrades that have a corresponding image in public/images/upgrade_lg/.
const buildShipFamily = (s: ShipFamilySpec): Blueprint[] => [
  {
    id: s.shipId,
    category: 'ship',
    name: s.name,
    description: s.description,
    targetId: s.targetId,
    cost: s.cost,
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-engineering'
  },
  ...s.addons.map(
    (type): Blueprint => ({
      id: `bp-addon-${type}-${s.targetId}`,
      category: 'ship-addon',
      name: ADDON_INFO[type].name,
      description: ADDON_INFO[type].description,
      targetId: `${type}-${s.targetId}`,
      cost: ADDON_INFO[type].cost,
      durationMs: 3_000,
      parentBlueprintId: s.shipId
    })
  )
]

export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-mod-command',
    category: 'module',
    name: 'Command Module',
    description: 'Foundational schematics for the station command hub. The basis for all further research.',
    targetId: 'command',
    cost: {},
    durationMs: 0
  },
  {
    id: 'bp-mod-research',
    category: 'module',
    name: 'Research Module',
    description: 'Schematics for the research module. Unlocks all subsequent blueprint research.',
    targetId: 'research',
    cost: {},
    durationMs: 0,
    parentBlueprintId: 'bp-mod-command'
  },
  {
    id: 'bp-mod-engineering',
    category: 'module',
    name: 'Engineering Bay',
    description: 'Schematics for the Engineering Bay module. Required to construct the engineering section.',
    targetId: 'engineering',
    cost: { iron: 15, copper: 5 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-research'
  },
  // Engineering upgrade chain: each level unlocks the next blueprint and adds a stacked grid item
  // beneath the base bay once researched & built. Up to level 4.
  {
    id: 'bp-mod-engineering-2',
    category: 'module',
    name: 'Engineering LVL 2',
    description: 'Schematics expanding the Engineering Bay to tier 2 — a second hull rig for mid-sized hulls.',
    targetId: 'engineering-2',
    cost: { iron: 20, copper: 10 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-engineering'
  },
  {
    id: 'bp-mod-engineering-3',
    category: 'module',
    name: 'Engineering LVL 3',
    description: 'Schematics for tier 3 Engineering — heavy-frame jigs and parallel addon assembly lines.',
    targetId: 'engineering-3',
    cost: { iron: 30, copper: 15, titanium: 5 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-engineering-2'
  },
  {
    id: 'bp-mod-engineering-4',
    category: 'module',
    name: 'Engineering LVL 4',
    description: 'Schematics for tier 4 Engineering — capital-grade jigs and full automated upgrade throughput.',
    targetId: 'engineering-4',
    cost: { iron: 40, copper: 20, titanium: 10 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-engineering-3'
  },
  {
    id: 'bp-mod-power',
    category: 'module',
    name: 'Power Core',
    description: 'Schematics for the Power Core module. Required to construct the power section.',
    targetId: 'power',
    cost: { copper: 10, uranium: 2 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-research'
  },
  {
    id: 'bp-mod-storage',
    category: 'module',
    name: 'Storage Hub',
    description: 'Schematics for the Storage Hub. Required to construct the storage hub section.',
    targetId: 'storage',
    cost: { iron: 10, carbon: 5 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-research'
  },
  {
    // Buildable upgrade — each one researched + constructed grows the station's storage
    // capacity and reveals the cargo-pod mesh in the 3D scene.
    id: 'bp-mod-storage-extension',
    category: 'module',
    name: 'Storage Extension',
    description: 'Schematics for a cargo-pod extension that grows the station storage capacity.',
    targetId: 'storage-extension',
    cost: { iron: 15, carbon: 8 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-storage'
  },
  ...buildShipFamily({
    shipId: 'bp-ship-tellrx5',
    targetId: 'tellrx5',
    name: 'Tellus RX 5',
    description: 'Manufacturing blueprints for the Tellus RX 5 support spacecraft.',
    cost: { iron: 50, titanium: 20, silicates: 10 },
    addons: ['engine', 'stabilizer', 'weapons']
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-cygf35',
    targetId: 'cygf35',
    name: 'Cygnus F-35',
    description: 'High-precision strike fighter. Balanced firepower, armor, and agility.',
    cost: { iron: 60, titanium: 25, silicates: 12 },
    addons: ['deflector', 'stabilizer', 'weapons']
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-drax22',
    targetId: 'drax22',
    name: 'Drax 22',
    description: 'Light interceptor optimized for speed and quick engagements.',
    cost: { iron: 35, titanium: 10, copper: 8 },
    addons: ['engine', 'stabilizer', 'weapons']
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-hamm2',
    targetId: 'hamm2',
    name: 'Hammerhead 2',
    description: 'Stealthy long-range reconnaissance scout. Low signature, high sensor range.',
    cost: { iron: 30, silicates: 15, gold: 2 },
    addons: ['deflector', 'stabilizer', 'weapons']
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-vanguard',
    targetId: 'vanguard',
    name: 'Vanguard',
    description: 'Heavy bomber. Slow but carries devastating ordnance payloads.',
    cost: { iron: 90, titanium: 40, antimatter: 3 },
    addons: ['engine', 'plating', 'stabilizer', 'weapons']
  })
]

// Storage is treated like command — pre-researched + pre-built so the station has cargo
// capacity from the start. The Storage entry in the module list is therefore always visible.
export const PRE_RESEARCHED_BLUEPRINT_IDS = ['bp-mod-command', 'bp-mod-research', 'bp-mod-storage']

export const getBlueprint = (id: string): Blueprint | undefined => BLUEPRINTS.find((bp) => bp.id === id)

export const getModuleBlueprint = (type: SectionType): Blueprint | undefined =>
  BLUEPRINTS.find((bp) => bp.category === 'module' && bp.targetId === type)

export const getBlueprintChildren = (parentId: string | undefined): Blueprint[] =>
  BLUEPRINTS.filter((bp) => bp.parentBlueprintId === parentId)

export const getBlueprintRoots = (): Blueprint[] => getBlueprintChildren(undefined)
