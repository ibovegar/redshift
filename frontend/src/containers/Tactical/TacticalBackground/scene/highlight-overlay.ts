import * as THREE from 'three'

/**
 * Additive transparent overlay that mirrors a set of source meshes for a
 * see-through glow/highlight effect (used for build-in-progress, station nav
 * highlight, etc).
 */
export class HighlightOverlay {
  private group = new THREE.Group()
  private mat: THREE.MeshBasicMaterial
  private sourceMap = new Map<THREE.Mesh, THREE.Mesh>()
  private scene: THREE.Scene
  private lastSources: Iterable<THREE.Object3D> | null = null

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
    if (sources !== this.lastSources) {
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
      this.lastSources = sources
    }
    this.sync()
    this.group.visible = true
  }

  hide() {
    this.group.visible = false
    this.group.clear()
    this.sourceMap.clear()
    this.lastSources = null
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

  /** Copy world matrix from each source mesh so the overlay tracks model motion/rotation. */
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
