import type { Mission, Spacecraft, Upgrade, UserStats } from 'models'
import { HttpResponse, http } from 'msw'
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

  http.put(`${url}/user`, async ({ request }) => {
    const body = (await request.json()) as Partial<UserStats>
    db.user = { ...db.user, ...body }
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

  http.post(`${url}/spacecrafts`, async ({ request }) => {
    const body = (await request.json()) as Spacecraft
    const newSpacecraft = { ...body, id: String(nextId++) }
    db.spacecrafts.push(newSpacecraft)
    return HttpResponse.json(newSpacecraft, { status: 201 })
  }),

  // Upgrades
  http.get(`${url}/upgrades`, () => {
    return HttpResponse.json(db.upgrades)
  }),

  http.get(`${url}/spacecrafts/:spacecraftId/upgrades`, ({ params }) => {
    const filtered = db.upgrades.filter((u) => u.spacecraftId === params.spacecraftId)
    return HttpResponse.json(filtered)
  }),

  http.put(`${url}/upgrades/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Upgrade
    const index = db.upgrades.findIndex((u) => u.id === params.id)
    if (index === -1) {
      db.upgrades.push(body)
    } else {
      db.upgrades[index] = body
    }
    return HttpResponse.json(body)
  }),

  http.post(`${url}/upgrades`, async ({ request }) => {
    const body = (await request.json()) as Upgrade
    const newUpgrade = { ...body, id: String(nextId++) }
    db.upgrades.push(newUpgrade)
    return HttpResponse.json(newUpgrade, { status: 201 })
  }),

  // Store
  http.get(`${url}/store`, () => {
    return HttpResponse.json(db.store)
  })
]
