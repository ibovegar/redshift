import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { InProgressBlock } from 'components/InProgressBlock/InProgressBlock'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const PowerInfo = ({ type, status }: InfoPanelProps) => {
  // Output/consumption/surplus are placeholder numbers — when the power system actually tracks
  // them, source the values from a hook here.
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Output', value: '250 MW', valueColor: 'hud.success' },
    { label: 'Consumption', value: '180 MW' },
    { label: 'Surplus', value: '+70 MW', valueColor: 'hud.success' },
    { label: 'Load', value: '72 %' }
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
