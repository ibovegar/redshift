import * as THREE from 'three'

/**
 * Reusable additive highlight overlay for any Object3D / loaded GLTF model.
 * Clones the model's mesh geometry and renders it with an additive glow material.
 */
export class ModelHighlight {
  private overlay: THREE.Group | null = null
  private material: THREE.MeshBasicMaterial
  private scene: THREE.Scene
  private blinkRate = 20

  constructor(scene: THREE.Scene, color = 0x66ccff, opacity = 0.5) {
    this.scene = scene
    this.material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    })
  }

  /** Build the overlay from any Object3D (call once after model is loaded). */
  attach(source: THREE.Object3D) {
    if (this.overlay) this.dispose()
    this.overlay = new THREE.Group()
    this.overlay.visible = false

    source.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const clone = new THREE.Mesh(child.geometry, this.material)
        clone.matrixAutoUpdate = false
        this.overlay!.add(clone)
        // Store reference to source mesh for matrix syncing
        ;(clone as any)._source = child
      }
    })

    this.scene.add(this.overlay)
  }

  /** Sync overlay transforms to match the source model's current pose. */
  private sync() {
    if (!this.overlay) return
    for (const child of this.overlay.children) {
      const source = (child as any)._source as THREE.Mesh | undefined
      if (source) {
        source.updateWorldMatrix(true, false)
        child.matrixWorld.copy(source.matrixWorld)
        child.matrix.copy(source.matrixWorld)
      }
    }
  }

  show() {
    if (!this.overlay) return
    this.sync()
    this.overlay.visible = true
  }

  showWithBlink(elapsed: number) {
    if (!this.overlay) return
    this.sync()
    this.overlay.visible = Math.sin(elapsed * this.blinkRate) > 0
  }

  hide() {
    if (!this.overlay) return
    this.overlay.visible = false
  }

  get visible() {
    return this.overlay?.visible ?? false
  }

  dispose() {
    if (this.overlay) {
      this.scene.remove(this.overlay)
      this.overlay = null
    }
    this.material.dispose()
  }
}
