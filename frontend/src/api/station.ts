import type { CargoItem } from 'models'
import type { Station } from 'models/station'

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
