import * as THREE from 'three'

export class FuelBarController {
  current: number
  private el: HTMLDivElement | null = null
  private tripStartFuel = 0
  private tripCost = 0
  private maxFuel: number
  private fuelPerUnit: number

  constructor(initialFuel: number, maxFuel: number, fuelPerUnit: number) {
    this.current = initialFuel
    this.maxFuel = maxFuel
    this.fuelPerUnit = fuelPerUnit
  }

  bind(el: HTMLDivElement | null) {
    this.el = el
  }

  startTrip(shipPosition: [number, number, number], target: THREE.Vector3) {
    const dist = new THREE.Vector3(...shipPosition).distanceTo(target)
    this.tripStartFuel = this.current
    this.tripCost = Math.min(dist * this.fuelPerUnit, this.current)
  }

  drainFuel(progress: number): number {
    this.current = Math.max(0, this.tripStartFuel - this.tripCost * progress)
    return Math.round(this.current)
  }

  refuel(): number {
    this.current = this.maxFuel
    return this.current
  }

  update(params: {
    visible: boolean
    shipScreen: { x: number; y: number } | null
    hoverTarget: THREE.Vector3 | null
    shipPosition: [number, number, number]
  }) {
    if (!this.el) return
    const { visible, shipScreen, hoverTarget, shipPosition } = params

    if (!visible || !shipScreen) {
      this.el.style.display = 'none'
      return
    }

    this.el.style.display = 'block'
    this.el.style.left = `${shipScreen.x}px`
    this.el.style.top = `${shipScreen.y - 50}px`

    const bar = this.el.querySelector<HTMLElement>('.MuiLinearProgress-bar')
    const text = this.el.querySelector<HTMLElement>('[data-fuel-text]')

    if (bar) {
      let pct = (this.current / this.maxFuel) * 100
      if (hoverTarget) {
        const dist = new THREE.Vector3(...shipPosition).distanceTo(hoverTarget)
        const tripCost = dist * this.fuelPerUnit
        pct = Math.max(0, ((this.current - tripCost) / this.maxFuel) * 100)
      }
      bar.style.transform = `translateX(-${100 - pct}%)`
      bar.style.backgroundColor = pct > 50 ? '' : pct > 20 ? '#ffaa33' : '#ff4444'
    }

    if (text) {
      let displayPct = Math.round(this.current)
      if (hoverTarget) {
        const dist = new THREE.Vector3(...shipPosition).distanceTo(hoverTarget)
        const tripCost = dist * this.fuelPerUnit
        displayPct = Math.max(0, Math.round(this.current - tripCost))
      }
      text.textContent = `${displayPct}%`
    }
  }
}
