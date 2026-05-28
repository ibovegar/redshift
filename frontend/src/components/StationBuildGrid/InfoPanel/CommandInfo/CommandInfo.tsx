import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { InProgressBlock } from 'components/InProgressBlock/InProgressBlock'
import { BLUEPRINTS } from 'models/blueprint'
import { SECTION_DESCRIPTIONS, SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const CommandInfo = ({ type, status, researchedBlueprints, buildInProgress }: InfoPanelProps) => {
  const buildingType = buildInProgress?.sectionType
  // Most counts here are synthetic for now (crew, fleet). The research total reflects the real
  // store so it ticks up as the user researches blueprints from the tree.
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Online Modules', value: '1 / 5' },
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

      {/* Command is the station hub view, so it surfaces the active section build (if any) — the
          grid cell shows the same task's progress inline. */}
      <Box sx={{ mt: 'auto' }}>
        <InProgressBlock
          task={buildInProgress}
          name={buildingType ? SECTION_NAMES[buildingType] : undefined}
          image={buildingType ? SECTION_IMAGES[buildingType] : null}
        />
      </Box>
    </Box>
  )
}
