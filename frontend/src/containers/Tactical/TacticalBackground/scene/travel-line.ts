import * as THREE from 'three'

export class TravelLine {
  private readonly geo: THREE.BufferGeometry
  private readonly mat: THREE.LineDashedMaterial
  readonly line: THREE.Line

  constructor() {
    this.mat = new THREE.LineDashedMaterial({
      color: 0x66ccff,
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.85
    })
    this.geo = new THREE.BufferGeometry()
    this.geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3))
    this.line = new THREE.Line(this.geo, this.mat)
    this.line.visible = false
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.line)
  }

  draw(
    canvas: HTMLCanvasElement,
    shipScreen: { x: number; y: number },
    endScreen: { x: number; y: number },
    elapsed: number,
    invertThickness = false
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    const dashAnim = -(elapsed * 50) % 11
    const segments = 24
    const dx = endScreen.x - shipScreen.x
    const dy = endScreen.y - shipScreen.y
    const totalLen = Math.sqrt(dx * dx + dy * dy)
    const dashPattern = [4, 7]

    ctx.lineCap = 'round'
    ctx.setLineDash(dashPattern)

    for (let i = 0; i < segments; i++) {
      const t0 = i / segments
      const t1 = (i + 1) / segments
      const x0 = shipScreen.x + dx * t0
      const y0 = shipScreen.y + dy * t0
      const x1 = shipScreen.x + dx * t1
      const y1 = shipScreen.y + dy * t1
      const segOffset = dashAnim - t0 * totalLen
      const depth = invertThickness ? 1 - t0 : t0
      const scale = 0.03 + depth * depth * 0.97

      // Glow
      ctx.lineDashOffset = segOffset
      ctx.strokeStyle = 'rgba(68, 136, 255, 0.35)'
      ctx.lineWidth = 18 * scale
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()

      // Core
      ctx.strokeStyle = '#66ccff'
      ctx.lineWidth = 5 * scale
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    }
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
  }
}
