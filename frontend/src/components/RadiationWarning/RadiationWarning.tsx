import type { SolarEventPhase } from 'containers/Tactical/TacticalBackground/scene/solar-event'
import { RadiationActive } from './RadiationActive/RadiationActive'
import { SolarWarning } from './SolarWarning/SolarWarning'

interface RadiationWarningProps {
  phase: SolarEventPhase
  countdown: number
}

export const RadiationWarning = ({ phase, countdown }: RadiationWarningProps) => {
  if (phase === 'warning') return <SolarWarning countdown={countdown} />
  if (phase === 'active' || phase === 'cooldown') return <RadiationActive />
  return null
}
