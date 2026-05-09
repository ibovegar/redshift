import type * as THREE from 'three'

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

  apply(camera: THREE.Camera) {
    if (this.target) {
      this.lastTarget = this.target.clone()
      this.progress = Math.min(1, this.progress + this.speed)
      const at = 1 - (1 - this.progress) ** this.easeInPower
      const a = at * this.amount
      camera.position.x += (this.target.x - camera.position.x) * a
      camera.position.y += (this.target.y - camera.position.y) * a
      camera.position.z += (this.target.z - camera.position.z) * a
    } else if (this.progress > 0 && this.lastTarget) {
      this.progress = Math.max(0, this.progress - this.speed)
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
