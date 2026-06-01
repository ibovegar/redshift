import type { Spacecraft, Station } from 'models'
import { BLUEPRINTS, getBlueprint, getModuleBlueprint } from 'models/blueprint'
import { type QueueItem, queuedBuildCount } from 'models/queue'
import type { CargoItem } from 'models/spacecraft'
import { computePower } from 'models/station'
import type { SectionType } from 'models/station-section'
import {
  BASE_POWER,
  BASE_STORAGE_CAPACITY,
  MAX_POWER_CORES,
  MAX_STORAGE_EXTENSIONS,
  POWER_PER_CORE,
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
    researchedBlueprints: [...station.researchedBlueprints],
    queue: [...station.queue]
  } as Station
}

// Applies a finished item's effect: research adds the blueprint; a build flips its section
// operational and bumps the relevant capacity. The item's cost is also deducted here (NOT at
// enqueue) so the player's storage only drops once the previous module is actually online — that's
// what drives the "Insufficient materials" indicator on the next module in the chain.
const applyQueueItem = (item: QueueItem) => {
  if (item.kind === 'research') {
    if (!db.station.researchedBlueprints.includes(item.targetId)) {
      db.station.researchedBlueprints.push(item.targetId)
    }
    const blueprint = getBlueprint(item.targetId)
    if (blueprint) deductCosts(blueprint.cost)
    return
  }
  const type = item.targetId as SectionType
  const section = db.station.sections.find((s) => s.type === type)
  if (section) section.status = 'operational'
  if (type === 'storage-extension') db.station.storageCapacity += 500
  if (type === 'power') db.station.powerCapacity += POWER_PER_CORE
  deductCosts(SECTION_COSTS[type])
}

// Drives the unified queue: completes any active item whose completesAt has passed (applying its
// effect), then activates the next pending item of each kind if that lane is idle — so at most one
// research and one build run at a time, in queue order. Called at the top of any read/mutation.
const processQueue = () => {
  const now = Date.now()
  db.station.queue = db.station.queue.filter((item) => {
    if (item.completesAt && Date.parse(item.completesAt) <= now) {
      applyQueueItem(item)
      return false
    }
    return true
  })
  for (const kind of ['research', 'build'] as const) {
    if (db.station.queue.some((i) => i.kind === kind && i.completesAt)) continue
    const next = db.station.queue.find((i) => i.kind === kind && !i.completesAt)
    if (!next) continue
    const duration = kind === 'research' ? (getBlueprint(next.targetId)?.durationMs ?? 0) : BUILD_DURATION_MS
    const start = Date.now()
    next.startedAt = new Date(start).toISOString()
    next.completesAt = new Date(start + duration).toISOString()
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

const costForQueueItem = (item: QueueItem): Partial<Record<string, number>> => {
  if (item.kind === 'research') return getBlueprint(item.targetId)?.cost ?? {}
  return SECTION_COSTS[item.targetId as SectionType] ?? {}
}

// Total cost of every item currently waiting in the queue (active + pending). Used at enqueue to
// reject items the queue can't pay for once all the already-queued items complete — even though
// the actual deduction now happens at completion (applyQueueItem), not at enqueue.
const sumQueuedCosts = (): Partial<Record<string, number>> => {
  const totals: Partial<Record<string, number>> = {}
  for (const queued of db.station.queue) {
    for (const [material, amount] of Object.entries(costForQueueItem(queued))) {
      if (!amount) continue
      totals[material] = (totals[material] ?? 0) + amount
    }
  }
  return totals
}

// At-enqueue affordability: current storage minus everything already in the queue must still cover
// the new item's cost. Prevents queueing a chain the player can't actually pay for once each item
// completes — the deduction itself happens at completion in applyQueueItem.
const hasMaterials = (costs: Partial<Record<string, number>>) => {
  const reserved = sumQueuedCosts()
  return Object.entries(costs).every(([material, amount]) => {
    const item = db.station.storage.find((s) => s.material === material)
    const have = item?.amount ?? 0
    const alreadyReserved = reserved[material] ?? 0
    return have - alreadyReserved >= (amount ?? 0)
  })
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
    processQueue()
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

  // Enqueues a section build: validates against (current storage − already-queued reservations),
  // then pushes a pending QueueItem. processQueue() activates it if the build lane is idle. The
  // actual cost deduction happens at completion in applyQueueItem, NOT here — so the storage panel
  // only drops once a module finishes and "Insufficient materials" only surfaces on the next item
  // once the previous one is online.
  http.post(`${url}/station/sections/build`, async ({ request }) => {
    processQueue()
    const { type } = (await request.json()) as { type: SectionType }
    const section = db.station.sections.find((s) => s.type === type)
    // Storage Extension and Power Core are repeatable: each build adds capacity, so they stay
    // buildable even once operational. Every other section can only be built (or queued) once.
    const repeatable = type === 'storage-extension' || type === 'power'
    const queuedOfType = queuedBuildCount(db.station.queue, type)
    if (!section || (section.status === 'operational' && !repeatable)) {
      return new HttpResponse(null, { status: 400 })
    }
    if (!repeatable && queuedOfType > 0) {
      return new HttpResponse(null, { status: 400 })
    }
    // Repeatable sections are capped — count built + already-queued so the queue can't exceed it.
    if (type === 'storage-extension') {
      const built = Math.round((db.station.storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY)
      if (built + queuedOfType >= MAX_STORAGE_EXTENSIONS) {
        return new HttpResponse(null, { status: 400 })
      }
    }
    if (type === 'power') {
      const built = Math.round((db.station.powerCapacity - BASE_POWER) / POWER_PER_CORE)
      if (built + queuedOfType >= MAX_POWER_CORES) {
        return new HttpResponse(null, { status: 400 })
      }
    }
    // Power gate (binary): at max power the station can only build Power Cores.
    if (type !== 'power' && computePower(db.station).atMax) {
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
    db.station.queue.push({ id: crypto.randomUUID(), kind: 'build', targetId: type })
    processQueue()
    return HttpResponse.json(db.station)
  }),

  // Blueprints
  http.get(`${url}/blueprints`, () => {
    return HttpResponse.json(BLUEPRINTS)
  }),

  // Research
  // Enqueues a research task: validates against (current storage − already-queued reservations),
  // then pushes a pending QueueItem. processQueue() activates it if the research lane is idle. Cost
  // is deducted at completion in applyQueueItem (see the build handler above for the rationale).
  http.post(`${url}/research/start`, async ({ request }) => {
    processQueue()
    const { blueprintId } = (await request.json()) as { blueprintId: string }
    const blueprint = getBlueprint(blueprintId)
    if (!blueprint) {
      return HttpResponse.text(`Unknown blueprint id: ${blueprintId}`, { status: 404 })
    }
    if (db.station.researchedBlueprints.includes(blueprintId)) {
      return HttpResponse.text(`Already researched: ${blueprintId}`, { status: 400 })
    }
    if (db.station.queue.some((i) => i.kind === 'research' && i.targetId === blueprintId)) {
      return HttpResponse.text(`Already queued: ${blueprintId}`, { status: 400 })
    }
    // Power gate: at max power, research is blocked — except the Power Core blueprint, so a player
    // who hit the cap without it researched can still unlock cores and recover.
    if (blueprintId !== 'bp-mod-power' && computePower(db.station).atMax) {
      return HttpResponse.text('Insufficient power: build a Power Core to free up capacity', { status: 400 })
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
    db.station.queue.push({ id: crypto.randomUUID(), kind: 'research', targetId: blueprintId })
    processQueue()
    return HttpResponse.json(db.station)
  }),

  // Removes a queued (or active) item from the queue and re-activates the next. No refund: costs
  // are now deducted at completion (applyQueueItem), so a cancelled item never paid anything.
  http.post(`${url}/station/queue/cancel`, async ({ request }) => {
    processQueue()
    const { id } = (await request.json()) as { id: string }
    const item = db.station.queue.find((i) => i.id === id)
    if (!item) return new HttpResponse(null, { status: 404 })
    db.station.queue = db.station.queue.filter((i) => i.id !== id)
    processQueue()
    return HttpResponse.json(db.station)
  })
]
