import * as THREE from 'three'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export interface ShipConfig {
  modelPath: string
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  camOffset: number
  ringTilt: [number, number, number]
}

export class Ship {
  config: ShipConfig
  model: THREE.Group | null = null
  ringGroup: THREE.Group
  blockRingGroup: THREE.Group
  hitDisc: THREE.Mesh
  reticleMat: THREE.ShaderMaterial
  blockMat: THREE.MeshBasicMaterial
  blockGlowMat: THREE.MeshBasicMaterial
  solidRingMat: THREE.MeshBasicMaterial
  hoverTarget = 0
  hoverCurrent = 0
  isZoomed = false
  zoomProgress = 0

  private camTarget: THREE.Vector3

  constructor(config: ShipConfig) {
    this.config = config
    this.camTarget = new THREE.Vector3(
      config.position[0],
      config.position[1] + 0.01,
      config.position[2] + config.camOffset
    )

    // Ring group
    this.ringGroup = new THREE.Group()
    this.ringGroup.position.set(...config.position)
    this.ringGroup.rotation.set(...config.ringTilt)

    // Shader reticle
    const reticleGeo = new THREE.PlaneGeometry(1.0, 1.0)
    this.reticleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uHover: { value: 0.0 },
        uZoom: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uHover;
        uniform float uZoom;
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float d = length(c);
          float ring = 0.0;
          float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
          float ringAlpha = ring * pulse;
          vec3 ringColor = vec3(0.5, 0.9, 1.0);
          gl_FragColor = vec4(ringColor * ringAlpha, ringAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
    const reticle = new THREE.Mesh(reticleGeo, this.reticleMat)
    reticle.rotation.x = Math.PI / 2
    reticle.position.y = 0
    this.ringGroup.add(reticle)

    // Hit disc
    const hitDiscGeo = new THREE.CircleGeometry(0.4, 32)
    const hitDiscMat = new THREE.MeshBasicMaterial({ visible: false })
    this.hitDisc = new THREE.Mesh(hitDiscGeo, hitDiscMat)
    this.hitDisc.rotation.x = -Math.PI / 2
    this.hitDisc.position.y = 0
    this.ringGroup.add(this.hitDisc)

    // Block ring
    const blockCount = 32
    const blockRadius = 0.28
    const blockWidth = 0.015
    const blockHeight = 0.03
    const blockDepth = 0.004
    this.blockRingGroup = new THREE.Group()
    const blockGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth)
    this.blockMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    this.blockGlowMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const blockGlowGeo = new THREE.BoxGeometry(blockWidth * 2.5, blockHeight * 2.5, blockDepth * 2)
    for (let i = 0; i < blockCount; i++) {
      const angle = (i / blockCount) * Math.PI * 2
      const x = Math.cos(angle) * blockRadius
      const z = Math.sin(angle) * blockRadius
      const glow = new THREE.Mesh(blockGlowGeo, this.blockGlowMat)
      glow.position.set(x, 0, z)
      glow.rotation.y = -angle
      this.blockRingGroup.add(glow)
      const block = new THREE.Mesh(blockGeo, this.blockMat)
      block.position.set(x, 0, z)
      block.rotation.y = -angle
      this.blockRingGroup.add(block)
    }

    // Solid ring (hidden by default)
    const solidRingGeo = new THREE.TorusGeometry(blockRadius, 0.004, 16, 64)
    this.solidRingMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const solidRing = new THREE.Mesh(solidRingGeo, this.solidRingMat)
    solidRing.rotation.x = Math.PI / 2
    this.blockRingGroup.add(solidRing)
    this.ringGroup.add(this.blockRingGroup)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.ringGroup)
  }

  load(loader: GLTFLoader) {
    loader.load(this.config.modelPath, (gltf) => {
      this.model = gltf.scene
      this.model.position.set(...this.config.position)
      this.model.rotation.set(...this.config.rotation)
      this.model.scale.setScalar(this.config.scale)
      this.ringGroup.parent?.add(this.model)
    })
  }

  getCamTarget(): THREE.Vector3 {
    return this.camTarget
  }

  raycast(raycaster: THREE.Raycaster): boolean {
    return raycaster.intersectObject(this.hitDisc).length > 0
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed
    this.hoverTarget = 0
    this.hoverCurrent = 0
  }

  zoomOut() {
    this.isZoomed = false
    this.hoverTarget = 0
    this.hoverCurrent = 0
  }

  update(elapsed: number, panX: number, panY: number, zoomT: number) {
    const bobScale = 1 - zoomT * 0.92
    const shipX = this.config.position[0] + panX * 0.85 * (1 - zoomT)
    const shipY = this.config.position[1] + panY * 0.85 * (1 - zoomT)
    const bobY = Math.sin(elapsed * 0.4) * 0.03 * bobScale

    if (this.model) {
      this.model.position.x = shipX
      this.model.position.y = shipY + bobY
      this.model.rotation.z = this.config.rotation[2] + Math.sin(elapsed * 0.25) * 0.01 * bobScale
    }

    this.ringGroup.position.x = shipX
    this.ringGroup.position.y = shipY + bobY
    this.blockRingGroup.rotation.y = elapsed * 0.2
    const blockScale = Math.max(0.3, 1 - zoomT * 0.7)
    this.blockRingGroup.scale.set(1, blockScale, 1)

    const lerpSpeed = this.hoverTarget > this.hoverCurrent ? 0.08 : 0.4
    this.hoverCurrent += (this.hoverTarget - this.hoverCurrent) * lerpSpeed
    const blockHide = Math.max(zoomT, this.hoverCurrent * 0.5)
    this.blockMat.opacity = 1 - blockHide
    this.blockGlowMat.opacity = 0.4 * (1 - blockHide)
    this.solidRingMat.opacity = 0

    this.reticleMat.uniforms.uTime.value = elapsed
    this.reticleMat.uniforms.uHover.value = this.hoverCurrent
    this.reticleMat.uniforms.uZoom.value = zoomT
  }

  getScreenPosition(camera: THREE.Camera): { x: number; y: number } | null {
    if (!this.model) return null
    const pos = new THREE.Vector3(this.model.position.x, this.model.position.y, this.model.position.z).project(camera)
    return {
      x: (pos.x * 0.5 + 0.5) * window.innerWidth,
      y: (-pos.y * 0.5 + 0.5) * window.innerHeight
    }
  }

  dispose() {
    this.ringGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material))
          child.material.forEach((m) => {
            m.dispose()
          })
        else child.material.dispose()
      }
    })
    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material))
            child.material.forEach((m) => {
              m.dispose()
            })
          else child.material.dispose()
        }
      })
    }
  }
}
