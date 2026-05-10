import type { Asteroid } from 'models/asteroid'
import * as THREE from 'three'
import { generateAsteroidEntities } from 'utils/asteroid-generator'
import {
  ASTEROID_COUNT,
  CHUNK_COUNT,
  createAsteroidData,
  createAsteroidGeometry,
  SPREAD_X,
  SPREAD_Y,
  SPREAD_Z,
  updateAsteroids
} from './asteroid-belt'

export { BELT_SPEED } from './asteroid-belt'

export class AsteroidBelts {
  readonly group = new THREE.Group()
  readonly meshes: THREE.InstancedMesh[]
  readonly asteroids: Asteroid[]
  readonly light: THREE.DirectionalLight
  readonly fill: THREE.DirectionalLight
  readonly ambient: THREE.AmbientLight

  private readonly textures: THREE.Texture[]
  private readonly mats: THREE.MeshStandardMaterial[]
  private readonly geos: THREE.BufferGeometry[]
  private readonly data
  private readonly assignments: number[]
  private readonly counters: number[]
  private readonly dummy = new THREE.Object3D()

  constructor(loadingManager?: THREE.LoadingManager) {
    const textureLoader = new THREE.TextureLoader(loadingManager)

    // Chunk textures
    this.textures = []
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const tex = textureLoader.load(`/images/asteroids/chunk_${String(i).padStart(2, '0')}.jpg`)
      tex.colorSpace = THREE.SRGBColorSpace
      this.textures.push(tex)
    }

    // Materials
    this.mats = this.textures.map(
      (tex) =>
        new THREE.MeshStandardMaterial({
          map: tex,
          color: 0xaaccff,
          roughness: 0.7,
          metalness: 0.05
        })
    )

    // Chunk assignments
    this.assignments = Array.from({ length: ASTEROID_COUNT }, () => Math.floor(Math.random() * CHUNK_COUNT))
    const counts = new Array(CHUNK_COUNT).fill(0)
    for (const a of this.assignments) counts[a]++

    // Asteroid belt
    this.geos = Array.from({ length: CHUNK_COUNT }, (_, i) => createAsteroidGeometry(0.015, i * 3.7))
    this.meshes = this.mats.map((mat, i) => {
      const mesh = new THREE.InstancedMesh(this.geos[i], mat, counts[i])
      this.group.add(mesh)
      return mesh
    })
    this.data = createAsteroidData(ASTEROID_COUNT, SPREAD_X, SPREAD_Y * 0.5, SPREAD_Z)
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      this.data.positions[i * 3 + 1] -= 0.2
    }

    this.counters = new Array(CHUNK_COUNT).fill(0)

    // Initial matrices
    updateAsteroids(this.data, this.meshes, this.assignments, this.counters, 0, SPREAD_X, this.dummy, -1)

    // Entity data
    this.asteroids = generateAsteroidEntities('belt', ASTEROID_COUNT, this.data.scales, this.assignments, 42)

    // Lighting
    this.light = new THREE.DirectionalLight(0xffffff, 4)
    this.light.position.set(12, 4, -10)
    this.fill = new THREE.DirectionalLight(0x667799, 0.8)
    this.fill.position.set(-10, -2, 5)
    this.ambient = new THREE.AmbientLight(0x445566, 0.5)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.group)
    scene.add(this.light)
    scene.add(this.fill)
    scene.add(this.ambient)
  }

  findAsteroid(mesh: THREE.InstancedMesh, instanceId: number): Asteroid | null {
    const chunkIndex = (this.meshes as THREE.InstancedMesh[]).indexOf(mesh)
    if (chunkIndex < 0) return null
    return this.asteroids.find((a) => a.chunkIndex === chunkIndex && a.instanceId === instanceId) ?? null
  }

  private get depletedSet(): Set<number> {
    const set = new Set<number>()
    for (const a of this.asteroids) {
      if (a.depleted) set.add(a.index)
    }
    return set
  }

  update(speed: number) {
    updateAsteroids(
      this.data,
      this.meshes,
      this.assignments,
      this.counters,
      speed,
      SPREAD_X,
      this.dummy,
      -1,
      this.depletedSet
    )
  }

  applyParallax(panX: number, panY: number) {
    this.group.position.x = panX * 0.6
    this.group.position.y = panY * 0.6
  }

  get allScanned(): Asteroid[] {
    return this.asteroids.filter((a) => a.scanned)
  }

  dispose() {
    this.geos.forEach((g) => {
      g.dispose()
    })
    this.mats.forEach((m) => {
      m.dispose()
    })
    this.textures.forEach((t) => {
      t.dispose()
    })
  }
}
