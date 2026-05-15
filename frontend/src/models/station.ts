import type { CargoItem } from './spacecraft'
import type { StationSection } from './station-section'

export interface Station {
  id: string
  name: string
  storage: CargoItem[]
  sections: StationSection[]
}
