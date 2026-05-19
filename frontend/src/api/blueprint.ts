import type { Blueprint } from 'models/blueprint'
import type { Station } from 'models/station'

const url = import.meta.env.VITE_API_URL

export const list = async (): Promise<Blueprint[]> => {
  const response = await fetch(`${url}/blueprints`)
  return response.json()
}

export const startResearch = async (blueprintId: string): Promise<Station> => {
  const response = await fetch(`${url}/research/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blueprintId })
  })
  if (!response.ok) throw new Error('Research start failed')
  return response.json()
}
