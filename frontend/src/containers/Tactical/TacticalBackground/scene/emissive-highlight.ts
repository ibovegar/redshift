import * as THREE from 'three'

interface MaterialBackup {
  color: THREE.Color
  emissive: THREE.Color
  intensity: number
}

/**
 * Tints meshes by mutating their MeshStandardMaterial's `color` and `emissive`
 * in place, then restores the originals on hide. Preserves the underlying
 * texture, normals, lighting, and shadows — the source just glows in the tint.
 *
 * Call `show()` with the same array reference each frame for idempotent
 * per-frame use (skipped when sources/state haven't changed).
 */
export class EmissiveHighlight {
  private originals = new Map<THREE.MeshStandardMaterial, MaterialBackup>()
  private tint = new THREE.Color(0xffffff)
  private emissiveIntensity: number
  private tintStrength: number
  private active = false
  private lastSources: readonly THREE.Object3D[] | null = null

  constructor(params: { color?: number; emissiveIntensity?: number; tintStrength?: number } = {}) {
    if (params.color !== undefined) this.tint.setHex(params.color)
    this.emissiveIntensity = params.emissiveIntensity ?? 0.25
    // 0 = no tint (texture passes through unchanged), 1 = fully replace albedo.
    this.tintStrength = params.tintStrength ?? 0.25
  }

  setColor(hex: number) {
    this.tint.setHex(hex)
    if (this.active) {
      for (const mat of this.originals.keys()) this.applyTo(mat)
    }
  }

  show(sources: readonly THREE.Object3D[]) {
    if (this.active && this.lastSources === sources) return
    if (this.active) this.restoreAll()
    this.lastSources = sources
    for (const root of sources) {
      root.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        for (const m of mats) {
          if (m instanceof THREE.MeshStandardMaterial && !this.originals.has(m)) {
            this.originals.set(m, {
              color: m.color.clone(),
              emissive: m.emissive.clone(),
              intensity: m.emissiveIntensity
            })
            this.applyTo(m)
          }
        }
      })
    }
    this.active = true
  }

  hide() {
    if (!this.active) return
    this.restoreAll()
    this.lastSources = null
    this.active = false
  }

  get visible() {
    return this.active
  }

  dispose() {
    this.hide()
  }

  private applyTo(mat: THREE.MeshStandardMaterial) {
    const orig = this.originals.get(mat)
    if (orig) mat.color.copy(orig.color).lerp(this.tint, this.tintStrength)
    else mat.color.copy(this.tint)
    mat.emissive.copy(this.tint)
    mat.emissiveIntensity = this.emissiveIntensity
  }

  private restoreAll() {
    for (const [mat, orig] of this.originals) {
      mat.color.copy(orig.color)
      mat.emissive.copy(orig.emissive)
      mat.emissiveIntensity = orig.intensity
    }
    this.originals.clear()
  }
}
