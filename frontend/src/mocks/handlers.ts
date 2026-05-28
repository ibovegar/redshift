import type { Spacecraft, Station } from 'models'
import { BLUEPRINTS, getBlueprint, getModuleBlueprint } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType } from 'models/station-section'
import {
  BASE_STORAGE_CAPACITY,
  MAX_STORAGE_EXTENSIONS,
  SECTION_BLUEPRINT,
  SECTION_COSTS,
  STORAGE_EXTENSION_CAPACITY
} from 'models/station-section'
import { HttpResponse, http } from 'msw'
import { spacecrafts, station, user } from './data'

const url = import.meta.env.VITE_API_URL

// Fixed build time for every Engineering Bay construction — 5s for now. Builds derive their
// start/complete timestamps from this the same way research derives them from `blueprint.durationMs`.
const BUILD_DURATION_MS = 5_000

const db = {
  user: { ...user },
  spacecrafts: [...spacecrafts] as Spacecraft[],
  station: {
    ...station,
    storage: [...station.storage],
    researchedBlueprints: [...station.researchedBlueprints]
  } as Station
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

// Completes the active section build once the wall clock passes its completesAt: flips the section
// to operational (and bumps storage capacity for a storage extension), then clears the slot.
// Mirrors finalizeResearch — called at the top of any read so progress resolves without polling.
const finalizeBuild = () => {
  const task = db.station.buildInProgress
  if (!task) return
  if (Date.parse(task.completesAt) <= Date.now()) {
    const section = db.station.sections.find((s) => s.type === task.sectionType)
    if (section) section.status = 'operational'
    if (task.sectionType === 'storage-extension') {
      db.station.storageCapacity += 500
    }
    db.station.buildInProgress = null
  }
}

const deductCosts = (costs: Partial<Record<string, number>>) => {
  for (const [material, amount] of Object.entries(costs)) {
    const item = db.station.storage.find((s) => s.material === material)
    if (!item) continue
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
    finalizeBuild()
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

  // Starts a section build: deducts materials and sets `buildInProgress` with start/complete
  // timestamps derived from BUILD_DURATION_MS (5s for now), the same way research derives them
  // from `blueprint.durationMs`. The section flips to operational on a later read via
  // finalizeBuild() once the wall clock passes `completesAt`. Queue capacity is 1.
  http.post(`${url}/station/sections/build`, async ({ request }) => {
    finalizeResearch()
    finalizeBuild()
    const { type } = (await request.json()) as { type: SectionType }
    const section = db.station.sections.find((s) => s.type === type)
    // Storage Extension is repeatable: each build adds another 500 units of capacity, so it stays
    // buildable even once operational. Every other section can only be built once.
    if (!section || (section.status === 'operational' && type !== 'storage-extension')) {
      return new HttpResponse(null, { status: 400 })
    }
    // Storage Extensions are repeatable but capped — reject once the cap is reached.
    if (type === 'storage-extension') {
      const built = Math.round((db.station.storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY)
      if (built >= MAX_STORAGE_EXTENSIONS) {
        return new HttpResponse(null, { status: 400 })
      }
    }
    if (db.station.buildInProgress) {
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
    // Material deduction + storageCapacity bump happen up-front and on finalize respectively:
    // costs are charged now (so they can't be double-spent), the capacity bump lands when the
    // build completes (finalizeBuild), and the section flips to operational at the same time.
    const now = Date.now()
    db.station.buildInProgress = {
      sectionType: type,
      startedAt: new Date(now).toISOString(),
      completesAt: new Date(now + BUILD_DURATION_MS).toISOString()
    }
    return HttpResponse.json(db.station)
  }),

  // Blueprints
  http.get(`${url}/blueprints`, () => {
    return HttpResponse.json(BLUEPRINTS)
  }),

  // Research
  // Starts a research task: deducts materials and sets `researchInProgress` with start/complete
  // timestamps derived from the blueprint's `durationMs`. The task is finalized on any subsequent
  // read (`finalizeResearch()` is called at the top of GET /station etc.) once the wall clock
  // passes `completesAt`. Queue capacity is 1 so we reject if another task is already active.
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
    if (db.station.researchInProgress) {
      return HttpResponse.text(`Research already in progress: ${db.station.researchInProgress.blueprintId}`, {
        status: 400
      })
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
    const now = Date.now()
    db.station.researchInProgress = {
      blueprintId,
      startedAt: new Date(now).toISOString(),
      completesAt: new Date(now + blueprint.durationMs).toISOString()
    }
    return HttpResponse.json(db.station)
  })
]
