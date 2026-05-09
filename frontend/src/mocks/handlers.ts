import type { Mission, Spacecraft, Upgrade, UserStats } from 'models'
import type { CargoItem } from 'models/spacecraft'
import { HttpResponse, http } from 'msw'
import { isSpacecraft, isUpgrade } from 'utils/guards'
import { missions, spacecrafts, store, upgrades, user } from './data'

const url = import.meta.env.VITE_API_URL

const db = {
  user: { ...user } as UserStats,
  spacecrafts: [...spacecrafts] as Spacecraft[],
  upgrades: [...upgrades] as Upgrade[],
  missions: [...missions] as Mission[],
  store: [...store] as (Spacecraft | Upgrade)[]
}

let nextId = 100

export const handlers = [
  // User
  http.get(`${url}/user`, () => {
    return HttpResponse.json(db.user)
  }),

  http.patch(`${url}/user`, async ({ request }) => {
    const body = (await request.json()) as Partial<UserStats>
    Object.assign(db.user, body)
    return HttpResponse.json(db.user)
  }),

  // Missions
  http.get(`${url}/missions`, () => {
    return HttpResponse.json(db.missions)
  }),

  http.put(`${url}/missions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Mission
    const index = db.missions.findIndex((m) => m.id === params.id)
    if (index === -1) return new HttpResponse(null, { status: 404 })
    db.missions[index] = body
    return HttpResponse.json(body)
  }),

  // Spacecrafts
  http.get(`${url}/spacecrafts`, () => {
    return HttpResponse.json(db.spacecrafts)
  }),

  http.get(`${url}/spacecrafts/:id`, ({ params }) => {
    const spacecraft = db.spacecrafts.find((s) => s.id === params.id)
    if (!spacecraft) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(spacecraft)
  }),

  http.patch(`${url}/spacecrafts/:id/cargo`, async ({ params, request }) => {
    const spacecraft = db.spacecrafts.find((s) => s.id === params.id)
    if (!spacecraft) return new HttpResponse(null, { status: 404 })
    const cargo = (await request.json()) as CargoItem[]
    spacecraft.cargo = cargo
    return HttpResponse.json(spacecraft)
  }),

  // Upgrades
  http.get(`${url}/upgrades`, () => {
    return HttpResponse.json(db.upgrades)
  }),

  http.get(`${url}/spacecrafts/:spacecraftId/upgrades`, ({ params }) => {
    const filtered = db.upgrades.filter((u) => u.spacecraftId === params.spacecraftId)
    return HttpResponse.json(filtered)
  }),

  http.post(`${url}/spacecrafts/:spacecraftId/upgrades/:upgradeId`, ({ params }) => {
    const upgrade = db.upgrades.find((u) => u.id === params.upgradeId)
    if (!upgrade) return new HttpResponse(null, { status: 404 })

    upgrade.isAttached = true
    upgrade.spacecraftId = params.spacecraftId as string
    return HttpResponse.json(upgrade)
  }),

  http.delete(`${url}/spacecrafts/:spacecraftId/upgrades/:upgradeId`, ({ params }) => {
    const upgrade = db.upgrades.find((u) => u.id === params.upgradeId)
    if (!upgrade) return new HttpResponse(null, { status: 404 })

    upgrade.isAttached = false
    upgrade.spacecraftId = ''
    return HttpResponse.json(upgrade)
  }),

  // Store
  http.get(`${url}/store`, () => {
    return HttpResponse.json(db.store)
  }),

  http.post(`${url}/store/purchase`, async ({ request }) => {
    const cart = (await request.json()) as (Spacecraft | Upgrade)[]

    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0)
    if (totalPrice > db.user.credits) {
      return HttpResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    db.user.credits -= totalPrice

    const purchasedItems: (Spacecraft | Upgrade)[] = []
    for (const item of cart) {
      if (isSpacecraft(item)) {
        const newSpacecraft = { ...item, id: String(nextId++) }
        db.spacecrafts.push(newSpacecraft)
        purchasedItems.push(newSpacecraft)
      }
      if (isUpgrade(item)) {
        const newUpgrade = { ...item, id: String(nextId++) }
        db.upgrades.push(newUpgrade)
        purchasedItems.push(newUpgrade)
      }
    }

    return HttpResponse.json({ user: db.user, purchasedItems }, { status: 201 })
  })
]
