import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { useCancelQueueItem } from 'hooks/useStation'
import { BLUEPRINTS } from 'models/blueprint'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { QueueList } from '~/components/QueueList/QueueList'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const ResearchInfo = ({ type, status, researchedBlueprints, queue }: InfoPanelProps) => {
  const totalBlueprints = BLUEPRINTS.length
  const researchedCount = researchedBlueprints.length
  const cancelQueueItem = useCancelQueueItem()
  const researchQueue = queue.filter((item) => item.kind === 'research')

  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Total Researched', value: `${researchedCount} / ${totalBlueprints}` }
  ]

  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3, minHeight: '4.8em' }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle' }} />
      <HudList items={items} />

      {/* Research lane of the unified queue — mirrors the Build Queue in CommandInfo. */}
      <Box sx={{ mt: 'auto' }}>
        <QueueList
          queue={researchQueue}
          onCancel={(id) => cancelQueueItem.mutate(id)}
          isCancelling={cancelQueueItem.isPending}
          title="Research Queue"
        />
      </Box>
    </Box>
  )
}
