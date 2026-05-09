import { MATERIAL_NAMES } from 'data/materials'
import { RARITY_COLORS } from 'data/rarity'
import type { Asteroid, AsteroidDeposit, AsteroidMaterial, ResourceRarity } from 'models/asteroid'
import { useCallback, useEffect, useRef } from 'react'

export interface CollectedResource {
  material: AsteroidMaterial
  amount: number
}

interface MiningOverlayProps {
  asteroid: Asteroid
  onComplete: (collected: CollectedResource[]) => void
}

const RARITY_ORDER: ResourceRarity[] = ['common', 'uncommon', 'rare', 'precious', 'exotic']

interface RingState {
  deposit: AsteroidDeposit
  outerRadius: number
  innerRadius: number
  remaining: number
  pushStrength: number
  color: string
}

interface MiningState {
  deposits: AsteroidDeposit[]
  rings: RingState[]
  activeRing: number
  mouseX: number
  mouseY: number
  pushX: number
  pushY: number
  pushTargetX: number
  pushTargetY: number
  pushTimer: number
  timeLimit: number
  timeRemaining: number
  done: boolean
}

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function buildRings(deposits: AsteroidDeposit[], canvasW: number, canvasH: number): RingState[] {
  const maxRadius = Math.min(canvasW, canvasH) * 0.2
  const count = deposits.length
  const gap = 4

  return deposits.map((dep, i) => {
    const fraction = (count - i) / count
    const prevFraction = (count - i + 1) / count
    const outerR = i === 0 ? maxRadius : maxRadius * prevFraction - gap
    const innerR = maxRadius * fraction + (i < count - 1 ? gap : 0)
    const pushBase = 25 + i * 30
    return {
      deposit: dep,
      outerRadius: Math.max(outerR, 20),
      innerRadius: Math.max(innerR, 10),
      remaining: 1,
      pushStrength: pushBase,
      color: RARITY_COLORS[dep.rarity] ?? '#aaa'
    }
  })
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  ring: RingState,
  isActive: boolean,
  pulse: number
) {
  const { outerRadius, innerRadius, remaining, color } = ring
  const isDepleted = remaining <= 0

  // Background fill
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2, true)
  ctx.fillStyle = isDepleted
    ? hexToRgba(color, 0.05)
    : isActive
      ? hexToRgba(color, 0.12 + pulse * 0.06)
      : hexToRgba(color, 0.06)
  ctx.fill()

  // Outer border
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = isActive ? hexToRgba(color, 0.9 + pulse * 0.1) : hexToRgba(color, 0.25)
  ctx.lineWidth = isActive ? 2 : 1
  ctx.stroke()

  // Inner border
  ctx.beginPath()
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2)
  ctx.stroke()

  // Depletion arc — shows mined portion as a brighter fill
  if (!isDepleted && remaining < 1) {
    const startAngle = -Math.PI / 2
    const sweepAngle = (1 - remaining) * Math.PI * 2
    const endAngle = startAngle + sweepAngle

    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius - 1, startAngle, endAngle)
    ctx.arc(cx, cy, innerRadius + 1, endAngle, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = hexToRgba(color, 0.35)
    ctx.fill()
  }

  // Depleted checkmark
  if (isDepleted) {
    const midR = (outerRadius + innerRadius) / 2
    ctx.fillStyle = hexToRgba(color, 0.4)
    ctx.font = `${Math.max(10, (outerRadius - innerRadius) * 0.6)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✓', cx + midR * 0.7, cy)
  }
}

function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number, inside: boolean, pulse: number) {
  const size = 14
  const color = inside ? `rgba(0, 255, 136, ${0.8 + pulse * 0.2})` : 'rgba(255, 80, 60, 0.8)'

  // Outer ring
  ctx.beginPath()
  ctx.arc(x, y, 8, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Crosshair
  ctx.beginPath()
  ctx.moveTo(x - size, y)
  ctx.lineTo(x - 5, y)
  ctx.moveTo(x + 5, y)
  ctx.lineTo(x + size, y)
  ctx.moveTo(x, y - size)
  ctx.lineTo(x, y - 5)
  ctx.moveTo(x, y + 5)
  ctx.lineTo(x, y + size)
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Center dot
  ctx.beginPath()
  ctx.arc(x, y, 2, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // Glow when inside
  if (inside) {
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 20)
    grad.addColorStop(0, 'rgba(0, 255, 136, 0.15)')
    grad.addColorStop(1, 'rgba(0, 255, 136, 0)')
    ctx.fillStyle = grad
    ctx.fill()
  }
}

function drawTimer(ctx: CanvasRenderingContext2D, cx: number, y: number, timeRemaining: number, timeLimit: number) {
  const pct = timeRemaining / timeLimit
  const warn = pct < 0.25

  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 0.9)' : 'rgba(255, 255, 255, 0.7)'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`${Math.ceil(timeRemaining)}s`, cx, y)

  // Timer bar
  const barW = 120
  const barH = 3
  const barX = cx - barW / 2
  const barY = y + 22
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(barX, barY, barW, barH)
  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 0.7)' : 'rgba(100, 220, 255, 0.5)'
  ctx.fillRect(barX, barY, barW * pct, barH)
}

function drawResourceList(
  ctx: CanvasRenderingContext2D,
  rings: RingState[],
  activeRing: number,
  x: number,
  startY: number
) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i]
    const y = startY + i * 22
    const name = MATERIAL_NAMES[ring.deposit.material] ?? ring.deposit.material
    const pct = Math.round((1 - ring.remaining) * 100)
    const isDepleted = ring.remaining <= 0
    const isActive = i === activeRing

    // Indicator dot
    ctx.beginPath()
    ctx.arc(x, y + 6, 4, 0, Math.PI * 2)
    ctx.fillStyle = isDepleted ? hexToRgba(ring.color, 0.3) : isActive ? ring.color : hexToRgba(ring.color, 0.5)
    ctx.fill()

    // Name
    ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'
    ctx.font = `${isActive ? 'bold ' : ''}11px monospace`
    ctx.fillText(name, x + 12, y)

    // Percentage
    ctx.fillStyle = isDepleted
      ? 'rgba(0, 255, 136, 0.6)'
      : isActive
        ? 'rgba(255, 255, 255, 0.7)'
        : 'rgba(255, 255, 255, 0.3)'
    ctx.fillText(isDepleted ? '100%' : `${pct}%`, x + 120, y)
  }
}

export const MiningOverlay = (props: MiningOverlayProps) => {
  const { asteroid, onComplete } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<MiningState | null>(null)
  const frameRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const sortedDeposits = [...asteroid.stats.deposits].sort(
      (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
    )

    const rings = buildRings(sortedDeposits, w, h)
    const timeLimit = 25 + asteroid.scale * 12

    const state: MiningState = {
      deposits: sortedDeposits,
      rings,
      activeRing: 0,
      mouseX: w / 2,
      mouseY: h / 2,
      pushX: 0,
      pushY: 0,
      pushTargetX: 0,
      pushTargetY: 0,
      pushTimer: 0,
      timeLimit,
      timeRemaining: timeLimit,
      done: false
    }
    stateRef.current = state

    const handleMouseMove = (e: MouseEvent) => {
      if (state.done) return
      state.mouseX = e.clientX
      state.mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    let lastTime = performance.now()
    let elapsed = 0

    const animate = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      elapsed += dt

      if (state.done) return

      // Timer countdown
      state.timeRemaining -= dt
      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0
        state.done = true
        const collected = state.deposits.map((dep, i) => ({
          material: dep.material,
          amount: 1 - state.rings[i].remaining
        }))
        onCompleteRef.current(collected)
        return
      }

      // Push dynamics — random drift that fights the player
      state.pushTimer -= dt
      if (state.pushTimer <= 0) {
        const ring = state.rings[state.activeRing]
        if (ring) {
          const strength = ring.pushStrength
          const angle = Math.random() * Math.PI * 2
          state.pushTargetX = Math.cos(angle) * strength
          state.pushTargetY = Math.sin(angle) * strength
        }
        state.pushTimer = 0.25 + Math.random() * 0.4
      }
      state.pushX += (state.pushTargetX - state.pushX) * 4 * dt
      state.pushY += (state.pushTargetY - state.pushY) * 4 * dt

      const cursorX = state.mouseX + state.pushX
      const cursorY = state.mouseY + state.pushY

      // Check if cursor inside active ring
      const cx = w / 2
      const cy = h / 2
      const ring = state.rings[state.activeRing]
      let inside = false

      if (ring) {
        const dx = cursorX - cx
        const dy = cursorY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        inside = dist <= ring.outerRadius && dist >= ring.innerRadius

        if (inside) {
          // Mining rate: base 0.12/s, scaled by purity (lower purity = faster depletion)
          const rate = 0.12 + (1 - ring.deposit.purity) * 0.15
          ring.remaining = Math.max(0, ring.remaining - rate * dt)

          if (ring.remaining <= 0) {
            const nextRing = state.activeRing + 1
            state.activeRing = nextRing

            if (nextRing >= state.rings.length) {
              state.done = true
              const collected = state.deposits.map((dep, i) => ({
                material: dep.material,
                amount: 1 - state.rings[i].remaining
              }))
              onCompleteRef.current(collected)
              return
            }
          }
        }
      }

      // Draw
      ctx.clearRect(0, 0, w, h)

      // Semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.fillRect(0, 0, w, h)

      const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5

      // Draw rings back-to-front (inner first so outer overlaps)
      for (let i = state.rings.length - 1; i >= 0; i--) {
        drawRing(ctx, cx, cy, state.rings[i], i === state.activeRing, pulse)
      }

      // Center marker
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.fill()

      // Cursor
      drawCursor(ctx, cursorX, cursorY, inside, pulse)

      // Timer
      drawTimer(ctx, cx, 30, state.timeRemaining, state.timeLimit)

      // Asteroid name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(asteroid.name, cx, 58)

      // Resource list
      drawResourceList(ctx, state.rings, state.activeRing, 28, h - 30 - state.rings.length * 22)

      // Mining status
      if (ring && inside) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.6)'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('MINING', cx, cy + state.rings[0].outerRadius + 20)
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [asteroid])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const state = stateRef.current
        if (!state || state.done) return
        state.done = true
        const collected = state.deposits.map((dep, i) => ({
          material: dep.material,
          amount: 1 - state.rings[i].remaining
        }))
        onComplete(collected)
      }
    },
    [onComplete]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 20,
        cursor: 'none',
        pointerEvents: 'auto'
      }}
    />
  )
}
