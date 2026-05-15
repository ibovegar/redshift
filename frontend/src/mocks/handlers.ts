import type { Spacecraft, Station } from 'models'
import type { CargoItem } from 'models/spacecraft'
import { SECTION_COSTS } from 'models/station-section'
import type { SectionType } from 'models/station-section'
import { HttpResponse, http } from 'msw'
import { spacecrafts, station, user } from './data'

const url = import.meta.env.VITE_API_URL

const db = {
  user: { ...user },
  spacecrafts: [...spacecrafts] as Spacecraft[],
  station: { ...station, storage: [...station.storage] } as Station
}

export const handlers = [
  // User
  http.get(`${url}/user`, () => {
    return HttpResponse.json(db.user)
  }),

  http.patch(`${url}/user`, async ({ request }) => {
    const body = (await request.json()) as Partial<typeof db.user>
    Object.assign(db.user, body)
    return HttpResponse.json(db.user)
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

  http.patch(`${url}/spacecrafts/:id/status`, async ({ params, request }) => {
    const spacecraft = db.spacecrafts.find((s) => s.id === params.id)
    if (!spacecraft) return new HttpResponse(null, { status: 404 })
    const { status } = (await request.json()) as { status: Spacecraft['status'] }
    spacecraft.status = status
    return HttpResponse.json(spacecraft)
  }),

  http.patch(`${url}/spacecrafts/:id/fuel`, async ({ params, request }) => {
    const spacecraft = db.spacecrafts.find((s) => s.id === params.id)
    if (!spacecraft) return new HttpResponse(null, { status: 404 })
    const { fuel } = (await request.json()) as { fuel: number }
    spacecraft.fuel = fuel
    return HttpResponse.json(spacecraft)
  }),

  // Station
  http.get(`${url}/station`, () => {
    return HttpResponse.json(db.station)
  }),

  http.post(`${url}/station/transfer`, async ({ request }) => {
    const incoming = (await request.json()) as CargoItem[]
    for (const item of incoming) {
      if (item.amount <= 0) continue
      const existing = db.station.storage.find((s) => s.material === item.material)
      if (existing) {
        existing.amount += item.amount
      } else {
        db.station.storage.push({ material: item.material, amount: item.amount })
      }
    }
    return HttpResponse.json(db.station)
  }),

  http.post(`${url}/station/sections/build`, async ({ request }) => {
    const { type } = (await request.json()) as { type: SectionType }
    const section = db.station.sections.find((s) => s.type === type)
    if (!section || section.status !== 'available') {
      return new HttpResponse(null, { status: 400 })
    }
    const costs = SECTION_COSTS[type]
    for (const [material, amount] of Object.entries(costs)) {
      const item = db.station.storage.find((s) => s.material === material)
      if (!item || item.amount < amount) {
        return new HttpResponse(null, { status: 400 })
      }
    }
    for (const [material, amount] of Object.entries(costs)) {
      const item = db.station.storage.find((s) => s.material === material)!
      item.amount -= amount
      if (item.amount <= 0) {
        db.station.storage = db.station.storage.filter((s) => s.material !== material)
      }
    }
    section.status = 'operational'
    // Unlock next sections based on what was just built
    if (type === 'research') {
      for (const s of db.station.sections) {
        if (s.type === 'engineering' || s.type === 'storage') s.status = 'available'
      }
    } else if (type === 'engineering') {
      for (const s of db.station.sections) {
        if (s.type === 'power') s.status = 'available'
      }
    }
    return HttpResponse.json(db.station)
  })
]
