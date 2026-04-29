import type { Spacecraft, Upgrade } from 'models'
import { isSpacecraft, isUpgrade } from 'utils/guards'
import * as spacecraftAPI from './spacecraft.api'
import * as upgradeAPI from './upgrades.api'

const url = import.meta.env.VITE_API_URL

export const get = async (): Promise<Upgrade[]> => {
  const response = await fetch(`${url}/store`)
  return response.json()
}

export const purchase = async (cart: (Spacecraft | Upgrade)[]): Promise<(Spacecraft | Upgrade)[]> => {
  const promises: Promise<Spacecraft | Upgrade>[] = []

  for (const product of cart) {
    if (isSpacecraft(product)) {
      promises.push(spacecraftAPI.post(product))
    }
    if (isUpgrade(product)) {
      promises.push(upgradeAPI.post(product))
    }
  }

  return Promise.all(promises)
}
