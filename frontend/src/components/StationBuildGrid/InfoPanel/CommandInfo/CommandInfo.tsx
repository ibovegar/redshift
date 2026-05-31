import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { QueueList } from 'components/QueueList/QueueList'
import { useCancelQueueItem } from 'hooks/useStation'
import { BLUEPRINTS } from 'models/blueprint'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const CommandInfo = ({
  type,
  status,
  storage,
  storageCapacity,
  power,
  researchedBlueprints,
  queue
}: InfoPanelProps) => {
  const usedStorage = storage.reduce((sum, item) => sum + item.amount, 0)
  const storagePct = storageCapacity > 0 ? Math.round((usedStorage / storageCapacity) * 100) : 0
  const cancelQueueItem = useCancelQueueItem()
  const buildQueue = queue.filter((item) => item.kind === 'build')
  // Most counts here are synthetic for now (crew, fleet). The research total reflects the real
  // store so it ticks up as the user researches blueprints from the tree.
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Online Modules', value: '1 / 5' },
    {
      label: 'Storage',
      value: `${usedStorage} / ${storageCapacity}`,
      valueColor: storagePct > 90 ? 'hud.error' : 'common.white'
    },
    {
      label: 'Power',
      value: `${power.consumption} / ${power.capacity}`,
      valueColor: power.atMax ? 'hud.error' : 'common.white'
    },
    { label: 'Total Research', value: `${researchedBlueprints.length} / ${BLUEPRINTS.length}` },
    { label: 'Crew', value: '12' },
    { label: 'Fleet', value: '3 docked' }
  ]
  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3, minHeight: '4.8em' }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle' }} />
      <HudList items={items} />

      {/* The hub surfaces just the BUILD lane of the unified queue — research has its own panel in
          the Research Development view. Each row shows live progress and a cancel control. */}
      <Box sx={{ mt: 'auto' }}>
        <QueueList
          queue={buildQueue}
          onCancel={(id) => cancelQueueItem.mutate(id)}
          isCancelling={cancelQueueItem.isPending}
          title="Build Queue"
        />
      </Box>
    </Box>
  )
}
