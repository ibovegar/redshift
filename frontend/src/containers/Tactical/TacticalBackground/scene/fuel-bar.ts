import * as THREE from 'three'

const MAX_FUEL = 100
const FUEL_PER_UNIT = 3

export class FuelBar {
  current: number
  private el: HTMLDivElement | null = null

  constructor(initialFuel: number) {
    this.current = initialFuel
  }

  bind(el: HTMLDivElement | null) {
    this.el = el
  }

  deduct(shipPosition: [number, number, number], target: THREE.Vector3): number {
    const dist = new THREE.Vector3(...shipPosition).distanceTo(target)
    const cost = dist * FUEL_PER_UNIT
    this.current = Math.max(0, this.current - cost)
    return Math.round(this.current)
  }

  refuel(): number {
    this.current = MAX_FUEL
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
    this.el.style.top = `${shipScreen.y - 30}px`

    const fill = this.el.querySelector<HTMLElement>('[data-fuel-fill]')
    const cost = this.el.querySelector<HTMLElement>('[data-fuel-cost]')
    const text = this.el.querySelector<HTMLElement>('[data-fuel-text]')

    if (fill) {
      const pct = (this.current / MAX_FUEL) * 100
      fill.style.width = `${pct}%`
      fill.style.backgroundColor = pct > 30 ? '#66ddff' : pct > 15 ? '#ffaa33' : '#ff4444'
    }

    if (cost) {
      if (hoverTarget) {
        const dist = new THREE.Vector3(...shipPosition).distanceTo(hoverTarget)
        const tripCost = dist * FUEL_PER_UNIT
        const costPct = (tripCost / MAX_FUEL) * 100
        const afterPct = Math.max(0, (this.current - tripCost) / MAX_FUEL) * 100
        const afterFuel = this.current - tripCost
        cost.style.left = `${afterPct}%`
        cost.style.width = `${Math.min(costPct, (this.current / MAX_FUEL) * 100)}%`
        cost.style.display = 'block'
        cost.style.backgroundColor = afterFuel < 0 ? '#ff4444' : '#ff8800'
      } else {
        cost.style.display = 'none'
      }
    }

    if (text) {
      text.textContent = `${Math.round(this.current)}%`
    }
  }
}
