import * as THREE from 'three'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export interface StationConfig {
  modelPath: string
  position: [number, number, number]
  ringTilt: [number, number, number]
  camOffset: number
}

export class Station {
  config: StationConfig
  model: THREE.Group | null = null
  hitDisc: THREE.Mesh
  ringGroup: THREE.Group
  blockRingGroup: THREE.Group
  isSelected = false
  private camTarget: THREE.Vector3

  constructor(config: StationConfig) {
    this.config = config
    this.camTarget = new THREE.Vector3(
      config.position[0],
      config.position[1] + 0.01,
      config.position[2] + config.camOffset
    )

    // Hit disc for raycasting
    this.hitDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    )
    this.hitDisc.position.set(...config.position)

    // Ring indicator group
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

  raycast(raycaster: THREE.Raycaster): boolean {
    return raycaster.intersectObject(this.hitDisc).length > 0
  }

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
    this.blockRingGroup.rotation.y = elapsed * 0.2
  }

  getScreenPosition(camera: THREE.Camera): { x: number; y: number } {
    const pos = new THREE.Vector3(this.hitDisc.position.x, this.hitDisc.position.y, this.hitDisc.position.z).project(
      camera
    )
    return {
      x: (pos.x * 0.5 + 0.5) * window.innerWidth,
      y: (-pos.y * 0.5 + 0.5) * window.innerHeight
    }
  }

  dispose() {
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
