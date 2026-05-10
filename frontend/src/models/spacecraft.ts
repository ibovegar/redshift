import type { BaseStats } from 'models'
import type { AsteroidMaterial } from './asteroid'

export interface CargoItem {
  material: AsteroidMaterial
  amount: number
}

export interface Spacecraft {
  id: string
  name: string
  spacecraftRegistry: string
  manufacturer: string
  manufactured: number
  storeType: 'spacecraft'
  type: 'interceptor' | 'fighter' | 'bomber' | 'support' | 'scout'
  status: 'docked' | 'deployed' | 'in-transit'
  height: number
  length: number
  price: number
  baseStats: BaseStats
  condition: number
  fuel: number
  attachedUpgrades: string[]
  cargoCapacity: number
  cargo: CargoItem[]
}
