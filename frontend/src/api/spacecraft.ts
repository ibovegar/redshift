import type { CargoItem, Spacecraft } from 'models'

const url = import.meta.env.VITE_API_URL

export const getAll = async (): Promise<Spacecraft[]> => {
  const response = await fetch(`${url}/spacecrafts`)
  return response.json()
}

export const get = async (spacecraftId: string): Promise<Spacecraft> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}`)
  return response.json()
}

export const updateCargo = async (spacecraftId: string, cargo: CargoItem[]): Promise<Spacecraft> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}/cargo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cargo)
  })
  return response.json()
}

export const updateStatus = async (spacecraftId: string, status: Spacecraft['status']): Promise<Spacecraft> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  return response.json()
}
