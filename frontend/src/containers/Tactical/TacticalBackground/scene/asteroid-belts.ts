import type { Asteroid } from 'models/asteroid'
import * as THREE from 'three'
import { generateAsteroidEntities } from 'utils/asteroid-generator'
import {
  ASTEROID_COUNT_FAR,
  ASTEROID_COUNT_NEAR,
  CHUNK_COUNT,
  createAsteroidData,
  createAsteroidGeometry,
  SPREAD_X,
  SPREAD_Y,
  SPREAD_Z,
  updateAsteroids
} from './asteroid-belt'

export { FAR_SPEED, NEAR_SPEED } from './asteroid-belt'

export class AsteroidBelts {
  readonly farGroup = new THREE.Group()
  readonly nearGroup = new THREE.Group()
  readonly farMeshes: THREE.InstancedMesh[]
  readonly nearMeshes: THREE.InstancedMesh[]
  readonly farAsteroids: Asteroid[]
  readonly nearAsteroids: Asteroid[]
  readonly light: THREE.DirectionalLight
  readonly fill: THREE.DirectionalLight
  readonly ambient: THREE.AmbientLight

  private readonly textures: THREE.Texture[]
  private readonly farMats: THREE.MeshStandardMaterial[]
  private readonly nearMats: THREE.MeshStandardMaterial[]
  private readonly farGeos: THREE.BufferGeometry[]
  private readonly nearGeos: THREE.BufferGeometry[]
  private readonly farData
  private readonly nearData
  private readonly farAssignments: number[]
  private readonly nearAssignments: number[]
  private readonly farCounters: number[]
  private readonly nearCounters: number[]
  private readonly dummy = new THREE.Object3D()

  constructor() {
    const textureLoader = new THREE.TextureLoader()

    // Chunk textures
    this.textures = []
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const tex = textureLoader.load(`/images/asteroids/chunk_${String(i).padStart(2, '0')}.jpg`)
      tex.colorSpace = THREE.SRGBColorSpace
      this.textures.push(tex)
    }

    // Materials
    this.farMats = this.textures.map(
      (tex) =>
        new THREE.MeshStandardMaterial({
          map: tex,
          color: 0xaaccff,
          roughness: 0.7,
          metalness: 0.05
        })
    )
    this.nearMats = this.textures.map(
      (tex) =>
        new THREE.MeshStandardMaterial({
          map: tex,
          color: 0xaaccff,
          roughness: 0.65,
          metalness: 0.05
        })
    )

    // Chunk assignments
    this.farAssignments = Array.from({ length: ASTEROID_COUNT_FAR }, () => Math.floor(Math.random() * CHUNK_COUNT))
    this.nearAssignments = Array.from({ length: ASTEROID_COUNT_NEAR }, () => Math.floor(Math.random() * CHUNK_COUNT))
    const farCounts = new Array(CHUNK_COUNT).fill(0)
    const nearCounts = new Array(CHUNK_COUNT).fill(0)
    for (const a of this.farAssignments) farCounts[a]++
    for (const a of this.nearAssignments) nearCounts[a]++

    // Far belt
    this.farGeos = Array.from({ length: CHUNK_COUNT }, (_, i) => createAsteroidGeometry(0.015, i * 3.7))
    this.farMeshes = this.farMats.map((mat, i) => {
      const mesh = new THREE.InstancedMesh(this.farGeos[i], mat, farCounts[i])
      this.farGroup.add(mesh)
      return mesh
    })
    this.farData = createAsteroidData(ASTEROID_COUNT_FAR, SPREAD_X, SPREAD_Y * 0.5, SPREAD_Z)
    for (let i = 0; i < ASTEROID_COUNT_FAR; i++) {
      this.farData.positions[i * 3 + 1] -= 0.2
    }

    // Near belt
    this.nearGeos = Array.from({ length: CHUNK_COUNT }, (_, i) => createAsteroidGeometry(0.024, i * 5.3 + 100))
    this.nearMeshes = this.nearMats.map((mat, i) => {
      const mesh = new THREE.InstancedMesh(this.nearGeos[i], mat, nearCounts[i])
      this.nearGroup.add(mesh)
      return mesh
    })
    this.nearData = createAsteroidData(ASTEROID_COUNT_NEAR, SPREAD_X, SPREAD_Y * 0.45, 0.9)
    for (let i = 0; i < ASTEROID_COUNT_NEAR; i++) {
      this.nearData.positions[i * 3 + 1] -= 0.5
      this.nearData.positions[i * 3 + 2] += 0.6
      this.nearData.scales[i] *= 1.4
    }

    this.farCounters = new Array(CHUNK_COUNT).fill(0)
    this.nearCounters = new Array(CHUNK_COUNT).fill(0)

    // Initial matrices
    updateAsteroids(this.farData, this.farMeshes, this.farAssignments, this.farCounters, 0, SPREAD_X, this.dummy, -1)
    updateAsteroids(
      this.nearData,
      this.nearMeshes,
      this.nearAssignments,
      this.nearCounters,
      0,
      SPREAD_X,
      this.dummy,
      -1
    )

    // Entity data
    this.farAsteroids = generateAsteroidEntities(
      'far',
      ASTEROID_COUNT_FAR,
      this.farData.scales,
      this.farAssignments,
      42
    )
    this.nearAsteroids = generateAsteroidEntities(
      'near',
      ASTEROID_COUNT_NEAR,
      this.nearData.scales,
      this.nearAssignments,
      137
    )

    // Lighting
    this.light = new THREE.DirectionalLight(0xffffff, 4)
    this.light.position.set(12, 4, -10)
    this.fill = new THREE.DirectionalLight(0x667799, 0.8)
    this.fill.position.set(-10, -2, 5)
    this.ambient = new THREE.AmbientLight(0x445566, 0.5)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.farGroup)
    scene.add(this.nearGroup)
    scene.add(this.light)
    scene.add(this.fill)
    scene.add(this.ambient)
  }

  findAsteroid(mesh: THREE.InstancedMesh, instanceId: number): Asteroid | null {
    const nearIdx = (this.nearMeshes as THREE.InstancedMesh[]).indexOf(mesh)
    const farIdx = (this.farMeshes as THREE.InstancedMesh[]).indexOf(mesh)
    const isNear = nearIdx >= 0
    const chunkIndex = isNear ? nearIdx : farIdx
    const list = isNear ? this.nearAsteroids : farIdx >= 0 ? this.farAsteroids : []
    return list.find((a) => a.chunkIndex === chunkIndex && a.instanceId === instanceId) ?? null
  }

  update(farSpeed: number, nearSpeed: number) {
    updateAsteroids(
      this.farData,
      this.farMeshes,
      this.farAssignments,
      this.farCounters,
      farSpeed,
      SPREAD_X,
      this.dummy,
      -1
    )
    updateAsteroids(
      this.nearData,
      this.nearMeshes,
      this.nearAssignments,
      this.nearCounters,
      nearSpeed,
      SPREAD_X,
      this.dummy,
      -1
    )
  }

  applyParallax(panX: number, panY: number) {
    this.farGroup.position.x = panX * 0.6
    this.farGroup.position.y = panY * 0.6
    this.nearGroup.position.x = panX * 0.5
    this.nearGroup.position.y = panY * 0.5
  }

  get allScanned(): Asteroid[] {
    return [...this.farAsteroids, ...this.nearAsteroids].filter((a) => a.scanned)
  }

  dispose() {
    this.farGeos.forEach((g) => {
      g.dispose()
    })
    this.nearGeos.forEach((g) => {
      g.dispose()
    })
    this.farMats.forEach((m) => {
      m.dispose()
    })
    this.nearMats.forEach((m) => {
      m.dispose()
    })
    this.textures.forEach((t) => {
      t.dispose()
    })
  }
}
