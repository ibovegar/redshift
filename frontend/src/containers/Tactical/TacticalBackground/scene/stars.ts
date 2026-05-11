import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

export class Stars {
  readonly mesh: THREE.Mesh
  private readonly geo: THREE.PlaneGeometry
  private readonly mat: THREE.MeshBasicMaterial
  private texture: THREE.Texture | null = null
  private readonly z = -76

  constructor(camera: THREE.PerspectiveCamera, onLoad?: () => void) {
    new HDRLoader().load('/images/planets/nebula_bg.hdr', (hdrTexture) => {
      hdrTexture.mapping = THREE.EquirectangularReflectionMapping
      hdrTexture.minFilter = THREE.LinearMipmapLinearFilter
      hdrTexture.magFilter = THREE.LinearFilter
      this.texture = hdrTexture
      this.mat.map = hdrTexture
      this.mat.needsUpdate = true
      onLoad?.()
    })

    const dist = Math.abs(this.z - camera.position.z)
    const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const w = h * camera.aspect

    this.geo = new THREE.PlaneGeometry(w * 1.7, h * 1.7)
    this.mat = new THREE.MeshBasicMaterial({ map: this.texture })
    this.mesh = new THREE.Mesh(this.geo, this.mat)
    this.mesh.position.set(-1, 2, this.z)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mesh)
  }

  applyParallax(panX: number, panY: number) {
    this.mesh.position.x = -1 + panX
    this.mesh.position.y = 2 + panY
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
    this.texture?.dispose()
  }
}
