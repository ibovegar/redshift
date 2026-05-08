import type { BaseStats } from 'models'

export interface Spacecraft {
  id: string
  name: string
  spacecraftRegistry: string
  manufacturer: string
  manufactured: number
  storeType: 'spacecraft'
  type: 'interceptor' | 'fighter' | 'bomber' | 'support' | 'scout'
  height: number
  length: number
  price: number
  baseStats: BaseStats
  condition: number
  fuel: number
  attachedUpgrades: string[]
}
