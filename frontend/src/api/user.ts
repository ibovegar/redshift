import type { UserStats } from 'models'

const url = import.meta.env.VITE_API_URL

export const get = async (): Promise<UserStats> => {
  const response = await fetch(`${url}/user`)
  return response.json()
}

export const updateCredits = async (amount: number): Promise<UserStats> => {
  const response = await fetch(`${url}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credits: amount })
  })
  return response.json()
}

export const patchUser = async (data: Partial<UserStats>): Promise<UserStats> => {
  const response = await fetch(`${url}/user`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
