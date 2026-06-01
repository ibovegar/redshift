import type * as THREE from 'three'

// Tuned for 60 fps. update(dt) scales by `dt * 60` so the zoom progresses at the same wall-clock
// rate regardless of frame rate — if fps dips, each frame advances proportionally more.
const ZOOM_SPEED = 0.01
const REFERENCE_FPS = 60

export interface Selectable {
  isSelected: boolean
  ringGroup: THREE.Group
  getCamTarget(): THREE.Vector3
  select(): void
  deselect(): void
}

export class SelectionZoom {
  isZoomed = false
  progress = 0
  t = 0
  maxZoom = 1
  activeTarget: Selectable | null = null
  private target: THREE.Vector3

  constructor(target: THREE.Vector3) {
    this.target = target.clone()
  }

  setTarget(target: THREE.Vector3) {
    this.target.copy(target)
  }

  zoomTo(selectable: Selectable) {
    this.activeTarget = selectable
    this.target.copy(selectable.getCamTarget())
    this.isZoomed = true
    selectable.ringGroup.visible = false
  }

  toggleZoomTo(selectable: Selectable) {
    if (this.isZoomed && this.activeTarget === selectable) {
      this.zoomOut()
    } else {
      this.zoomTo(selectable)
    }
  }

  zoomOut() {
    this.isZoomed = false
    if (this.activeTarget?.isSelected) {
      this.activeTarget.ringGroup.visible = true
    }
    this.activeTarget = null
  }

  update(dt = 1 / REFERENCE_FPS) {
    // Scale progress by dt*REFERENCE_FPS so the zoom takes the same wall-clock time at any fps.
    // Clamped so a long stall (tab hidden, GC pause) can't make a single frame jump by >2 reference
    // frames' worth of progress.
    const step = Math.min(2, dt * REFERENCE_FPS)
    if (this.isZoomed && this.activeTarget) {
      this.target.copy(this.activeTarget.getCamTarget())
    }
    if (this.isZoomed) {
      this.progress = Math.min(1, this.progress + ZOOM_SPEED * step)
      this.t = Math.min(this.maxZoom, 1 - (1 - this.progress) ** 9)
    } else {
      this.progress = Math.max(0, this.progress - ZOOM_SPEED * 2.5 * Math.max(0.3, this.progress) * step)
      const p = 1 - this.progress
      this.t = 1 - (6 * p ** 5 - 15 * p ** 4 + 10 * p ** 3)
    }
  }

  applyToCamera(camera: THREE.PerspectiveCamera, baseX: number, baseY: number, baseZ: number) {
    camera.position.x = baseX + (this.target.x - baseX) * this.t
    camera.position.y = baseY + (this.target.y - baseY) * this.t
    camera.position.z = baseZ + (this.target.z - baseZ) * this.t
  }

  reset() {
    this.isZoomed = false
    this.progress = 0
    this.t = 0
    this.maxZoom = 1
    this.activeTarget = null
  }
}
