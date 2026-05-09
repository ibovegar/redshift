export type AsteroidMaterial =
  | 'iron'
  | 'titanium'
  | 'copper'
  | 'carbon'
  | 'silicates'
  | 'water_ice'
  | 'antimatter'
  | 'uranium'
  | 'helium3'
  | 'gold'

export type AsteroidClass = 'C' | 'S' | 'M' | 'V' | 'X'

export type ResourceRarity = 'common' | 'uncommon' | 'rare' | 'precious' | 'exotic'

export interface AsteroidDeposit {
  material: AsteroidMaterial
  abundance: number // 0-1 percentage
  purity: number // 0-1 quality factor
  rarity: ResourceRarity
}

export interface AsteroidStats {
  mass: number // relative mass unit
  density: number // kg/m³
  class: AsteroidClass
  deposits: AsteroidDeposit[]
  surfaceTemp: number // kelvin
  rotationPeriod: number // hours
  magneticField: number // 0-1 strength
}

export interface Asteroid {
  id: string
  name: string
  belt: 'far' | 'near' | 'belt'
  index: number
  chunkIndex: number
  instanceId: number
  scale: number
  stats: AsteroidStats
  scanned: boolean
  depleted: boolean
}
