import { BLUEPRINTS, getBlueprint, getModuleBlueprint } from 'models/blueprint'
import type { Spacecraft, Station } from 'models'
import type { CargoItem } from 'models/spacecraft'
import { SECTION_BLUEPRINT, SECTION_COSTS } from 'models/station-section'
import type { SectionType } from 'models/station-section'
import { HttpResponse, http } from 'msw'
import { spacecrafts, station, user } from './data'

const url = import.meta.env.VITE_API_URL

const db = {
  user: { ...user },
  spacecrafts: [...spacecrafts] as Spacecraft[],
  station: { ...station, storage: [...station.storage], researchedBlueprints: [...station.researchedBlueprints] } as Station
}

const finalizeResearch = () => {
  const task = db.station.researchInProgress
  if (!task) return
  if (Date.parse(task.completesAt) <= Date.now()) {
    if (!db.station.researchedBlueprints.includes(task.blueprintId)) {
      db.station.researchedBlueprints.push(task.blueprintId)
    }
    db.station.researchInProgress = null
  }
}

const deductCosts = (costs: Partial<Record<string, number>>) => {
  for (const [material, amount] of Object.entries(costs)) {
    const item = db.station.storage.find((s) => s.material === material)!
    item.amount -= amount ?? 0
    if (item.amount <= 0) {
      db.station.storage = db.station.storage.filter((s) => s.material !== material)
    }
  }
}

const hasMaterials = (costs: Partial<Record<string, number>>) =>
  Object.entries(costs).every(([material, amount]) => {
    const item = db.station.storage.find((s) => s.material === material)
    return !!item && item.amount >= (amount ?? 0)
  })

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
    finalizeResearch()
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
    finalizeResearch()
    const { type } = (await request.json()) as { type: SectionType }
    const section = db.station.sections.find((s) => s.type === type)
    if (!section || section.status === 'operational') {
      return new HttpResponse(null, { status: 400 })
    }
    const blueprintType = SECTION_BLUEPRINT[type]
    if (blueprintType) {
      const blueprintSection = db.station.sections.find((s) => s.type === blueprintType)
      if (!blueprintSection || blueprintSection.status !== 'operational') {
        return new HttpResponse(null, { status: 400 })
      }
    }
    const moduleBlueprint = getModuleBlueprint(type)
    if (moduleBlueprint && !db.station.researchedBlueprints.includes(moduleBlueprint.id)) {
      return new HttpResponse(null, { status: 400 })
    }
    const costs = SECTION_COSTS[type]
    if (!hasMaterials(costs)) {
      return new HttpResponse(null, { status: 400 })
    }
    deductCosts(costs)
    section.status = 'operational'
    return HttpResponse.json(db.station)
  }),

  // Blueprints
  http.get(`${url}/blueprints`, () => {
    return HttpResponse.json(BLUEPRINTS)
  }),

  // Research
  // Placeholder behavior until the proper Research-button + modal flow lands: clicking a research
  // card completes the research INSTANTLY if affordable. The research-module-operational gate is
  // skipped so the tree can be exercised without first building the section in StationGrid.
  http.post(`${url}/research/start`, async ({ request }) => {
    finalizeResearch()
    const { blueprintId } = (await request.json()) as { blueprintId: string }
    const blueprint = getBlueprint(blueprintId)
    if (!blueprint) {
      return HttpResponse.text(`Unknown blueprint id: ${blueprintId}`, { status: 404 })
    }
    if (db.station.researchedBlueprints.includes(blueprintId)) {
      return HttpResponse.text(`Already researched: ${blueprintId}`, { status: 400 })
    }
    if (blueprint.parentBlueprintId && !db.station.researchedBlueprints.includes(blueprint.parentBlueprintId)) {
      return HttpResponse.text(`Parent blueprint ${blueprint.parentBlueprintId} not yet researched`, { status: 400 })
    }
    if (!hasMaterials(blueprint.cost)) {
      const missing = Object.entries(blueprint.cost)
        .map(([m, need]) => {
          const have = db.station.storage.find((s) => s.material === m)?.amount ?? 0
          return have < (need ?? 0) ? `${m} (have ${have}, need ${need})` : null
        })
        .filter(Boolean)
        .join(', ')
      return HttpResponse.text(`Insufficient materials: ${missing}`, { status: 400 })
    }
    deductCosts(blueprint.cost)
    db.station.researchedBlueprints.push(blueprintId)
    db.station.researchInProgress = null
    return HttpResponse.json(db.station)
  })
]
