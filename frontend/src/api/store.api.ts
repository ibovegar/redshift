import type { Spacecraft, Upgrade, UserStats } from 'models'

const url = import.meta.env.VITE_API_URL

export interface PurchaseResponse {
  user: UserStats
  purchasedItems: (Spacecraft | Upgrade)[]
}

export const get = async (): Promise<(Spacecraft | Upgrade)[]> => {
  const response = await fetch(`${url}/store`)
  return response.json()
}

export const purchase = async (cart: (Spacecraft | Upgrade)[]): Promise<PurchaseResponse> => {
  const response = await fetch(`${url}/store/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return response.json()
}
