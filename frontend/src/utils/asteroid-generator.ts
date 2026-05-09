import type {
  Asteroid,
  AsteroidClass,
  AsteroidDeposit,
  AsteroidMaterial,
  AsteroidStats,
  ResourceRarity
} from 'models/asteroid'

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CLASS_WEIGHTS: { class: AsteroidClass; weight: number }[] = [
  { class: 'C', weight: 0.4 },
  { class: 'S', weight: 0.3 },
  { class: 'M', weight: 0.15 },
  { class: 'V', weight: 0.1 },
  { class: 'X', weight: 0.05 }
]

const CLASS_MATERIALS: Record<AsteroidClass, { materials: AsteroidMaterial[]; weights: number[] }> = {
  C: {
    materials: ['carbon', 'water_ice', 'silicates', 'copper', 'iron'],
    weights: [0.3, 0.25, 0.2, 0.15, 0.1]
  },
  S: {
    materials: ['silicates', 'iron', 'copper', 'titanium', 'carbon'],
    weights: [0.3, 0.25, 0.2, 0.15, 0.1]
  },
  M: {
    materials: ['iron', 'titanium', 'antimatter', 'gold', 'copper'],
    weights: [0.3, 0.25, 0.2, 0.15, 0.1]
  },
  V: {
    materials: ['silicates', 'iron', 'titanium', 'copper', 'carbon'],
    weights: [0.3, 0.25, 0.2, 0.15, 0.1]
  },
  X: {
    materials: ['uranium', 'helium3', 'antimatter', 'gold', 'titanium'],
    weights: [0.25, 0.25, 0.2, 0.15, 0.15]
  }
}

const GREEK = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa']
const PREFIXES = ['KR', 'VX', 'TN', 'QR', 'ZP', 'MX', 'DV', 'NR', 'FL', 'HX', 'WR', 'BN', 'CX', 'JP', 'SL']

const MATERIAL_RARITY: Record<AsteroidMaterial, ResourceRarity> = {
  iron: 'common',
  silicates: 'common',
  carbon: 'common',
  copper: 'uncommon',
  water_ice: 'uncommon',
  titanium: 'rare',
  gold: 'precious',
  antimatter: 'exotic',
  uranium: 'exotic',
  helium3: 'exotic'
}

function pickWeighted<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function generateName(seed: number, index: number, rand: () => number): string {
  const prefix = PREFIXES[Math.abs(seed + index) % PREFIXES.length]
  const greek = GREEK[Math.floor(rand() * GREEK.length)]
  const num = Math.floor(rand() * 9000 + 1000)
  return `${prefix}-${num} ${greek}`
}

function generateDeposits(asteroidClass: AsteroidClass, scale: number, rand: () => number): AsteroidDeposit[] {
  const config = CLASS_MATERIALS[asteroidClass]

  // Scale determines deposit count: small (1-2), medium (2-4), large (4-7)
  const scaleNorm = Math.min(1, scale / 2.5)
  const minDeposits = 1 + Math.floor(scaleNorm * 3)
  const maxDeposits = minDeposits + 1 + Math.floor(rand() * 2)
  const depositCount = Math.min(maxDeposits, config.materials.length)

  const deposits: AsteroidDeposit[] = []
  const used = new Set<AsteroidMaterial>()

  for (let i = 0; i < depositCount; i++) {
    let material: AsteroidMaterial
    let attempts = 0
    do {
      material = pickWeighted(config.materials, config.weights, rand)
      attempts++
    } while (used.has(material) && attempts < 10)

    if (used.has(material)) continue
    used.add(material)

    const baseAbundance = rand() * 0.6 + 0.05
    const scaleFactor = Math.min(2, scale / 1.5)
    const abundance = Math.min(0.95, baseAbundance * scaleFactor)
    const purity = rand() * 0.7 + 0.1
    const rarity = MATERIAL_RARITY[material]

    deposits.push({ material, abundance, purity, rarity })
  }

  return deposits
}

function generateStats(asteroidClass: AsteroidClass, scale: number, rand: () => number): AsteroidStats {
  const mass = scale ** 3 * (800 + rand() * 2000)
  const density = 1500 + rand() * 4000
  const surfaceTemp = 80 + rand() * 250
  const rotationPeriod = 2 + rand() * 20
  const magneticField = rand() * 0.4 + (asteroidClass === 'M' ? 0.3 : 0)
  const deposits = generateDeposits(asteroidClass, scale, rand)

  return { mass, density, class: asteroidClass, deposits, surfaceTemp, rotationPeriod, magneticField }
}

export function generateAsteroidEntities(
  belt: 'far' | 'near',
  count: number,
  scales: Float32Array,
  assignments: number[],
  baseSeed: number
): Asteroid[] {
  const asteroids: Asteroid[] = []
  const instanceCounters = new Array(16).fill(0)

  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 7919
    const rand = mulberry32(seed)
    const scale = scales[i]
    const chunkIndex = assignments[i]
    const instanceId = instanceCounters[chunkIndex]++

    const asteroidClass = pickWeighted(
      CLASS_WEIGHTS.map((c) => c.class),
      CLASS_WEIGHTS.map((c) => c.weight),
      rand
    )

    const stats = generateStats(asteroidClass, scale, rand)
    const name = generateName(baseSeed, i, rand)

    asteroids.push({
      id: `${belt}-${i}`,
      name,
      belt,
      index: i,
      chunkIndex,
      instanceId,
      scale,
      stats,
      scanned: false,
      depleted: false
    })
  }

  return asteroids
}
