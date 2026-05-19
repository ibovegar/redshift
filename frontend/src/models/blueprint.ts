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
  parentBlueprintId?: string
}

export interface ResearchTask {
  blueprintId: string
  startedAt: string
  completesAt: string
}

export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-mod-engineering',
    category: 'module',
    name: 'Engineering Bay',
    description: 'Schematics for the Engineering Bay module. Required to construct the engineering section.',
    targetId: 'engineering',
    cost: { iron: 15, copper: 5 },
    durationMs: 3_000
  },
  {
    id: 'bp-mod-power',
    category: 'module',
    name: 'Power Core',
    description: 'Schematics for the Power Core module. Required to construct the power section.',
    targetId: 'power',
    cost: { copper: 10, uranium: 2 },
    durationMs: 3_000
  },
  {
    id: 'bp-mod-storage',
    category: 'module',
    name: 'Storage Module',
    description: 'Schematics for the Storage module. Required to construct the storage section.',
    targetId: 'storage',
    cost: { iron: 10, carbon: 5 },
    durationMs: 3_000
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
  }
]

export const getBlueprint = (id: string): Blueprint | undefined => BLUEPRINTS.find((bp) => bp.id === id)

export const getModuleBlueprint = (type: SectionType): Blueprint | undefined =>
  BLUEPRINTS.find((bp) => bp.category === 'module' && bp.targetId === type)
