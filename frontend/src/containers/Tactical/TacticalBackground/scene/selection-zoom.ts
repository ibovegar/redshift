import type * as THREE from 'three'

const ZOOM_SPEED = 0.01

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

  update() {
    if (this.isZoomed) {
      this.progress = Math.min(1, this.progress + ZOOM_SPEED)
      this.t = Math.min(this.maxZoom, 1 - (1 - this.progress) ** 9)
    } else {
      this.progress = Math.max(0, this.progress - ZOOM_SPEED * 2.5 * Math.max(0.3, this.progress))
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
