import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { InProgressBlock } from 'components/InProgressBlock/InProgressBlock'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

const STORAGE_CAPACITY = 1000

export const StorageInfo = ({ type, status, storage }: InfoPanelProps) => {
  const totalUnits = storage.reduce((sum, item) => sum + item.amount, 0)
  const pct = Math.min(100, Math.round((totalUnits / STORAGE_CAPACITY) * 100))
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Used', value: `${totalUnits} / ${STORAGE_CAPACITY}` },
    { label: 'Load', value: `${pct} %`, valueColor: pct > 90 ? 'hud.error' : 'common.white' },
    { label: 'Material Types', value: `${storage.filter((s) => s.amount > 0).length}` },
    { label: 'Reserved', value: '0', valueColor: 'hud.textBrightDim' }
  ]
  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3, minHeight: '4.8em' }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle' }} />
      <HudList items={items} />
      {/* No storage-task tracking yet — passing null renders the Idle state. Wire to a cargo
          transfer / sort task once the backend supports it. */}
      <Box sx={{ mt: 'auto' }}>
        <InProgressBlock task={null} />
      </Box>
    </Box>
  )
}
