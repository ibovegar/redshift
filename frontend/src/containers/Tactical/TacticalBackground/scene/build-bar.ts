import type * as THREE from 'three'
import type { SectionType } from 'models/station-section'
import type { Station } from './station'

const BUILD_DURATION_MS = 12000
const BAR_OFFSET_Y = 48

/**
 * Drives the section-build progress bar via cached imperative DOM writes,
 * mirroring the FuelBarController pattern so both HUD bars share the same shape.
 */
export class BuildBarController {
  private el: HTMLDivElement | null = null
  private station: Station | null = null
  private buildingSection: SectionType | null = null
  private startTime = 0

  // Cached writes — only push to the DOM when values change
  private lastVisible = false
  private lastLeft = ''
  private lastTop = ''
  private lastPct = -1

  bind(el: HTMLDivElement | null) {
    this.el = el
  }

  setStation(station: Station) {
    this.station = station
  }

  start(section: SectionType) {
    this.buildingSection = section
    this.startTime = performance.now()
  }

  hide() {
    if (this.el && this.lastVisible) {
      this.el.style.display = 'none'
      this.lastVisible = false
    }
  }

  /**
   * Returns true when the build just completed this frame, so the caller can
   * clean up associated effects (e.g. the 3D highlight on the section).
   */
  update(camera: THREE.Camera): boolean {
    if (!this.el || !this.buildingSection || !this.station) {
      this.hide()
      return false
    }

    const progress = Math.min(1, (performance.now() - this.startTime) / BUILD_DURATION_MS)
    const screen = this.station.getSectionScreenTop(this.buildingSection, camera)

    if (!screen) {
      this.hide()
      return progress >= 1 ? this.complete() : false
    }

    if (!this.lastVisible) {
      this.el.style.display = 'block'
      this.lastVisible = true
    }

    const left = `${screen.x}px`
    const top = `${screen.y - BAR_OFFSET_Y}px`
    if (left !== this.lastLeft) {
      this.el.style.left = left
      this.lastLeft = left
    }
    if (top !== this.lastTop) {
      this.el.style.top = top
      this.lastTop = top
    }

    const pct = Math.round(progress * 100)
    if (pct !== this.lastPct) {
      this.lastPct = pct
      const bar = this.el.querySelector<HTMLElement>('.MuiLinearProgress-bar')
      if (bar) bar.style.transform = `translateX(-${100 - pct}%)`
      const text = this.el.querySelector<HTMLElement>('[data-bar-text]')
      if (text) text.textContent = `${pct}%`
      const label = this.el.querySelector<HTMLElement>('[data-bar-label]')
      if (label) label.textContent = 'Building...'
    }

    return progress >= 1 ? this.complete() : false
  }

  private complete(): boolean {
    this.buildingSection = null
    this.hide()
    return true
  }
}
