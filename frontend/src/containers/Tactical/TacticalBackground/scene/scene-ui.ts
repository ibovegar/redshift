import type { Ship } from './ship'

export interface SceneUIRefs {
  tooltip: HTMLDivElement | null
  menu: HTMLDivElement | null
  menuLine: SVGLineElement | null
  scanLine: SVGLineElement | null
  shipStats: HTMLDivElement | null
  scanPanel: HTMLDivElement | null
}

export interface SceneUIState {
  mouseX: number
  mouseY: number
  t: number
  maxZoom: number
  travelMode: boolean
  dockedMesh: unknown
  scanning: boolean
  dockedAsteroidScanned: boolean
  scanResultVisible: boolean
}

export function updateTooltip(
  el: HTMLDivElement | null,
  ship: Ship,
  screenPos: { x: number; y: number } | null,
  travelMode: boolean
) {
  if (!el) return
  const show = ship.hoverCurrent > 0.1 && !ship.isSelected && !ship.isZoomed && !travelMode
  el.style.opacity = show ? '1' : '0'
  if (show && screenPos) {
    el.style.left = `${screenPos.x}px`
    el.style.top = `${screenPos.y - 100}px`
  }
}

export function updateMenu(
  el: HTMLDivElement | null,
  lineEl: SVGLineElement | null,
  ship: Ship,
  screenPos: { x: number; y: number } | null,
  mouseX: number,
  mouseY: number,
  t: number,
  maxZoom: number,
  dockedMesh: unknown
) {
  const menuVisible = el && !ship.isZoomed && (dockedMesh || el.style.opacity !== '0')
  if (!el || !menuVisible || !screenPos) {
    if (lineEl) lineEl.setAttribute('opacity', '0')
    return
  }

  const offset = 140 + t * 280
  const menuWidth = el.offsetWidth
  const rightX = screenPos.x + offset
  const flipped = rightX + menuWidth > window.innerWidth - 8
  const flippedOffset = 60 + t * 120
  const menuX = flipped ? screenPos.x - flippedOffset - menuWidth : rightX
  const menuY = screenPos.y - 100

  el.style.left = `${menuX}px`
  el.style.top = `${menuY}px`
  el.style.flexDirection = flipped ? 'row-reverse' : 'row'
  el.style.transformOrigin = flipped ? 'right center' : 'left center'

  const rx = mouseY * 2
  const ry = flipped ? 3 - mouseX * 2 : -3 + mouseX * 2
  const skew = flipped ? -0.5 : 0.5
  el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) skewY(${skew}deg) translateY(-50%)`

  if (ship.isZoomed) {
    const fadeStart = maxZoom * 0.6
    const fadeRange = maxZoom * 0.4
    const menuOpacity = Math.min(1, Math.max(0, (t - fadeStart) / fadeRange))
    el.style.opacity = String(menuOpacity)
    el.style.pointerEvents = menuOpacity > 0.5 ? 'auto' : 'none'
  }

  if (lineEl) {
    const lineX = flipped ? menuX + menuWidth : menuX
    lineEl.setAttribute('x1', String(screenPos.x))
    lineEl.setAttribute('y1', String(screenPos.y))
    lineEl.setAttribute('x2', String(lineX))
    lineEl.setAttribute('y2', String(menuY))
    lineEl.setAttribute('opacity', el.style.opacity)
  }
}

export function updateShipStats(
  el: HTMLDivElement | null,
  menuEl: HTMLDivElement | null,
  ship: Ship,
  screenPos: { x: number; y: number } | null,
  mouseX: number,
  mouseY: number,
  t: number,
  maxZoom: number
) {
  if (!el) return
  if (!ship.isZoomed || !screenPos) {
    el.style.opacity = '0'
    return
  }

  const statsWidth = el.offsetWidth
  const menuOnRight = menuEl ? parseFloat(menuEl.style.left || '0') > screenPos.x : true
  const statsOffset = 140 + t * 280
  const statsX = menuOnRight ? screenPos.x - statsOffset - statsWidth : screenPos.x + statsOffset
  const statsY = screenPos.y - 100

  el.style.left = `${statsX}px`
  el.style.top = `${statsY}px`
  const origin = menuOnRight ? 'right center' : 'left center'
  el.style.transformOrigin = origin

  const rx = mouseY * 2
  const ry = menuOnRight ? 3 - mouseX * 2 : -3 + mouseX * 2
  const skew = menuOnRight ? -0.5 : 0.5
  el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) skewY(${skew}deg) translateY(-50%)`

  const fadeStart = maxZoom * 0.6
  const fadeRange = maxZoom * 0.4
  el.style.opacity = String(Math.min(1, Math.max(0, (t - fadeStart) / fadeRange)))
}

export function updateButtonStates(dockedMesh: unknown, scanning: boolean, dockedAsteroidScanned: boolean) {
  updateButton('dock-btn', !dockedMesh)
  updateButton('scan-btn', !dockedMesh || scanning || dockedAsteroidScanned)
  updateButton('mining-btn', !dockedMesh || !dockedAsteroidScanned)
}

function updateButton(id: string, shouldDisable: boolean) {
  const btn = document.getElementById(id) as HTMLButtonElement | null
  if (!btn) return
  btn.disabled = shouldDisable
  btn.classList.toggle('Mui-disabled', shouldDisable)
  const wrapper = btn.closest('[data-bar-button]') as HTMLElement | null
  if (wrapper) wrapper.style.pointerEvents = shouldDisable ? 'none' : ''
}

export function updateScanPanel(
  el: HTMLDivElement | null,
  lineEl: SVGLineElement | null,
  screenX: number,
  screenY: number,
  mouseX: number,
  mouseY: number,
  zoomProgress: number
) {
  if (!el) return

  const panelHeight = el.offsetHeight
  const panelWidth = el.offsetWidth
  const rightX = screenX + 120
  const flipped = rightX + panelWidth > window.innerWidth - 8
  const panelX = flipped ? screenX - 120 - panelWidth : rightX
  const panelY = Math.max(20, screenY - panelHeight / 2)

  el.style.left = `${panelX}px`
  el.style.top = `${panelY}px`
  el.style.transformOrigin = flipped ? 'right center' : 'left center'

  const rx = mouseY * 2
  const ry = flipped ? 3 - mouseX * 2 : -3 + mouseX * 2
  const skew = flipped ? -0.5 : 0.5
  el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) skewY(${skew}deg)`
  el.style.opacity = String(Math.min(1, zoomProgress * 3))

  if (lineEl) {
    const lineEndX = flipped ? panelX + panelWidth : panelX
    const lineEndY = panelY + panelHeight / 2
    const scanOpacity = el.querySelector('[class]') ? Math.min(1, zoomProgress * 3) : 0
    lineEl.setAttribute('x1', String(screenX))
    lineEl.setAttribute('y1', String(screenY))
    lineEl.setAttribute('x2', String(lineEndX))
    lineEl.setAttribute('y2', String(lineEndY))
    lineEl.setAttribute('opacity', String(scanOpacity))
  }
}

export function hideScanPanel(el: HTMLDivElement | null, lineEl: SVGLineElement | null) {
  if (el) el.style.opacity = '0'
  if (lineEl) lineEl.setAttribute('opacity', '0')
}
