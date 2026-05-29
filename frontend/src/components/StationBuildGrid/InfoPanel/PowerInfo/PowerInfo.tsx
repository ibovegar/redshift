import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { InProgressBlock } from 'components/InProgressBlock/InProgressBlock'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const PowerInfo = ({ type, status, power }: InfoPanelProps) => {
  const loadPct = power.capacity > 0 ? Math.round((power.consumption / power.capacity) * 100) : 0
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Capacity', value: `${power.capacity}`, valueColor: 'hud.success' },
    { label: 'Consumption', value: `${power.consumption}` },
    {
      label: 'Free',
      value: `${power.free}`,
      valueColor: power.atMax ? 'hud.error' : 'hud.success'
    },
    { label: 'Load', value: `${loadPct} %`, valueColor: loadPct > 90 ? 'hud.error' : 'common.white' }
  ]
  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3, minHeight: '4.8em' }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle' }} />
      <HudList items={items} />
      {/* No power-task tracking yet — passing null renders the Idle state. Wire to a reactor
          startup / refuel task field once the backend supports it. */}
      <Box sx={{ mt: 'auto' }}>
        <InProgressBlock task={null} />
      </Box>
    </Box>
  )
}
