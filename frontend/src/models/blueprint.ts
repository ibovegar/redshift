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

/**
 * Research tree (encoded via parentBlueprintId on each entry below):
 *
 *   bp-mod-command
 *     └── bp-mod-research
 *           ├── bp-mod-engineering
 *           │     ├── bp-ship-tellrx5  (Tellus RX 5 — support)
 *           │     │     └── 5 × bp-addon-{engine|deflector|plating|stabilizer|weapons}-tellrx5
 *           │     ├── bp-ship-wraith   (Wraith — scout)
 *           │     │     └── 5 × bp-addon-…-wraith
 *           │     ├── bp-ship-sting    (Sting — interceptor)
 *           │     │     └── 5 × bp-addon-…-sting
 *           │     ├── bp-ship-talon    (Talon — fighter)
 *           │     │     └── 5 × bp-addon-…-talon
 *           │     └── bp-ship-maul     (Maul — bomber)
 *           │           └── 5 × bp-addon-…-maul
 *           ├── bp-mod-power
 *           └── bp-mod-storage
 *
 * Command and Research are pre-researched on a fresh station (see mocks/data.ts).
 */
// Each ship gets the same five MK1 upgrade slots — engine, deflector, plating, stabilizer,
// weapons. This helper expands a ship's spec into a 6-entry slice (ship + its 5 addons) so the
// BLUEPRINTS array below stays readable when we list 5 ships.
interface ShipFamilySpec {
  shipId: string
  targetId: string
  name: string
  description: string
  cost: Partial<Record<AsteroidMaterial, number>>
}

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
  {
    id: `bp-addon-engine-${s.targetId}`,
    category: 'ship-addon',
    name: 'Engine MK1',
    description: 'Schematics for a basic engine upgrade.',
    targetId: `engine-${s.targetId}`,
    cost: { copper: 8, titanium: 4 },
    durationMs: 3_000,
    parentBlueprintId: s.shipId
  },
  {
    id: `bp-addon-deflector-${s.targetId}`,
    category: 'ship-addon',
    name: 'Deflector MK1',
    description: 'Schematics for a basic deflector array.',
    targetId: `deflector-${s.targetId}`,
    cost: { titanium: 6, silicates: 3 },
    durationMs: 3_000,
    parentBlueprintId: s.shipId
  },
  {
    id: `bp-addon-plating-${s.targetId}`,
    category: 'ship-addon',
    name: 'Plating MK1',
    description: 'Schematics for reinforced hull plating.',
    targetId: `plating-${s.targetId}`,
    cost: { iron: 12, titanium: 6 },
    durationMs: 3_000,
    parentBlueprintId: s.shipId
  },
  {
    id: `bp-addon-stabilizer-${s.targetId}`,
    category: 'ship-addon',
    name: 'Stabilizer MK1',
    description: 'Schematics for a flight stabilizer system.',
    targetId: `stabilizer-${s.targetId}`,
    cost: { copper: 5, gold: 2 },
    durationMs: 3_000,
    parentBlueprintId: s.shipId
  },
  {
    id: `bp-addon-weapons-${s.targetId}`,
    category: 'ship-addon',
    name: 'Weapons MK1',
    description: 'Schematics for a basic weapons system.',
    targetId: `weapons-${s.targetId}`,
    cost: { iron: 10, antimatter: 1 },
    durationMs: 3_000,
    parentBlueprintId: s.shipId
  }
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
    name: 'Storage Module',
    description: 'Schematics for the Storage module. Required to construct the storage section.',
    targetId: 'storage',
    cost: { iron: 10, carbon: 5 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-research'
  },
  {
    id: 'bp-ship-tellrx5',
    category: 'ship',
    name: 'Tellus RX 5',
    description: 'Manufacturing blueprints for the Tellus RX 5 support spacecraft.',
    targetId: 'tellrx5',
    cost: { iron: 50, titanium: 20, silicates: 10 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-mod-engineering'
  },
  {
    id: 'bp-addon-engine-mk1',
    category: 'ship-addon',
    name: 'Engine MK1',
    description: 'Schematics for a basic engine upgrade.',
    targetId: 'engine-mk1',
    cost: { copper: 8, titanium: 4 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-ship-tellrx5'
  },
  {
    id: 'bp-addon-deflector-mk1',
    category: 'ship-addon',
    name: 'Deflector MK1',
    description: 'Schematics for a basic deflector array.',
    targetId: 'deflector-mk1',
    cost: { titanium: 6, silicates: 3 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-ship-tellrx5'
  },
  {
    id: 'bp-addon-plating-mk1',
    category: 'ship-addon',
    name: 'Plating MK1',
    description: 'Schematics for reinforced hull plating.',
    targetId: 'plating-mk1',
    cost: { iron: 12, titanium: 6 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-ship-tellrx5'
  },
  {
    id: 'bp-addon-stabilizer-mk1',
    category: 'ship-addon',
    name: 'Stabilizer MK1',
    description: 'Schematics for a flight stabilizer system.',
    targetId: 'stabilizer-mk1',
    cost: { copper: 5, gold: 2 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-ship-tellrx5'
  },
  {
    id: 'bp-addon-weapons-mk1',
    category: 'ship-addon',
    name: 'Weapons MK1',
    description: 'Schematics for a basic weapons system.',
    targetId: 'weapons-mk1',
    cost: { iron: 10, antimatter: 1 },
    durationMs: 3_000,
    parentBlueprintId: 'bp-ship-tellrx5'
  },
  ...buildShipFamily({
    shipId: 'bp-ship-wraith',
    targetId: 'wraith',
    name: 'Wraith',
    description: 'Stealthy long-range reconnaissance scout. Low signature, high sensor range.',
    cost: { iron: 30, silicates: 15, gold: 2 }
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-sting',
    targetId: 'sting',
    name: 'Sting',
    description: 'Light interceptor optimized for speed and quick engagements.',
    cost: { iron: 35, titanium: 10, copper: 8 }
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-talon',
    targetId: 'talon',
    name: 'Talon',
    description: 'Mainline strike fighter — balanced firepower, armor, and agility.',
    cost: { iron: 60, titanium: 25, silicates: 12 }
  }),
  ...buildShipFamily({
    shipId: 'bp-ship-maul',
    targetId: 'maul',
    name: 'Maul',
    description: 'Heavy bomber. Slow but carries devastating ordnance payloads.',
    cost: { iron: 90, titanium: 40, antimatter: 3 }
  })
]

export const PRE_RESEARCHED_BLUEPRINT_IDS = ['bp-mod-command', 'bp-mod-research']

export const getBlueprint = (id: string): Blueprint | undefined => BLUEPRINTS.find((bp) => bp.id === id)

export const getModuleBlueprint = (type: SectionType): Blueprint | undefined =>
  BLUEPRINTS.find((bp) => bp.category === 'module' && bp.targetId === type)

export const getBlueprintChildren = (parentId: string | undefined): Blueprint[] =>
  BLUEPRINTS.filter((bp) => bp.parentBlueprintId === parentId)

export const getBlueprintRoots = (): Blueprint[] => getBlueprintChildren(undefined)
