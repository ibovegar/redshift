import { MATERIAL_NAMES, MATERIAL_SYMBOLS } from 'data/materials'
import { RARITY_COLORS } from 'data/rarity'
import type { Asteroid, AsteroidDeposit, AsteroidMaterial, ResourceRarity } from 'models/asteroid'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { DrillIntro } from './DrillIntro'
import { MiningSummary } from './MiningSummary'

export type CompletionReason = 'completed' | 'timeout' | 'destroyed' | 'aborted'

export interface CollectedResource {
  material: AsteroidMaterial
  amount: number
}

interface CompletionData {
  collected: CollectedResource[]
  reason: CompletionReason
}

interface DrillOverlayProps {
  asteroid: Asteroid
  tutorialSeen: boolean
  screenCenterRef: RefObject<{ x: number; y: number } | null>
  onTutorialDismiss: () => void
  onComplete: (collected: CollectedResource[]) => void
}

const RARITY_ORDER: ResourceRarity[] = ['common', 'uncommon', 'rare', 'precious', 'exotic']

// --- Tunnel config ---
const TUNNEL_RINGS = 5
const TUNNEL_DEPTH = 600 // pixel depth of the tunnel
const RETICLE_RADIUS = 18
const CENTER_TOLERANCE = 40 // pixel radius for "on-center"
const SLIP_THRESHOLD = 80 // beyond this, drill takes damage

// --- Spark system ---
interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
}

// --- Pressure strike ---
interface PressureStrike {
  radius: number // current contracting radius
  targetRadius: number // radius to click at (the sweet spot)
  speed: number // contraction speed
  active: boolean
  hit: boolean // was it clicked in time?
  flashTimer: number // visual feedback timer
  expandRadius: number // expanding ring on hit
}

// --- Fracture hazard ---
interface FractureHazard {
  x: number
  y: number
  radius: number
  life: number
  maxLife: number
  warned: boolean // briefly visible before becoming dangerous
  cursorInside: boolean // tracks entry for one-shot bounce
}

interface HazardFlash {
  x: number
  y: number
  radius: number
  alpha: number
  color: [number, number, number]
  expandSpeed: number
}

interface DepositState {
  deposit: AsteroidDeposit
  remaining: number
  color: string
  revealProgress: number // 0–1 how much of the name is revealed
}

interface DrillState {
  deposits: DepositState[]
  activeDeposit: number
  mouseX: number
  mouseY: number
  targetX: number
  targetY: number
  targetVX: number
  targetVY: number
  drillHealth: number // 0–1
  depth: number // 0–1 overall progress through current deposit
  shakeIntensity: number
  shakeX: number
  shakeY: number
  sparks: Spark[]
  strike: PressureStrike | null
  strikeTimer: number // countdown to next strike
  hazards: FractureHazard[]
  hazardTimer: number // countdown to next hazard spawn
  orbitAngle: number // last measured angle from target to cursor
  orbitSpeed: number // angular speed of cursor around target
  orbitBonus: number // smoothed multiplier from orbiting (0–1)
  bounceX: number // hazard bounce offset X
  bounceY: number // hazard bounce offset Y
  bounceVX: number // hazard bounce velocity X
  bounceVY: number // hazard bounce velocity Y
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

function spawnSparks(cx: number, cy: number, count: number, intensity: number): Spark[] {
  const sparks: Spark[] = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 80 + Math.random() * 200 * intensity
    const life = 0.3 + Math.random() * 0.5
    sparks.push({
      x: cx + (Math.random() - 0.5) * 10,
      y: cy + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1 + Math.random() * 2.5,
      life,
      maxLife: life,
      color: Math.random() > 0.3 ? '#ffcc44' : '#ff8833'
    })
  }
  return sparks
}

function drawTunnel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  depth: number,
  shakeX: number,
  shakeY: number,
  elapsed: number,
  depositColor: string
) {
  // Draw concentric rings receding into a tunnel
  for (let i = TUNNEL_RINGS; i >= 0; i--) {
    const t = i / TUNNEL_RINGS
    const ringDepth = t * TUNNEL_DEPTH
    const perspective = 1 / (1 + ringDepth * 0.004)
    const radius = 220 * perspective
    const wobble = Math.sin(elapsed * 2.5 + i * 0.7) * 3 * (1 - t) * depth
    const rx = cx + shakeX * t + wobble
    const ry = cy + shakeY * t + wobble * 0.6

    // Ring border
    const alpha = 0.5 + (1 - t) * 0.5
    ctx.beginPath()
    ctx.arc(rx, ry, radius, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(depositColor, alpha)
    ctx.lineWidth = 2
    ctx.stroke()

    // Depth markers — dashed lines for texture
    if (i % 3 === 0 && i > 0) {
      const segCount = 8
      for (let s = 0; s < segCount; s++) {
        const angle = (s / segCount) * Math.PI * 2 + elapsed * 0.3
        const x1 = rx + Math.cos(angle) * radius
        const y1 = ry + Math.sin(angle) * radius
        const len = 6 * perspective
        const x2 = rx + Math.cos(angle) * (radius - len)
        const y2 = ry + Math.sin(angle) * (radius - len)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = hexToRgba(depositColor, alpha * 0.5)
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }

  // Center glow — the core they're drilling toward
  const coreGlow = ctx.createRadialGradient(cx + shakeX, cy + shakeY, 0, cx + shakeX, cy + shakeY, 30)
  coreGlow.addColorStop(0, hexToRgba(depositColor, 0.15 + depth * 0.2))
  coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.beginPath()
  ctx.arc(cx + shakeX, cy + shakeY, 30, 0, Math.PI * 2)
  ctx.fillStyle = coreGlow
  ctx.fill()
}

function drawTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elapsed: number,
  vx: number,
  vy: number,
  onCenter: boolean
) {
  const trackColor = onCenter ? 'rgba(0, 255, 136, 1)' : 'rgba(255, 80, 50, 1)'

  // Direction arc — solid quarter circle showing movement direction
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed > 2) {
    const dir = Math.atan2(vy, vx)
    const arcRadius = 26
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, arcRadius, dir - Math.PI / 4, dir + Math.PI / 4)
    ctx.closePath()
    ctx.fillStyle = onCenter ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 80, 50, 0.4)'
    ctx.fill()
  }

  // Filled circle
  ctx.beginPath()
  ctx.arc(x, y, 14, 0, Math.PI * 2)
  ctx.fillStyle = trackColor
  ctx.fill()

  // Outer ring
  ctx.beginPath()
  ctx.arc(x, y, 14, 0, Math.PI * 2)
  ctx.strokeStyle = trackColor
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Inner dot
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, Math.PI * 2)
  ctx.fillStyle = trackColor
  ctx.fill()

  // Rotating ticks (inside the circle)
  for (let i = 0; i < 4; i++) {
    const angle = elapsed * 1.5 + (i / 4) * Math.PI * 2
    const inner = 7
    const outer = 13
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner)
    ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawReticle(ctx: CanvasRenderingContext2D, x: number, y: number, onCenter: boolean, pulse: number) {
  const color = onCenter ? 'rgba(0, 255, 136, 1)' : 'rgba(255, 100, 60, 1)'
  const size = RETICLE_RADIUS

  // Glow when on center
  if (onCenter) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5)
    glow.addColorStop(0, `rgba(0, 255, 136, ${0.15 + pulse * 0.1})`)
    glow.addColorStop(1, 'rgba(0, 255, 136, 0)')
    ctx.beginPath()
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()
  }

  // Crosshair lines
  ctx.beginPath()
  ctx.moveTo(x - size, y)
  ctx.lineTo(x - 6, y)
  ctx.moveTo(x + 6, y)
  ctx.lineTo(x + size, y)
  ctx.moveTo(x, y - size)
  ctx.lineTo(x, y - 6)
  ctx.moveTo(x, y + 6)
  ctx.lineTo(x, y + size)
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Center dot — filled when on center
  ctx.beginPath()
  ctx.arc(x, y, 4, 0, Math.PI * 2)
  if (onCenter) {
    ctx.fillStyle = color
    ctx.fill()
  } else {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Outer ring
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.strokeStyle = onCenter ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 100, 60, 0.5)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function drawDrillHealth(ctx: CanvasRenderingContext2D, x: number, y: number, health: number) {
  const barW = 140
  const barH = 10
  const warn = health < 0.3

  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 0.9)' : 'rgba(255, 255, 255, 0.8)'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('DRILL INTEGRITY', x, y - 6)

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(x, y, barW, barH)

  // Health bar
  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 1)' : 'rgba(0, 220, 136, 1)'
  ctx.fillRect(x, y, barW * health, barH)

  // Border
  ctx.strokeStyle = warn ? 'rgba(255, 80, 60, 0.6)' : 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(x, y, barW, barH)

  // Percentage
  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 1)' : 'rgba(255, 255, 255, 0.9)'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`${Math.round(health * 100)}%`, x + barW + 8, y - 1)
}

function drawDepthMeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  deposits: DepositState[],
  activeDeposit: number
) {
  const barW = 12

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(x, y, barW, h)

  // Deposit segments
  const totalDeposits = deposits.length
  const segH = h / totalDeposits
  for (let i = 0; i < totalDeposits; i++) {
    const dep = deposits[i]
    const segY = y + i * segH
    const mined = 1 - dep.remaining

    // Mined portion
    ctx.fillStyle = hexToRgba(dep.color, 0.6)
    ctx.fillRect(x, segY, barW, segH * mined)

    // Segment border
    ctx.strokeStyle = i === activeDeposit ? hexToRgba(dep.color, 0.9) : 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(x, segY, barW, segH)
  }

  // Active deposit indicator
  if (activeDeposit < totalDeposits) {
    const dep = deposits[activeDeposit]
    const segY = y + activeDeposit * segH
    ctx.strokeStyle = dep.color
    ctx.lineWidth = 2.5
    ctx.strokeRect(x - 1, segY - 1, barW + 2, segH + 2)
  }

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, barW, h)
}

function drawTimer(ctx: CanvasRenderingContext2D, cx: number, y: number, timeRemaining: number, timeLimit: number) {
  const pct = timeRemaining / timeLimit
  const warn = pct < 0.25

  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 1)' : 'rgba(255, 255, 255, 0.95)'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`${Math.ceil(timeRemaining)}s`, cx, y)

  const barW = 140
  const barH = 5
  const barX = cx - barW / 2
  const barY = y + 24
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(barX, barY, barW, barH)
  ctx.fillStyle = warn ? 'rgba(255, 80, 60, 1)' : 'rgba(100, 220, 255, 0.9)'
  ctx.fillRect(barX, barY, barW * pct, barH)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(barX, barY, barW, barH)
}

function drawDepositList(
  ctx: CanvasRenderingContext2D,
  deposits: DepositState[],
  activeDeposit: number,
  x: number,
  startY: number
) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  for (let i = 0; i < deposits.length; i++) {
    const dep = deposits[i]
    const y = startY + i * 22
    const name = MATERIAL_NAMES[dep.deposit.material] ?? dep.deposit.material
    const pct = Math.round((1 - dep.remaining) * 100)
    const isDepleted = dep.remaining <= 0
    const isActive = i === activeDeposit

    // Reveal name progressively
    const revealedChars = Math.floor(dep.revealProgress * name.length)
    const displayName =
      dep.revealProgress >= 1 || isDepleted
        ? name
        : name
            .split('')
            .map((ch, ci) => (ci < revealedChars ? ch : ch === ' ' ? ' ' : '▪'))
            .join('')

    ctx.beginPath()
    ctx.arc(x, y + 6, 4, 0, Math.PI * 2)
    ctx.fillStyle = isDepleted ? hexToRgba(dep.color, 0.5) : isActive ? dep.color : hexToRgba(dep.color, 0.8)
    ctx.fill()

    ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.7)'
    ctx.font = `${isActive ? 'bold ' : ''}11px monospace`
    ctx.fillText(displayName, x + 12, y)

    ctx.fillStyle = isDepleted
      ? 'rgba(0, 255, 136, 0.9)'
      : isActive
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(isDepleted ? '100%' : `${pct}%`, x + 120, y)
  }
}

export const DrillOverlay = (props: DrillOverlayProps) => {
  const { asteroid, tutorialSeen, screenCenterRef, onTutorialDismiss, onComplete } = props

  const [started, setStarted] = useState(tutorialSeen)
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<DrillState | null>(null)
  const frameRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const setCompletionDataRef = useRef(setCompletionData)
  setCompletionDataRef.current = setCompletionData

  // biome-ignore lint/correctness/useExhaustiveDependencies: screenCenterRef is a ref read in rAF loop; started intentionally restarts effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const cx = screenCenterRef.current?.x ?? w / 2
    const cy = screenCenterRef.current?.y ?? h / 2
    let centerX = cx
    let centerY = cy

    const sortedDeposits = [...asteroid.stats.deposits].sort(
      (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
    )

    const deposits: DepositState[] = sortedDeposits.map((dep) => ({
      deposit: dep,
      remaining: 1,
      color: RARITY_COLORS[dep.rarity] ?? '#aaa',
      revealProgress: 0
    }))

    const timeLimit = 30 + asteroid.scale * 10

    const state: DrillState = {
      deposits,
      activeDeposit: 0,
      mouseX: cx,
      mouseY: cy,
      targetX: cx,
      targetY: cy,
      targetVX: 30,
      targetVY: 20,
      drillHealth: 1,
      depth: 0,
      shakeIntensity: 0,
      shakeX: 0,
      shakeY: 0,
      sparks: [],
      strike: null,
      strikeTimer: 3 + Math.random() * 2,
      hazards: [],
      hazardTimer: 5 + Math.random() * 3,
      orbitAngle: 0,
      orbitSpeed: 0,
      orbitBonus: 0,
      bounceX: 0,
      bounceY: 0,
      bounceVX: 0,
      bounceVY: 0,
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
    const handleClick = () => {
      if (state.done || !clickReady) return
      // Click ripples
      const mx = state.mouseX
      const my = state.mouseY
      clickRipples.push(
        { x: mx, y: my, radius: 5, alpha: 0.7, speed: 400 + Math.random() * 200 },
        { x: mx, y: my, radius: 5, alpha: 0.5, speed: 500 + Math.random() * 250 },
        { x: mx, y: my, radius: 5, alpha: 0.3, speed: 600 + Math.random() * 300 }
      )
      // Check pressure strike
      if (state.strike?.active) {
        const diff = Math.abs(state.strike.radius - state.strike.targetRadius)
        if (diff < 20) {
          state.strike.hit = true
          state.strike.active = false
          state.strike.flashTimer = 1.2
          state.strike.expandRadius = state.strike.radius
          state.shakeIntensity += 25
          // Shockwave flashes (same style as hazard hit, but blue)
          for (let r = 0; r < 5; r++) {
            hazardFlashes.push({
              x: state.targetX,
              y: state.targetY,
              radius: state.strike.targetRadius + r * 15,
              alpha: 1 - r * 0.15,
              color: [100, 200, 255],
              expandSpeed: 300
            })
          }
          // Big burst of sparks from target on successful strike
          for (let s = 0; s < 24; s++) {
            const angle = (s / 24) * Math.PI * 2 + Math.random() * 0.3
            const speed = 100 + Math.random() * 200
            state.sparks.push({
              x: state.targetX,
              y: state.targetY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.8 + Math.random() * 0.6,
              maxLife: 1.4,
              size: 2 + Math.random() * 3,
              color: Math.random() > 0.4 ? '#66ddff' : '#aaeeff'
            })
          }
          // Burst of resource labels radiating outward
          const ad = state.deposits[state.activeDeposit]
          if (ad) {
            const sym = MATERIAL_SYMBOLS[ad.deposit.material] ?? '?'
            for (let l = 0; l < 8; l++) {
              const angle = (l / 8) * Math.PI * 2 + Math.random() * 0.4
              const dist = 30 + Math.random() * 20
              floatingSymbols.push({
                x: state.targetX + Math.cos(angle) * dist,
                y: state.targetY + Math.sin(angle) * dist,
                alpha: 1,
                symbol: sym,
                color: ad.color
              })
            }
          }
        }
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    let lastTime = performance.now()
    let elapsed = 0
    let sparkTimer = 0
    let clickReady = false
    const clickRipples: { x: number; y: number; radius: number; alpha: number; speed: number }[] = []
    const hazardFlashes: HazardFlash[] = []
    const floatingSymbols: { x: number; y: number; alpha: number; symbol: string; color: string }[] = []
    let symbolTimer = 0
    requestAnimationFrame(() => {
      clickReady = true
    })

    const animate = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      elapsed += dt

      // Update center from screen projection
      const sc = screenCenterRef.current
      if (sc) {
        centerX = sc.x
        centerY = sc.y
      }

      if (state.done) return

      // Timer
      state.timeRemaining -= dt
      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0
        state.done = true
        const collected = state.deposits.map((dep) => ({
          material: dep.deposit.material,
          amount: 1 - dep.remaining
        }))
        setCompletionDataRef.current({ collected, reason: 'timeout' })
        return
      }

      // Drill health game over
      if (state.drillHealth <= 0) {
        state.done = true
        const collected = state.deposits.map((dep) => ({
          material: dep.deposit.material,
          amount: 1 - dep.remaining
        }))
        setCompletionDataRef.current({ collected, reason: 'destroyed' })
        return
      }

      // --- Target movement ---
      // The target drifts around the center, getting more erratic with depth
      const activeDep = state.deposits[state.activeDeposit]
      const rarity = activeDep ? RARITY_ORDER.indexOf(activeDep.deposit.rarity) : 0
      const totalDeposits = state.deposits.length
      const overallProgress = (state.activeDeposit + state.depth) / Math.max(1, totalDeposits)
      const depthFactor = 1 + overallProgress * 3 + rarity * 0.5
      const wanderRadius = 60 + depthFactor * 25

      // Random velocity changes
      if (Math.random() < 2.5 * dt) {
        state.targetVX += (Math.random() - 0.5) * 80 * depthFactor
        state.targetVY += (Math.random() - 0.5) * 80 * depthFactor
      }

      // Clamp velocity
      const maxSpeed = 50 + depthFactor * 30
      const speed = Math.sqrt(state.targetVX ** 2 + state.targetVY ** 2)
      if (speed > maxSpeed) {
        state.targetVX = (state.targetVX / speed) * maxSpeed
        state.targetVY = (state.targetVY / speed) * maxSpeed
      }

      state.targetX += state.targetVX * dt
      state.targetY += state.targetVY * dt

      // Spring force pulling target back toward center
      const dxFromCenter = state.targetX - centerX
      const dyFromCenter = state.targetY - centerY
      const distFromCenter = Math.sqrt(dxFromCenter ** 2 + dyFromCenter ** 2)
      if (distFromCenter > wanderRadius) {
        const pullStrength = 3 + depthFactor
        state.targetVX -= (dxFromCenter / distFromCenter) * pullStrength * dt * 60
        state.targetVY -= (dyFromCenter / distFromCenter) * pullStrength * dt * 60
      }
      // Gentle centering force always
      state.targetVX -= dxFromCenter * 0.5 * dt
      state.targetVY -= dyFromCenter * 0.5 * dt

      // --- Distance check ---
      // Integrate bounce velocity into offset, then decay both
      state.bounceX += state.bounceVX * dt
      state.bounceY += state.bounceVY * dt
      const velDecay = 0.01 ** dt // velocity decays fast
      state.bounceVX *= velDecay
      state.bounceVY *= velDecay
      const posDecay = 0.05 ** dt // offset drifts back
      state.bounceX *= posDecay
      state.bounceY *= posDecay
      if (Math.abs(state.bounceX) < 0.5 && Math.abs(state.bounceVX) < 1) {
        state.bounceX = 0
        state.bounceVX = 0
      }
      if (Math.abs(state.bounceY) < 0.5 && Math.abs(state.bounceVY) < 1) {
        state.bounceY = 0
        state.bounceVY = 0
      }

      const effectiveMouseX = state.mouseX + state.bounceX
      const effectiveMouseY = state.mouseY + state.bounceY
      const dx = effectiveMouseX - state.targetX
      const dy = effectiveMouseY - state.targetY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const onCenter = dist < CENTER_TOLERANCE
      const slipping = dist > SLIP_THRESHOLD

      // --- Orbit detection ---
      // Measure angular velocity of cursor around target
      const newAngle = Math.atan2(dy, dx)
      let angleDelta = newAngle - state.orbitAngle
      // Normalize to [-PI, PI]
      if (angleDelta > Math.PI) angleDelta -= Math.PI * 2
      if (angleDelta < -Math.PI) angleDelta += Math.PI * 2
      state.orbitAngle = newAngle
      const rawOrbitSpeed = Math.abs(angleDelta / Math.max(dt, 0.001))
      state.orbitSpeed = state.orbitSpeed * 0.9 + rawOrbitSpeed * 0.1
      // Orbit bonus: peaks when orbiting at ~3-6 rad/s within a reasonable distance
      const orbitDistOk = dist > 20 && dist < 120
      const orbitSpeedOk = state.orbitSpeed > 1.5 && state.orbitSpeed < 12
      const targetOrbit = orbitDistOk && orbitSpeedOk ? Math.min(1, (state.orbitSpeed - 1.5) / 4) : 0
      state.orbitBonus += (targetOrbit - state.orbitBonus) * 3 * dt

      // --- Fracture hazards ---
      state.hazardTimer -= dt
      if (state.hazardTimer <= 0 && state.hazards.length < 3 + Math.floor(overallProgress * 3)) {
        const hAngle = Math.random() * Math.PI * 2
        const hDist = 40 + Math.random() * 80
        state.hazards.push({
          x: state.targetX + Math.cos(hAngle) * hDist,
          y: state.targetY + Math.sin(hAngle) * hDist,
          radius: 25 + Math.random() * 15 + overallProgress * 10,
          life: 2.5 + Math.random() * 1.5 + overallProgress,
          maxLife: 2.5 + Math.random() * 1.5 + overallProgress,
          warned: false,
          cursorInside: false
        })
        state.hazardTimer = Math.max(1, 3 + Math.random() * 4 - overallProgress * 4)
      }
      // Update hazards
      let inHazard = false
      for (const haz of state.hazards) {
        haz.life -= dt
        if (!haz.warned && haz.life < haz.maxLife - 0.6) haz.warned = true
        // Check if cursor is inside an active hazard (use raw mouse pos, not bounced)
        if (haz.warned && haz.life > 0) {
          const hdx = state.mouseX - haz.x
          const hdy = state.mouseY - haz.y
          const hdist = Math.sqrt(hdx * hdx + hdy * hdy)
          if (hdist < haz.radius) {
            inHazard = true
            // Bounce cursor away on first contact
            if (!haz.cursorInside) {
              haz.cursorInside = true
              const bounceSpeed = 800
              const nx = hdist > 0 ? hdx / hdist : 0
              const ny = hdist > 0 ? hdy / hdist : -1
              state.bounceVX = nx * bounceSpeed
              state.bounceVY = ny * bounceSpeed
              state.bounceX = 0
              state.bounceY = 0
              state.shakeIntensity += 25
              // Spawn shockwave rings
              for (let r = 0; r < 5; r++) {
                hazardFlashes.push({
                  x: haz.x,
                  y: haz.y,
                  radius: haz.radius + r * 8,
                  alpha: 1 - r * 0.15,
                  color: [255, 60, 40],
                  expandSpeed: 300
                })
              }
            }
          } else {
            haz.cursorInside = false
          }
        }
      }
      state.hazards = state.hazards.filter((h) => h.life > 0)
      // Hazard penalty: damages drill while inside
      if (inHazard) {
        state.drillHealth = Math.max(0, state.drillHealth - 0.15 * dt)
        state.shakeIntensity += 6
      }
      // Update hazard flashes
      for (let i = hazardFlashes.length - 1; i >= 0; i--) {
        hazardFlashes[i].radius += hazardFlashes[i].expandSpeed * dt
        hazardFlashes[i].alpha -= 2 * dt
        if (hazardFlashes[i].alpha <= 0) hazardFlashes.splice(i, 1)
      }

      // --- Pressure strikes ---
      if (state.strike) {
        if (state.strike.active) {
          state.strike.radius -= state.strike.speed * dt
          if (state.strike.radius <= 0) {
            state.strike.active = false // missed
            state.strike.flashTimer = 0.3
          }
        } else {
          state.strike.flashTimer -= dt
          if (state.strike.hit) {
            state.strike.expandRadius += 450 * dt
          }
          if (state.strike.flashTimer <= 0) {
            // Apply bonus or penalty
            if (state.strike.hit && activeDep) {
              activeDep.remaining = Math.max(0, activeDep.remaining - 0.2)
            }
            state.strike = null
            state.strikeTimer = Math.max(1.5, 4 + Math.random() * 3 - overallProgress * 4)
          }
        }
      } else {
        state.strikeTimer -= dt
        if (state.strikeTimer <= 0) {
          state.strike = {
            radius: 80 + Math.random() * 30,
            targetRadius: Math.max(10, 14 + Math.random() * 8 - overallProgress * 4),
            speed: 35 + overallProgress * 40,
            active: true,
            hit: false,
            flashTimer: 0,
            expandRadius: 0
          }
        }
      }

      // --- Screen shake ---
      state.shakeIntensity = state.depth * 8 + (slipping ? 4 : 0)
      state.shakeX = (Math.random() - 0.5) * state.shakeIntensity
      state.shakeY = (Math.random() - 0.5) * state.shakeIntensity

      // --- Drill health ---
      if (slipping) {
        state.drillHealth = Math.max(0, state.drillHealth - 0.06 * dt)
      } else if (!onCenter) {
        state.drillHealth = Math.max(0, state.drillHealth - 0.02 * dt)
      }

      // --- Mining ---
      if (activeDep) {
        // Mining speed scales with drill health and centering
        const healthMul = 0.2 + state.drillHealth * 0.8
        const centerMul = onCenter ? 1 : slipping ? 0.15 : 0.4
        const orbitMul = 1 + state.orbitBonus * 0.6
        const rate = (0.1 + (1 - activeDep.deposit.purity) * 0.08) * healthMul * centerMul * orbitMul

        activeDep.remaining = Math.max(0, activeDep.remaining - rate * dt)
        state.depth = 1 - activeDep.remaining

        // Reveal resource name while cursor is centered
        if (onCenter && activeDep.revealProgress < 1) {
          activeDep.revealProgress = Math.min(1, activeDep.revealProgress + 0.5 * dt)
        }

        // Spawn floating symbol while extracting on center
        if (onCenter) {
          symbolTimer -= dt
          if (symbolTimer <= 0) {
            const sym = MATERIAL_SYMBOLS[activeDep.deposit.material] ?? '?'
            floatingSymbols.push({
              x: state.targetX + (Math.random() - 0.5) * 20,
              y: state.targetY - 20,
              alpha: 1,
              symbol: sym,
              color: activeDep.color
            })
            symbolTimer = 0.6 + Math.random() * 0.4
          }
        } else {
          symbolTimer = 0
        }

        if (activeDep.remaining <= 0) {
          const next = state.activeDeposit + 1
          state.activeDeposit = next
          state.depth = 0

          if (next >= state.deposits.length) {
            state.done = true
            const collected = state.deposits.map((dep) => ({
              material: dep.deposit.material,
              amount: 1 - dep.remaining
            }))
            setCompletionDataRef.current({ collected, reason: 'completed' })
            return
          }
        }
      }

      // --- Sparks ---
      sparkTimer -= dt
      if (sparkTimer <= 0) {
        const count = onCenter ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2)
        state.sparks.push(
          ...spawnSparks(state.targetX + state.shakeX, state.targetY + state.shakeY, count, state.depth)
        )
        sparkTimer = 0.03 + Math.random() * 0.04
      }

      // Update sparks
      for (const spark of state.sparks) {
        spark.x += spark.vx * dt
        spark.y += spark.vy * dt
        spark.vy += 120 * dt // gravity
        spark.life -= dt
      }
      state.sparks = state.sparks.filter((s) => s.life > 0)

      // Update floating symbols
      for (let i = floatingSymbols.length - 1; i >= 0; i--) {
        floatingSymbols[i].y -= 80 * dt
        floatingSymbols[i].alpha -= 0.4 * dt
        if (floatingSymbols[i].alpha <= 0) floatingSymbols.splice(i, 1)
      }

      // --- Draw ---
      ctx.clearRect(0, 0, w, h)

      // Apply screen shake via transform
      ctx.save()
      ctx.translate(state.shakeX, state.shakeY)

      const depositColor = activeDep?.color ?? '#aaa'
      const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5

      // Tunnel
      drawTunnel(ctx, centerX, centerY, state.depth, state.shakeX * 0.3, state.shakeY * 0.3, elapsed, depositColor)

      // Fracture hazards
      for (const haz of state.hazards) {
        const age = haz.maxLife - haz.life
        const warningPhase = age < 0.6
        const fadeOut = haz.life < 0.4 ? haz.life / 0.4 : 1
        if (warningPhase) {
          // Warning — pulsing outline
          const wPulse = Math.sin(age * 15) * 0.5 + 0.5
          ctx.beginPath()
          ctx.arc(haz.x, haz.y, haz.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 60, 40, ${0.2 + wPulse * 0.3})`
          ctx.lineWidth = 1.5
          ctx.setLineDash([3, 5])
          ctx.stroke()
          ctx.setLineDash([])
        } else {
          // Active danger zone
          ctx.beginPath()
          ctx.arc(haz.x, haz.y, haz.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 40, 20, ${0.4 * fadeOut})`
          ctx.fill()
          ctx.beginPath()
          ctx.arc(haz.x, haz.y, haz.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 60, 40, ${0.5 * fadeOut})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          // Skull/warning icon
          ctx.fillStyle = `rgba(255, 80, 50, ${0.6 * fadeOut})`
          ctx.font = '10px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('⚠', haz.x, haz.y)
        }
      }

      // Shockwave flashes (hazard + strike)
      for (const flash of hazardFlashes) {
        const [cr, cg, cb] = flash.color
        ctx.beginPath()
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${flash.alpha})`
        ctx.lineWidth = Math.max(0.5, 3 * flash.alpha)
        ctx.stroke()
        // Inner flash
        if (flash.alpha > 0.5) {
          ctx.beginPath()
          ctx.arc(flash.x, flash.y, flash.radius * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(flash.alpha - 0.5) * 0.6})`
          ctx.fill()
        }
      }

      // Pressure strike ring
      if (state.strike) {
        if (state.strike.active) {
          // Contracting ring
          ctx.beginPath()
          ctx.arc(state.targetX, state.targetY, state.strike.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(100, 200, 255, ${0.8 + pulse * 0.2})`
          ctx.lineWidth = 3.5
          ctx.stroke()
          // Target ring (sweet spot)
          ctx.beginPath()
          ctx.arc(state.targetX, state.targetY, state.strike.targetRadius, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(100, 255, 180, 0.6)'
          ctx.lineWidth = 8
          ctx.stroke()
        } else if (state.strike.flashTimer > 0) {
          // Hit flash — center glow only (shockwave rings handled by hazardFlashes)
          const flashAlpha = state.strike.flashTimer / 1.2
          if (state.strike.hit) {
            state.strike.expandRadius += 450 * dt
            // Bright center flash
            if (flashAlpha > 0.2) {
              ctx.beginPath()
              ctx.arc(state.targetX, state.targetY, 30 * flashAlpha, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(180, 240, 255, ${(flashAlpha - 0.2) * 0.6})`
              ctx.fill()
            }
          }
        }
      }

      // Orbit bonus visual — glowing arc around the target when orbiting
      if (state.orbitBonus > 0.1) {
        const arcAlpha = state.orbitBonus * 0.4
        ctx.beginPath()
        ctx.arc(state.targetX, state.targetY, 30, elapsed * 2, elapsed * 2 + Math.PI * 1.2)
        ctx.strokeStyle = `rgba(100, 220, 255, ${arcAlpha})`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(state.targetX, state.targetY, 30, elapsed * 2 + Math.PI, elapsed * 2 + Math.PI * 2.2)
        ctx.strokeStyle = `rgba(100, 220, 255, ${arcAlpha * 0.6})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Sparks (drawn behind the drill target)
      for (const spark of state.sparks) {
        const alpha = spark.life / spark.maxLife
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, spark.size * alpha, 0, Math.PI * 2)
        ctx.fillStyle = spark.color
          .replace(')', `, ${alpha})`)
          .replace('rgb(', 'rgba(')
          .replace('#ffcc44', `rgba(255, 204, 68, ${alpha})`)
          .replace('#ff8833', `rgba(255, 136, 51, ${alpha})`)
        // Simpler approach for hex colors
        if (spark.color.startsWith('#')) {
          const r = Number.parseInt(spark.color.slice(1, 3), 16)
          const g = Number.parseInt(spark.color.slice(3, 5), 16)
          const b = Number.parseInt(spark.color.slice(5, 7), 16)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
        ctx.fill()
      }

      // Target
      drawTarget(ctx, state.targetX, state.targetY, elapsed, state.targetVX, state.targetVY, onCenter)

      // Floating material symbols
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const fs of floatingSymbols) {
        ctx.font = 'bold 13px monospace'
        ctx.shadowColor = fs.color
        ctx.shadowBlur = 8
        ctx.fillStyle = hexToRgba(fs.color, fs.alpha)
        ctx.fillText(fs.symbol, fs.x, fs.y)
        ctx.shadowBlur = 0
      }

      // Reticle at mouse position
      drawReticle(ctx, effectiveMouseX, effectiveMouseY, onCenter, pulse)

      // Distance line from reticle to target
      if (dist > 10) {
        ctx.beginPath()
        ctx.moveTo(effectiveMouseX, effectiveMouseY)
        ctx.lineTo(state.targetX, state.targetY)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 6])
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.restore() // end screen shake

      // Click ripples (drawn outside shake transform)
      for (const ripple of clickRipples) {
        ripple.radius += ripple.speed * dt
        ripple.alpha -= 1.5 * dt
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(100, 200, 255, ${Math.max(0, ripple.alpha)})`
        ctx.lineWidth = Math.max(0.5, 2 * ripple.alpha)
        ctx.stroke()
      }
      // Remove faded ripples
      for (let i = clickRipples.length - 1; i >= 0; i--) {
        if (clickRipples[i].alpha <= 0) clickRipples.splice(i, 1)
      }

      // --- HUD (not shaken) — positioned around the tunnel rings ---
      const ringRight = centerX + 300
      const ringLeft = centerX - 360
      const ringTop = centerY - 240

      // Timer — above rings
      drawTimer(ctx, centerX, ringTop - 90, state.timeRemaining, state.timeLimit)

      // Asteroid name — above rings, below timer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(asteroid.name, centerX, ringTop - 54)

      // Status
      if (slipping) {
        ctx.fillStyle = `rgba(255, 60, 40, ${0.6 + pulse * 0.3})`
        ctx.font = 'bold 16px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('⚠ DRILL SLIPPING', centerX, ringTop - 36)
      } else if (onCenter) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.8)'
        ctx.font = 'bold 16px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('◆ LOCKED ON', centerX, ringTop - 36)
      }

      // Orbit bonus indicator
      if (state.orbitBonus > 0.15) {
        ctx.fillStyle = `rgba(100, 220, 255, ${0.4 + state.orbitBonus * 0.4})`
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`ORBIT ×${(1 + state.orbitBonus * 0.6).toFixed(1)}`, centerX, ringTop - 18)
      }

      // Drill health bar — right of rings
      drawDrillHealth(ctx, ringRight, centerY - 20, state.drillHealth)

      // Depth meter — left of rings
      const meterH = 180
      drawDepthMeter(ctx, ringLeft - 12, centerY - meterH / 2, meterH, state.deposits, state.activeDeposit)

      // Deposit list — left of rings, above depth meter
      const listH = state.deposits.length * 22
      drawDepositList(ctx, state.deposits, state.activeDeposit, ringLeft - 8, centerY - meterH / 2 - listH - 10)

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
      window.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [asteroid, started])

  const handleIntroStart = useCallback(() => {
    setStarted(true)
    onTutorialDismiss()
  }, [onTutorialDismiss])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const state = stateRef.current
        if (!state || state.done) return
        state.done = true
        const collected = state.deposits.map((dep) => ({
          material: dep.deposit.material,
          amount: 1 - dep.remaining
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

  if (!started) {
    return <DrillIntro onStart={handleIntroStart} />
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 20,
          cursor: completionData ? 'default' : 'none',
          pointerEvents: 'auto'
        }}
      />
      {completionData && (
        <MiningSummary
          collected={completionData.collected}
          reason={completionData.reason}
          onContinue={() => onComplete(completionData.collected)}
        />
      )}
    </>
  )
}
