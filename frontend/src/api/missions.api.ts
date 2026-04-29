import type { Mission } from 'models'

const url = import.meta.env.VITE_API_URL

export const getAll = async (): Promise<Mission[]> => {
  const response = await fetch(`${url}/missions`)
  return response.json()
}

export const update = async (mission: Mission): Promise<Mission> => {
  const response = await fetch(`${url}/missions/${mission.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mission)
  })
  return response.json()
}
