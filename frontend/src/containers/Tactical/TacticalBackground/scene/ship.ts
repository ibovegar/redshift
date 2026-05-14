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
  hitGroup: THREE.Group
  blockRingGroup: THREE.Group
  hitDisc: THREE.Mesh
  reticleMat: THREE.ShaderMaterial
  blockMat: THREE.MeshBasicMaterial
  blockGlowMat: THREE.MeshBasicMaterial
  solidRingMat: THREE.MeshBasicMaterial
  strobeLight: THREE.PointLight
  strobeGlareMat: THREE.ShaderMaterial
  strobeGlare: THREE.Mesh
  hoverTarget = 0
  hoverCurrent = 0
  isZoomed = false
  isSelected = false
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

    // Hit group (always visible for raycasting)
    this.hitGroup = new THREE.Group()
    this.hitGroup.position.set(...config.position)
    this.hitGroup.rotation.set(...config.ringTilt)

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

    // Hit disc (separate group so it remains raycastable when ring is hidden)
    const hitDiscGeo = new THREE.CircleGeometry(0.4, 32)
    const hitDiscMat = new THREE.MeshBasicMaterial({ visible: false })
    this.hitDisc = new THREE.Mesh(hitDiscGeo, hitDiscMat)
    this.hitDisc.rotation.x = -Math.PI / 2
    this.hitDisc.position.y = 0
    this.hitGroup.add(this.hitDisc)

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
    this.ringGroup.visible = false

    // Strobe light (visible when unselected)
    const glareGeo = new THREE.PlaneGeometry(0.12, 0.12)
    this.strobeLight = new THREE.PointLight(0x88ccff, 0, 1.5)
    this.strobeLight.position.set(...config.position)
    this.strobeGlareMat = new THREE.ShaderMaterial({
      uniforms: {
        uIntensity: { value: 0.0 },
        uColor: { value: new THREE.Vector3(0.5, 0.85, 1.0) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float d = length(c) * 2.0;
          float angle = atan(c.y, c.x);
          float core = exp(-d * 20.0) * 5.0;
          float glow = exp(-d * 6.0) * 1.5;
          float rays = 0.0;
          float ra0 = 0.4; float ra1 = 1.3; float ra2 = 2.6;
          float ra3 = 3.5; float ra4 = 4.9; float ra5 = 5.7;
          float rl0 = 1.2; float rl1 = 2.5; float rl2 = 1.0;
          float rl3 = 3.0; float rl4 = 1.5; float rl5 = 2.0;
          rays += pow(max(cos(angle - ra0), 0.0), 120.0) * exp(-d * rl0) * 1.2;
          rays += pow(max(cos(angle - ra1), 0.0), 120.0) * exp(-d * rl1) * 1.2;
          rays += pow(max(cos(angle - ra2), 0.0), 120.0) * exp(-d * rl2) * 1.2;
          rays += pow(max(cos(angle - ra3), 0.0), 120.0) * exp(-d * rl3) * 1.2;
          rays += pow(max(cos(angle - ra4), 0.0), 120.0) * exp(-d * rl4) * 1.2;
          rays += pow(max(cos(angle - ra5), 0.0), 120.0) * exp(-d * rl5) * 1.2;
          float total = (core + glow + rays) * uIntensity;
          vec3 color = uColor * total;
          gl_FragColor = vec4(color, total);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    this.strobeGlare = new THREE.Mesh(glareGeo, this.strobeGlareMat)
    this.strobeGlare.position.set(...config.position)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.ringGroup)
    scene.add(this.hitGroup)
    scene.add(this.strobeLight)
    scene.add(this.strobeGlare)
  }

  load(loader: GLTFLoader, onLoad?: () => void) {
    loader.load(this.config.modelPath, (gltf) => {
      this.model = gltf.scene
      this.model.position.set(...this.config.position)
      this.model.rotation.set(...this.config.rotation)
      this.model.scale.setScalar(this.config.scale)
      // Attach a light so the ship and nearby asteroids are lit during rotation
      const shipLight = new THREE.PointLight(0xddeeff, 1, 3)
      shipLight.position.set(0, 8, 15)
      this.model.add(shipLight)
      this.ringGroup.parent?.add(this.model)
      onLoad?.()
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

  select() {
    this.isSelected = true
    this.ringGroup.visible = true
  }

  deselect() {
    this.isSelected = false
    this.ringGroup.visible = false
    this.hoverTarget = 0
    this.hoverCurrent = 0
  }

  update(elapsed: number, panX: number, panY: number, zoomT: number, camera: THREE.Camera, panScale = 0.85) {
    this.camTarget.set(this.config.position[0], this.config.position[1] + 0.01, this.config.position[2] + 0.4)
    const shipX = this.config.position[0] + panX * panScale * (1 - zoomT)
    const shipY = this.config.position[1] + panY * panScale * (1 - zoomT)

    if (this.model) {
      this.model.position.x = shipX
      this.model.position.y = shipY
      this.model.position.z = this.config.position[2]
      this.model.rotation.z = this.config.rotation[2]
    }

    this.ringGroup.position.x = shipX
    this.ringGroup.position.y = shipY
    this.ringGroup.position.z = this.config.position[2]
    const dist = camera.position.distanceTo(this.ringGroup.position)
    const refDist = 10
    const distScale = Math.min(1, dist / refDist)
    const ringScale = Math.max(0.3, distScale * (1 - zoomT * 0.7))
    this.ringGroup.scale.setScalar(ringScale)
    this.hitGroup.position.x = shipX
    this.hitGroup.position.y = shipY
    this.hitGroup.position.z = this.config.position[2]
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
    if (this.ringGroup.visible) {
      this.reticleMat.uniforms.uHover.value = this.hoverCurrent
      this.reticleMat.uniforms.uZoom.value = zoomT
    }

    // Strobe: two rapid blinks then pause
    if (!this.isSelected) {
      this.strobeLight.position.set(shipX, shipY + 0.07, this.config.position[2] + 0.05)
      this.strobeGlare.position.set(shipX, shipY + 0.07, this.config.position[2] + 0.05)
      const cycle = (elapsed * 0.8) % 1.0
      let blink = 0
      if (cycle < 0.03) blink = 1
      else if (cycle > 0.07 && cycle < 0.1) blink = 1
      this.strobeLight.intensity = blink * 50
      this.strobeGlareMat.uniforms.uIntensity.value = blink
    } else {
      this.strobeLight.intensity = 0
      this.strobeGlareMat.uniforms.uIntensity.value = 0
    }
  }

  getScreenPosition(camera: THREE.Camera): { x: number; y: number } | null {
    if (!this.model) return null
    const pos = new THREE.Vector3(this.model.position.x, this.model.position.y, this.model.position.z).project(camera)
    return {
      x: (pos.x * 0.5 + 0.5) * window.innerWidth,
      y: (-pos.y * 0.5 + 0.5) * window.innerHeight
    }
  }

  getScreenHalfWidth(camera: THREE.PerspectiveCamera): number {
    if (!this.model) return 80
    const box = new THREE.Box3().setFromObject(this.model)
    const halfX = (box.max.x - box.min.x) / 2
    const center = box.getCenter(new THREE.Vector3())
    const distance = Math.max(camera.near, camera.position.distanceTo(center))
    const fovRad = (camera.fov * Math.PI) / 180
    return (halfX / distance) * (window.innerHeight / (2 * Math.tan(fovRad / 2)))
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
    this.hitDisc.geometry.dispose()
    ;(this.hitDisc.material as THREE.Material).dispose()
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
