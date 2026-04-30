import type { Upgrade } from 'models'

const url = import.meta.env.VITE_API_URL

export const getAll = async (): Promise<Upgrade[]> => {
  const response = await fetch(`${url}/upgrades`)
  return response.json()
}

export const get = async (spacecraftId: string): Promise<Upgrade[]> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}/upgrades`)
  return response.json()
}

export const attach = async (spacecraftId: string, upgradeId: string): Promise<Upgrade> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}/upgrades/${upgradeId}`, {
    method: 'POST'
  })
  return response.json()
}

export const detach = async (spacecraftId: string, upgradeId: string): Promise<Upgrade> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}/upgrades/${upgradeId}`, {
    method: 'DELETE'
  })
  return response.json()
}
