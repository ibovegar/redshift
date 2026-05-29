import { Box, Typography } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import { FillBar } from 'components/FillBar/FillBar'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { NotchPanel } from 'components/NotchPanel/NotchPanel'
import type { PowerStatus } from 'models/station'
import type { StationSection } from 'models/station-section'
import { SectionHeader } from '../SectionHeader'
import { powerConsumers, powerProducers } from './breakdown'

interface Props {
  power: PowerStatus
  sections: StationSection[]
  storageCapacity: number
  powerCapacity: number
}

export const PowerView = ({ power, sections, storageCapacity, powerCapacity }: Props) => {
  const pct = power.capacity > 0 ? Math.round((power.consumption / power.capacity) * 100) : 0
  const producers: HudListItem[] = powerProducers(powerCapacity).map((line) => ({
    label: line.label,
    value: `+${line.value}`,
    valueColor: 'hud.success'
  }))
  const consumers: HudListItem[] = powerConsumers(sections, storageCapacity).map((line) => ({
    label: line.label,
    value: `-${line.value}`
  }))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <SectionHeader>Power</SectionHeader>
      <DottedBackground sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-start' }}>
          <NotchPanel
            sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: 'hud.surfaceDeep', p: 4 }}
          >
            <Typography variant="hud-heading" sx={{ color: 'common.white' }}>
              Power Grid
            </Typography>
            <Typography variant="hud-data" sx={{ color: power.atMax ? 'hud.error' : 'hud.textBrightSoft', mt: 0.75 }}>
              {power.consumption} / {power.capacity} ({pct}%)
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, mt: 2.5, minHeight: 180 }}>
              <FillBar pct={pct} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
                  Production
                </Typography>
                <HudList items={producers} />
              </Box>
            </Box>
          </NotchPanel>

          <NotchPanel
            sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: 'hud.surfaceDeep', p: 4 }}
          >
            <Typography variant="hud-heading" sx={{ color: 'common.white' }}>
              Consumption
            </Typography>
            <Typography
              variant="hud-data"
              sx={{ color: power.free <= 0 ? 'hud.error' : 'hud.textBrightSoft', mt: 0.75 }}
            >
              {power.free} free
            </Typography>
            <Box sx={{ mt: 2.5 }}>
              {consumers.length === 0 ? (
                <Typography variant="hud-data" sx={{ color: 'hud.textBrightDim' }}>
                  No draw
                </Typography>
              ) : (
                <HudList items={consumers} />
              )}
            </Box>
          </NotchPanel>
        </Box>
      </DottedBackground>
    </Box>
  )
}
