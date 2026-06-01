import type * as THREE from 'three'

// apply(camera, dt) scales progress by `dt * 60` so the zoom takes the same wall-clock time at
// any fps — speeds (passed in via constructor) stay tuned for 60 fps but degrade gracefully.
const REFERENCE_FPS = 60

export class CameraZoom {
  progress = 0
  target: THREE.Vector3 | null = null
  private lastTarget: THREE.Vector3 | null = null
  private speed: number
  private amount: number
  private easeInPower: number
  private easeOutPower: number

  constructor(speed: number, amount: number, easeInPower = 4, easeOutPower = 4) {
    this.speed = speed
    this.amount = amount
    this.easeInPower = easeInPower
    this.easeOutPower = easeOutPower
  }

  zoomTo(target: THREE.Vector3) {
    this.target = target
    this.progress = 0
  }

  updateTarget(target: THREE.Vector3) {
    this.target = target
  }

  zoomOut() {
    this.target = null
  }

  apply(camera: THREE.Camera, dt = 1 / REFERENCE_FPS) {
    // Clamped so a long stall (tab hidden, GC pause) can't make a single frame advance by more
    // than ~2 reference frames of progress.
    const step = Math.min(2, dt * REFERENCE_FPS)
    if (this.target) {
      this.lastTarget = this.target.clone()
      this.progress = Math.min(1, this.progress + this.speed * step)
      const at = 1 - (1 - this.progress) ** this.easeInPower
      const a = at * this.amount
      camera.position.x += (this.target.x - camera.position.x) * a
      camera.position.y += (this.target.y - camera.position.y) * a
      camera.position.z += (this.target.z - camera.position.z) * a
    } else if (this.progress > 0 && this.lastTarget) {
      this.progress = Math.max(0, this.progress - this.speed * step)
      const at = this.progress ** this.easeOutPower
      const a = at * this.amount
      camera.position.x += (this.lastTarget.x - camera.position.x) * a
      camera.position.y += (this.lastTarget.y - camera.position.y) * a
      camera.position.z += (this.lastTarget.z - camera.position.z) * a
      if (this.progress === 0) this.lastTarget = null
    }
  }

  get active() {
    return this.target !== null || this.progress > 0
  }
}
