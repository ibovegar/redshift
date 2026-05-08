export type SolarEventPhase = 'idle' | 'warning' | 'active' | 'cooldown'

export interface SolarFlare {
  intensity: number
  startTime: number
  duration: number
  sustained?: boolean
}

const HOME_POSITION: [number, number, number] = [1.2, 0.25, -3.5]
const DOCK_RADIUS = 0.5

export class SolarEvent {
  phase: SolarEventPhase = 'idle'

  // Flare visuals (cosmetic, random bursts)
  private flares: SolarFlare[] = []
  private nextFlareTime = 0
  currentFlareIntensity = 0

  // Radiation event timing
  private eventInterval = [240, 360] as const // 4-6 min between events
  private nextEventTime = 0
  warningDuration = 30
  private activeDuration = 20
  readonly cooldownDuration = 15

  phaseStartTime = 0
  countdown = 0
  radiationActive = false

  // Damage
  private damageRate = 5 // condition per second
  onConditionChange?: (delta: number) => void

  constructor() {
    this.scheduleNextEvent(0)
    this.scheduleNextFlare(0)
  }

  private scheduleNextEvent(now: number) {
    const [min, max] = this.eventInterval
    this.nextEventTime = now + min + Math.random() * (max - min)
  }

  private scheduleNextFlare(now: number) {
    this.nextFlareTime = now + 15 + Math.random() * 15
  }

  isShipDocked(shipPos: [number, number, number]): boolean {
    const dx = shipPos[0] - HOME_POSITION[0]
    const dy = shipPos[1] - HOME_POSITION[1]
    const dz = shipPos[2] - HOME_POSITION[2]
    return Math.sqrt(dx * dx + dy * dy + dz * dz) < DOCK_RADIUS
  }

  update(elapsed: number, dt: number, shipPos: [number, number, number]) {
    // Update cosmetic flares
    this.currentFlareIntensity = 0
    for (const flare of this.flares) {
      const t = (elapsed - flare.startTime) / flare.duration
      if (t >= 0 && t <= 1) {
        // Smooth rise for sustained, snap for bursts; exponential decay; smooth tail fade-out
        const riseEnd = flare.sustained ? 0.25 : 0.02
        const riseT = Math.min(1, t / riseEnd)
        const rise = flare.sustained ? 0.12 + 0.88 * riseT * riseT * (3 - 2 * riseT) : riseT
        const decay = flare.sustained ? 1.0 : Math.exp(-(t - 0.02) * 4)
        const fadeStart = flare.sustained ? 0.6 : 0.7
        const fadeT = t > fadeStart ? (t - fadeStart) / (1 - fadeStart) : 0
        const eased = fadeT * fadeT * (3 - 2 * fadeT)
        const fadeOut = 1 - eased
        const envelope = rise * decay * fadeOut
        this.currentFlareIntensity += flare.intensity * envelope
      }
    }
    // Clean up expired flares
    this.flares = this.flares.filter((f) => elapsed - f.startTime < f.duration)

    // Schedule new cosmetic flares — burst of 2-5 rapid flashes
    if (elapsed >= this.nextFlareTime) {
      const count = 2 + Math.floor(Math.random() * 4)
      let offset = 0
      for (let i = 0; i < count; i++) {
        const intensity = 0.4 + Math.random() * 1.2
        const duration = 0.3 + Math.random() * 0.6
        this.flares.push({ intensity, startTime: elapsed + offset, duration })
        offset += 0.1 + Math.random() * 0.25
      }
      this.scheduleNextFlare(elapsed)
    }

    // Phase state machine
    switch (this.phase) {
      case 'idle':
        this.radiationActive = false
        if (elapsed >= this.nextEventTime) {
          this.phase = 'warning'
          this.phaseStartTime = elapsed
          // Subtle flare during warning
          this.flares.push({ intensity: 0.8, startTime: elapsed, duration: this.warningDuration })
        }
        break

      case 'warning': {
        const warningElapsed = elapsed - this.phaseStartTime
        this.countdown = Math.max(0, Math.ceil(this.warningDuration - warningElapsed))
        if (warningElapsed >= this.warningDuration) {
          this.phase = 'active'
          this.phaseStartTime = elapsed
          this.radiationActive = true
          // Massive sustained flare for entire active duration + fade tail
          this.flares.push({
            intensity: 5,
            startTime: elapsed,
            duration: this.activeDuration + this.cooldownDuration,
            sustained: true
          })
        }
        break
      }

      case 'active': {
        const activeElapsed = elapsed - this.phaseStartTime
        this.radiationActive = true
        // Violent rapid bursts during active phase — ramp in over first 3 seconds
        const burstRamp = Math.min(1, activeElapsed / 3)
        const burstScale = burstRamp * burstRamp
        const burstCycle1 = (activeElapsed * 2) % 1.0
        const burstCycle2 = (activeElapsed * 3.5 + 0.3) % 1.0
        const burstCycle3 = (activeElapsed * 5.5 + 0.7) % 1.0
        const burst1 = burstCycle1 < 0.08 ? (1 - burstCycle1 / 0.08) ** 2 * 4 * burstScale : 0
        const burst2 = burstCycle2 < 0.05 ? (1 - burstCycle2 / 0.05) ** 2 * 3 * burstScale : 0
        const burst3 = burstCycle3 < 0.03 ? (1 - burstCycle3 / 0.03) ** 2 * 2.5 * burstScale : 0
        this.currentFlareIntensity += burst1 + burst2 + burst3
        // Deal damage if not docked
        if (!this.isShipDocked(shipPos)) {
          this.onConditionChange?.(-this.damageRate * dt)
        }
        if (activeElapsed >= this.activeDuration) {
          this.phase = 'cooldown'
          this.phaseStartTime = elapsed
          this.radiationActive = false
        }
        break
      }

      case 'cooldown': {
        const cooldownElapsed = elapsed - this.phaseStartTime
        this.radiationActive = false
        // Diminishing bursts during cooldown — slow down toward the end
        const cooldownT = cooldownElapsed / this.cooldownDuration
        const fade = Math.max(0, 1 - cooldownT) ** 2
        const speed = 1 + (1 - cooldownT) * 2
        const cdCycle1 = (cooldownElapsed * speed) % 1.0
        const cdCycle2 = (cooldownElapsed * speed * 1.6 + 0.4) % 1.0
        const cdBurst1 = cdCycle1 < 0.06 ? (1 - cdCycle1 / 0.06) ** 2 * 3 * fade : 0
        const cdBurst2 = cdCycle2 < 0.04 ? (1 - cdCycle2 / 0.04) ** 2 * 2 * fade : 0
        this.currentFlareIntensity += cdBurst1 + cdBurst2
        if (cooldownElapsed >= this.cooldownDuration) {
          this.phase = 'idle'
          this.scheduleNextEvent(elapsed)
        }
        break
      }
    }

    // Big flare intensity during active radiation — expands from warning level
    if (this.phase === 'active') {
      const activeElapsed = elapsed - this.phaseStartTime
      const rampT = Math.min(1, activeElapsed / 3)
      const rampEased = rampT * rampT * (3 - 2 * rampT)
      const warningEnd = 0.6
      this.currentFlareIntensity = Math.max(this.currentFlareIntensity, warningEnd + rampEased * (5.0 - warningEnd))
    } else if (this.phase === 'cooldown') {
      // Smooth transition out from active peak
      const cooldownElapsed = elapsed - this.phaseStartTime
      const transitionT = Math.min(1, cooldownElapsed / (this.cooldownDuration * 1.0))
      const transitionEased = transitionT * transitionT * (3 - 2 * transitionT)
      const minIntensity = 5.0 * (1 - transitionEased)
      this.currentFlareIntensity = Math.max(this.currentFlareIntensity, minIntensity)
    } else if (this.phase === 'warning') {
      const warningT = (elapsed - this.phaseStartTime) / this.warningDuration
      this.currentFlareIntensity = Math.max(this.currentFlareIntensity, warningT * 0.6)
    }
  }
}
