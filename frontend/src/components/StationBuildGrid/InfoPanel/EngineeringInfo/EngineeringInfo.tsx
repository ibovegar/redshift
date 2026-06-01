import { Box, Divider, Typography } from '@mui/material'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { BLUEPRINTS } from 'models/blueprint'
import { MAX_ENGINEERING_LEVEL, SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { currentEngineeringLevel } from '../../utils'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

export const EngineeringInfo = ({ type, status, sections, researchedBlueprints }: InfoPanelProps) => {
  const shipBpUnlocked = BLUEPRINTS.filter(
    (bp) => bp.category === 'ship' && researchedBlueprints.includes(bp.id)
  ).length
  const shipBpTotal = BLUEPRINTS.filter((bp) => bp.category === 'ship').length
  const addonBpUnlocked = BLUEPRINTS.filter(
    (bp) => bp.category === 'ship-addon' && researchedBlueprints.includes(bp.id)
  ).length
  const addonBpTotal = BLUEPRINTS.filter((bp) => bp.category === 'ship-addon').length
  const level = currentEngineeringLevel(sections)
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    {
      label: 'Level',
      value: `${level} / ${MAX_ENGINEERING_LEVEL}`,
      valueColor: level === MAX_ENGINEERING_LEVEL ? 'hud.success' : 'common.white'
    },
    { label: 'Ship Blueprints', value: `${shipBpUnlocked} / ${shipBpTotal}` },
    { label: 'Upgrade Blueprints', value: `${addonBpUnlocked} / ${addonBpTotal}` },
    { label: 'Build Queue', value: 'Idle', valueColor: 'hud.textBrightDim' },
    { label: 'Ships Constructed', value: '0' }
  ]
  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3, minHeight: '4.8em' }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle' }} />
      <HudList items={items} />
    </Box>
  )
}
