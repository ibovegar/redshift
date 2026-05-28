import type { Spacecraft, Station, UserStats } from 'models'
import { PRE_RESEARCHED_BLUEPRINT_IDS } from 'models/blueprint'

export const user: UserStats = {
  credits: 998999999,
  drillTutorialSeen: false
}

export const spacecrafts: Spacecraft[] = [
  {
    name: 'Tellus RX 5',
    spacecraftRegistry: 'tellrx5',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'support',
    status: 'docked',
    height: 219,
    length: 456,
    price: 5000000,
    baseStats: {
      speed: 45,
      hull: 70,
      shield: 55,
      damage: 20,
      manuvrability: 35
    },
    condition: 82,
    fuel: 64,
    maxFuel: 100,
    fuelConsumption: 8,
    id: '3',
    attachedUpgrades: [],
    cargoCapacity: 150,
    cargo: []
  }
]

export const station: Station = {
  id: 'station-1',
  name: 'Gateway Station',
  storageCapacity: 1000,
  // Totals ≈ 850 units against the 1000-unit Internal Storage capacity, so the storage view's
  // Internal section reads as a realistic partial (~85%) fill. Building Storage Extensions grows
  // total capacity in 500-unit steps and overflow fills the new sections.
  storage: [
    { material: 'iron', amount: 300 },
    { material: 'copper', amount: 120 },
    { material: 'carbon', amount: 150 },
    { material: 'titanium', amount: 80 },
    { material: 'silicates', amount: 100 },
    { material: 'water_ice', amount: 60 },
    { material: 'gold', amount: 20 },
    { material: 'uranium', amount: 10 },
    { material: 'helium3', amount: 8 },
    { material: 'antimatter', amount: 2 }
  ],
  sections: [
    { type: 'command', status: 'operational' },
    { type: 'engineering', status: 'locked' },
    { type: 'research', status: 'available' },
    { type: 'power', status: 'locked' },
    { type: 'storage', status: 'operational' },
    // Buildable storage-capacity upgrade — locked initially; becomes available once its
    // blueprint is researched and unlocks the cargo-pod mesh in the scene when built.
    { type: 'storage-extension', status: 'locked' }
  ],
  researchedBlueprints: [...PRE_RESEARCHED_BLUEPRINT_IDS],
  researchInProgress: null,
  buildInProgress: null
}
