import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { InProgressBlock } from 'components/InProgressBlock/InProgressBlock'
import { BLUEPRINTS, getBlueprint } from 'models/blueprint'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { getBlueprintImage } from '../../ResearchTree/ResearchCard/ResearchCard'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const ResearchInfo = ({ type, status, researchedBlueprints, researchInProgress }: InfoPanelProps) => {
  const totalBlueprints = BLUEPRINTS.length
  const researchedCount = researchedBlueprints.length
  const inProgressBp = researchInProgress ? getBlueprint(researchInProgress.blueprintId) : null

  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Total Researched', value: `${researchedCount} / ${totalBlueprints}` },
    { label: 'Queue Capacity', value: '1 slot', valueColor: 'hud.textBrightSoft' }
  ]

  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3, minHeight: '4.8em' }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle' }} />
      <HudList items={items} />
      <Box sx={{ mt: 'auto' }}>
        <InProgressBlock
          task={researchInProgress}
          name={inProgressBp?.name}
          image={inProgressBp ? getBlueprintImage(inProgressBp) : null}
        />
      </Box>
    </Box>
  )
}
