import { SECTION_COLORS } from 'models/station-section'
import type { SectionType, StationSection } from 'models/station-section'
import * as THREE from 'three'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export interface StationConfig {
  modelPath: string
  position: [number, number, number]
  ringTilt: [number, number, number]
  camOffset: number
}

// Maps GLB top-level group names → game section types
const MODULE_TO_SECTION: Record<string, SectionType> = {
  International_Habitation_Module: 'command',
  Habitation_And_Logistics_Outpost: 'command',
  Canadarm: 'command',
  Power_And_Propulsion_Element: 'power',
  Orion: 'research',
  Espirit_Refueller: 'research',
  CrewAirlock: 'engineering',
  Human_Lander_System: 'engineering',
  Logistics_Vehicle: 'storage'
}

const FADE_DURATION_MS = 1200
const BUILD_PULSE_BASE = 0.2
const BUILD_PULSE_AMP = 0.15
const BUILD_PULSE_SPEED = 3

interface FadeState {
  materials: THREE.Material[]
  startTime: number
}

/**
 * Additive overlay that mirrors a set of source meshes for a glow/highlight effect.
 * Reused for both section hover (white tint per color) and build-in-progress (pulsing blue).
 */
class HighlightOverlay {
  private group = new THREE.Group()
  private mat: THREE.MeshBasicMaterial
  private sourceMap = new Map<THREE.Mesh, THREE.Mesh>()
  private scene: THREE.Scene

  constructor(scene: THREE.Scene, params: { color: number; opacity: number }) {
    this.scene = scene
    this.mat = new THREE.MeshBasicMaterial({
      color: params.color,
      transparent: true,
      opacity: params.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    })
    this.group.visible = false
    scene.add(this.group)
  }

  show(sources: Iterable<THREE.Object3D>) {
    this.group.clear()
    this.sourceMap.clear()
    for (const obj of sources) {
      obj.traverse((o) => {
        if (o instanceof THREE.Mesh && o.geometry) {
          const clone = new THREE.Mesh(o.geometry, this.mat)
          clone.matrixAutoUpdate = false
          this.group.add(clone)
          this.sourceMap.set(clone, o)
        }
      })
    }
    this.group.visible = true
  }

  hide() {
    this.group.visible = false
    this.group.clear()
    this.sourceMap.clear()
  }

  setColor(hex: number) {
    this.mat.color.setHex(hex)
  }

  setOpacity(opacity: number) {
    this.mat.opacity = opacity
  }

  get visible() {
    return this.group.visible
  }

  /** Copy world matrix from each source mesh so the overlay tracks station motion/rotation. */
  sync() {
    if (!this.group.visible) return
    for (const child of this.group.children) {
      const source = this.sourceMap.get(child as THREE.Mesh)
      if (source) {
        source.updateWorldMatrix(true, false)
        child.matrixWorld.copy(source.matrixWorld)
        child.matrix.copy(source.matrixWorld)
      }
    }
  }

  dispose() {
    this.scene.remove(this.group)
    this.mat.dispose()
    this.sourceMap.clear()
  }
}

function projectToScreen(point: THREE.Vector3, camera: THREE.Camera): { x: number; y: number } {
  const p = point.clone().project(camera)
  return {
    x: (p.x * 0.5 + 0.5) * window.innerWidth,
    y: (-p.y * 0.5 + 0.5) * window.innerHeight
  }
}

export class Station {
  config: StationConfig
  model: THREE.Group | null = null
  hitDisc: THREE.Mesh
  ringGroup: THREE.Group
  blockRingGroup: THREE.Group
  isSelected = false
  private camTarget: THREE.Vector3

  private sectionGroups = new Map<SectionType, THREE.Object3D[]>()
  private sectionMeshes = new Map<SectionType, THREE.Mesh[]>()
  private visibleSections = new Set<SectionType>()
  private fadingSections = new Map<SectionType, FadeState>()
  private groupsParsed = false
  private firstApply = true

  private hoverOverlay: HighlightOverlay | null = null
  private buildOverlay: HighlightOverlay | null = null

  constructor(config: StationConfig) {
    this.config = config
    this.camTarget = new THREE.Vector3(
      config.position[0],
      config.position[1] + 0.01,
      config.position[2] + config.camOffset
    )

    this.hitDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    )
    this.hitDisc.position.set(...config.position)

    this.ringGroup = new THREE.Group()
    this.ringGroup.position.set(...config.position)
    this.ringGroup.rotation.set(...config.ringTilt)

    const ringRadius = 0.58
    const blockCount = 48
    const blockWidth = 0.02
    const blockHeight = 0.04
    const blockDepth = 0.005
    const blockGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth)
    const blockMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const blockGlowGeo = new THREE.BoxGeometry(blockWidth * 2.5, blockHeight * 2.5, blockDepth * 2)
    const blockGlowMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    this.blockRingGroup = new THREE.Group()
    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2
      const x = Math.cos(angle) * ringRadius
      const z = Math.sin(angle) * ringRadius
      const glow = new THREE.Mesh(blockGlowGeo, blockGlowMat)
      glow.position.set(x, 0, z)
      glow.rotation.y = -angle
      this.blockRingGroup.add(glow)
      const block = new THREE.Mesh(blockGeo, blockMat)
      block.position.set(x, 0, z)
      block.rotation.y = -angle
      this.blockRingGroup.add(block)
    }

    const solidRingGeo = new THREE.TorusGeometry(ringRadius, 0.005, 16, 64)
    const solidRingMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const solidRing = new THREE.Mesh(solidRingGeo, solidRingMat)
    solidRing.rotation.x = Math.PI / 2
    this.blockRingGroup.add(solidRing)
    this.ringGroup.add(this.blockRingGroup)
    this.ringGroup.visible = false
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.hitDisc)
    scene.add(this.ringGroup)
    this.hoverOverlay = new HighlightOverlay(scene, { color: 0xffffff, opacity: 0.35 })
    this.buildOverlay = new HighlightOverlay(scene, { color: 0x4488ff, opacity: 0.3 })
  }

  load(loader: GLTFLoader, onLoad?: () => void) {
    loader.load(this.config.modelPath, (gltf) => {
      this.model = gltf.scene
      this.model.position.set(...this.config.position)
      this.model.rotation.x = Math.PI / 6
      this.model.rotation.y = Math.PI / 3
      this.model.scale.setScalar(0.025)
      this.ringGroup.parent?.add(this.model)
      onLoad?.()
    })
  }

  // ─── Section group management ────────────────────────────────────────────

  private parseGroups() {
    if (this.groupsParsed || !this.model) return
    this.groupsParsed = true

    let rootNode: THREE.Object3D | undefined
    this.model.traverse((obj) => {
      if (obj.name === 'RootNode') rootNode = obj
    })
    if (!rootNode) return

    for (const child of rootNode.children) {
      const type = MODULE_TO_SECTION[child.name]
      if (type) {
        const arr = this.sectionGroups.get(type) ?? []
        arr.push(child)
        this.sectionGroups.set(type, arr)
      }
    }

    for (const [type, groups] of this.sectionGroups) {
      const meshes: THREE.Mesh[] = []
      for (const group of groups) {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) meshes.push(obj)
        })
      }
      this.sectionMeshes.set(type, meshes)
    }
  }

  applySections(sections: StationSection[]) {
    this.parseGroups()
    if (!this.groupsParsed) return

    const operational = new Set(sections.filter((s) => s.status === 'operational').map((s) => s.type))

    for (const [type, groups] of this.sectionGroups) {
      const shouldShow = operational.has(type)
      const wasShown = this.visibleSections.has(type)

      if (shouldShow && !wasShown) {
        this.visibleSections.add(type)
        if (this.firstApply) {
          for (const g of groups) g.visible = true
        } else {
          this.fadeIn(type, groups)
        }
      } else if (!shouldShow) {
        if (wasShown) this.visibleSections.delete(type)
        for (const g of groups) g.visible = false
      }
    }

    this.firstApply = false
  }

  private fadeIn(type: SectionType, groups: THREE.Object3D[]) {
    const materials: THREE.Material[] = []
    for (const group of groups) {
      group.visible = true
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          for (const mat of mats) {
            mat.transparent = true
            ;(mat as THREE.MeshStandardMaterial).opacity = 0
            materials.push(mat)
          }
        }
      })
    }
    this.fadingSections.set(type, { materials, startTime: performance.now() })
  }

  // ─── Raycasting ──────────────────────────────────────────────────────────

  raycast(raycaster: THREE.Raycaster): boolean {
    return raycaster.intersectObject(this.hitDisc).length > 0
  }

  raycastSections(raycaster: THREE.Raycaster): SectionType | null {
    for (const [type, meshes] of this.sectionMeshes) {
      if (!this.visibleSections.has(type)) continue
      if (raycaster.intersectObjects(meshes).length > 0) return type
    }
    return null
  }

  // ─── Highlight overlays ─────────────────────────────────────────────────

  showSectionHighlight(type: SectionType | null) {
    if (!this.hoverOverlay) return
    if (!type) {
      this.hoverOverlay.hide()
      return
    }
    this.hoverOverlay.setColor(SECTION_COLORS[type])
    this.hoverOverlay.show(this.sectionGroups.get(type) ?? [])
  }

  showBuildHighlight(type: SectionType | null) {
    if (!this.buildOverlay) return
    if (!type) {
      this.buildOverlay.hide()
      return
    }
    this.buildOverlay.show(this.sectionGroups.get(type) ?? [])
  }

  // ─── Screen-space helpers ────────────────────────────────────────────────

  private computeSectionBounds(type: SectionType): THREE.Box3 | null {
    const meshes = this.sectionMeshes.get(type)
    if (!meshes?.length) return null
    const box = new THREE.Box3()
    const tmp = new THREE.Box3()
    for (const mesh of meshes) {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
      tmp.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld)
      box.union(tmp)
    }
    return box
  }

  getSectionScreenTop(type: SectionType, camera: THREE.Camera): { x: number; y: number } | null {
    const box = this.computeSectionBounds(type)
    if (!box) return null
    const center = new THREE.Vector3()
    box.getCenter(center)
    return projectToScreen(new THREE.Vector3(center.x, box.max.y, center.z), camera)
  }

  getScreenPosition(camera: THREE.Camera): { x: number; y: number } {
    return projectToScreen(this.hitDisc.position, camera)
  }

  // ─── Selection ───────────────────────────────────────────────────────────

  select() {
    this.isSelected = true
    this.ringGroup.visible = true
  }

  deselect() {
    this.isSelected = false
    this.ringGroup.visible = false
  }

  getCamTarget(): THREE.Vector3 {
    return this.camTarget
  }

  // ─── Per-frame update ────────────────────────────────────────────────────

  update(elapsed: number, panX: number, panY: number, zoomT: number, panScale = 0.85) {
    const x = this.config.position[0] + panX * panScale * (1 - zoomT)
    const y = this.config.position[1] + panY * panScale * (1 - zoomT)

    if (this.model) {
      this.model.position.x = x
      this.model.position.y = y
    }
    this.hitDisc.position.x = x
    this.hitDisc.position.y = y
    this.ringGroup.position.x = x
    this.ringGroup.position.y = y
    if (this.isSelected) this.blockRingGroup.rotation.y = elapsed * 0.2

    this.hoverOverlay?.sync()
    if (this.buildOverlay?.visible) {
      this.buildOverlay.setOpacity(BUILD_PULSE_BASE + BUILD_PULSE_AMP * Math.sin(elapsed * BUILD_PULSE_SPEED))
      this.buildOverlay.sync()
    }

    // Advance fade-in animations
    const now = performance.now()
    for (const [type, fade] of this.fadingSections) {
      const t = Math.min(1, (now - fade.startTime) / FADE_DURATION_MS)
      const eased = 1 - (1 - t) ** 3
      for (const mat of fade.materials) (mat as THREE.MeshStandardMaterial).opacity = eased
      if (t >= 1) {
        for (const mat of fade.materials) (mat as THREE.MeshStandardMaterial).opacity = 1
        this.fadingSections.delete(type)
      }
    }
  }

  // ─── Disposal ────────────────────────────────────────────────────────────

  dispose() {
    this.fadingSections.clear()
    this.hoverOverlay?.dispose()
    this.hoverOverlay = null
    this.buildOverlay?.dispose()
    this.buildOverlay = null

    if (this.model) {
      this.model.parent?.remove(this.model)
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            for (const m of child.material) m.dispose()
          } else {
            child.material?.dispose()
          }
        }
      })
    }
    this.hitDisc.parent?.remove(this.hitDisc)
    this.hitDisc.geometry.dispose()
    ;(this.hitDisc.material as THREE.Material).dispose()
    this.ringGroup.parent?.remove(this.ringGroup)
    this.ringGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose()
        ;(child.material as THREE.Material)?.dispose()
      }
    })
  }
}
