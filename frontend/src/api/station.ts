import type { CargoItem } from 'models'
import type { Station } from 'models/station'
import type { SectionType } from 'models/station-section'

const url = import.meta.env.VITE_API_URL

export const get = async (): Promise<Station> => {
  const response = await fetch(`${url}/station`)
  return response.json()
}

export const transferCargo = async (cargo: CargoItem[]): Promise<Station> => {
  const response = await fetch(`${url}/station/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cargo)
  })
  return response.json()
}

export const buildSection = async (type: SectionType): Promise<Station> => {
  const response = await fetch(`${url}/station/sections/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  })
  if (!response.ok) throw new Error('Build failed')
  return response.json()
}
