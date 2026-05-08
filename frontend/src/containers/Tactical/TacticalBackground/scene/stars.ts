import * as THREE from 'three'

export class Stars {
  readonly mesh: THREE.Mesh
  private readonly geo: THREE.PlaneGeometry
  private readonly mat: THREE.MeshBasicMaterial
  private readonly texture: THREE.Texture
  private readonly z = -76

  constructor(camera: THREE.PerspectiveCamera) {
    const textureLoader = new THREE.TextureLoader()
    this.texture = textureLoader.load('/images/planets/8k_stars_milky_way.jpg')
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.minFilter = THREE.LinearMipmapLinearFilter
    this.texture.magFilter = THREE.LinearFilter

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
    this.texture.dispose()
  }
}
