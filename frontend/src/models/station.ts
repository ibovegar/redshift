import type { CargoItem } from './spacecraft'

export interface Station {
  id: string
  name: string
  storage: CargoItem[]
}
