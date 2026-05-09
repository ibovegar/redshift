import * as THREE from 'three'

export const ASTEROID_COUNT = 750
export const BELT_SPEED = 0.00025
export const SPREAD_X = 4.8
export const SPREAD_Y = 2.4
export const SPREAD_Z = 1.8
export const CHUNK_COUNT = 16

export interface AsteroidBeltData {
  positions: Float32Array
  rotations: Float32Array
  rotationSpeeds: Float32Array
  scales: Float32Array
}

export function createAsteroidGeometry(radius: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 3)
  const pos = geo.attributes.position
  const rng = (s: number) => {
    s = Math.sin(s * 127.1 + 311.7) * 43758.5453
    return s - Math.floor(s)
  }

  // Per-axis scale gives fundamentally different shapes: flat, elongated, or round
  const scaleX = 0.15 + rng(seed * 1.1 + 0.1) * 2.5
  const scaleY = 0.15 + rng(seed * 2.3 + 0.2) * 2.5
  const scaleZ = 0.15 + rng(seed * 3.7 + 0.3) * 2.5

  // Random dent/bulge directions for organic shapes
  const dents = 4 + Math.floor(rng(seed * 5.1) * 5) // 4-8 dents per asteroid
  const dentDirs: [number, number, number, number][] = []
  for (let d = 0; d < dents; d++) {
    const dx = rng(seed * 11.3 + d * 7.1) * 2 - 1
    const dy = rng(seed * 13.7 + d * 9.3) * 2 - 1
    const dz = rng(seed * 17.1 + d * 11.7) * 2 - 1
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    const strength = (rng(seed * 19.3 + d * 3.1) - 0.5) * 0.9
    dentDirs.push([dx / len, dy / len, dz / len, strength])
  }

  // Fine displacement for subtle surface roughness
  const displaceStrength = 0.1 + rng(seed * 4.9 + 0.4) * 0.25

  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i) / radius
    const ny = pos.getY(i) / radius
    const nz = pos.getZ(i) / radius

    // Smooth dents/bulges based on dot product with random directions
    let dentFactor = 1.0
    for (const [dx, dy, dz, str] of dentDirs) {
      const dot = nx * dx + ny * dy + nz * dz
      const influence = Math.max(0, dot) ** 2
      dentFactor += str * influence
    }

    const noise = 1.0 + (rng(nx * 7.3 + ny * 13.1 + nz * 5.7 + seed) - 0.5) * displaceStrength
    const factor = noise * dentFactor
    pos.setXYZ(i, pos.getX(i) * factor * scaleX, pos.getY(i) * factor * scaleY, pos.getZ(i) * factor * scaleZ)
  }
  geo.computeVertexNormals()
  return geo
}

export function createAsteroidData(count: number, spreadX: number, spreadY: number, spreadZ: number): AsteroidBeltData {
  const positions = new Float32Array(count * 3)
  const rotations = new Float32Array(count * 3)
  const rotationSpeeds = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * spreadX * 2
    positions[i3 + 1] = (Math.random() - 0.5) * spreadY
    positions[i3 + 2] = (Math.random() - 0.5) * spreadZ

    rotations[i3] = Math.random() * Math.PI * 2
    rotations[i3 + 1] = Math.random() * Math.PI * 2
    rotations[i3 + 2] = Math.random() * Math.PI * 2

    rotationSpeeds[i3] = (Math.random() - 0.5) * 0.001
    rotationSpeeds[i3 + 1] = (Math.random() - 0.5) * 0.001
    rotationSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.001

    scales[i] = 0.01 + Math.random() ** 3 * 4.0
  }

  return { positions, rotations, rotationSpeeds, scales }
}

export function updateAsteroids(
  data: AsteroidBeltData,
  meshes: THREE.InstancedMesh[],
  assignments: number[],
  counters: number[],
  speed: number,
  spreadX: number,
  dummy: THREE.Object3D,
  arcSign: number = 1,
  depletedSet?: Set<number>
) {
  const count = data.scales.length
  for (let c = 0; c < counters.length; c++) counters[c] = 0
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    data.positions[i3] -= speed

    if (data.positions[i3] < -spreadX) {
      data.positions[i3] = spreadX + Math.random() * 10
    }

    // Arc: quadratic curve — rises from bottom-right, peaks in the middle, descends top-left
    const t = (data.positions[i3] + spreadX) / (spreadX * 2)
    const arc = arcSign * (-2.7 * (t - 0.5) * (t - 0.5) + 0.66) + (t - 0.5) * 0.9
    const yBase = data.positions[i3 + 1]

    data.rotations[i3] += data.rotationSpeeds[i3]
    data.rotations[i3 + 1] += data.rotationSpeeds[i3 + 1]
    data.rotations[i3 + 2] += data.rotationSpeeds[i3 + 2]

    dummy.position.set(data.positions[i3], yBase + arc, data.positions[i3 + 2])
    dummy.rotation.set(data.rotations[i3], data.rotations[i3 + 1], data.rotations[i3 + 2])

    // Depleted asteroids shrink to zero
    const isDepleted = depletedSet?.has(i) ?? false
    const s = isDepleted ? 0 : data.scales[i]
    dummy.scale.set(s, s, s)
    dummy.updateMatrix()
    const chunkIdx = assignments[i]
    meshes[chunkIdx].setMatrixAt(counters[chunkIdx], dummy.matrix)
    counters[chunkIdx]++
  }
  for (let c = 0; c < meshes.length; c++) {
    meshes[c].instanceMatrix.needsUpdate = true
  }
}
