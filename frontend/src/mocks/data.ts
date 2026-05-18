import type { Spacecraft, Station, UserStats } from 'models'

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
  storage: [
    { material: 'iron', amount: 50 },
    { material: 'copper', amount: 20 }
  ],
  sections: [
    { type: 'command', status: 'operational' },
    { type: 'engineering', status: 'locked' },
    { type: 'research', status: 'locked' },
    { type: 'power', status: 'locked' },
    { type: 'storage', status: 'locked' }
  ]
}
