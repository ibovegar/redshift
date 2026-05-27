import { Box, Divider, Stack, Typography } from '@mui/material'
import { ExpandModal } from 'components/ExpandModal/ExpandModal'
import { HudButton } from 'components/HudButton/HudButton'
import { HudList, type HudListItem } from 'components/HudList/HudList'
import { InProgressBlock } from 'components/InProgressBlock/InProgressBlock'
import { MATERIAL_ICONS, MATERIAL_NAMES } from 'data/materials'
import { useCardExpandAnimation } from 'hooks/useCardExpandAnimation'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import { SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { SectionHeader } from '../../SectionHeader'
import { heldAmount } from '../../utils'
import { CONDITION_LABEL, type InfoPanelProps, STATUS_COLOR, STATUS_LABEL } from '../types'

const ALL_MATERIALS = Object.keys(MATERIAL_NAMES) as AsteroidMaterial[]
const PREVIEW_COUNT = 4

export const StorageInfo = ({ type, status, storage, storageCapacity }: InfoPanelProps) => {
  // Modal opens from the "View all" button so the full resource list reads as the same
  // surface as the panel, just expanded.
  const expand = useCardExpandAnimation()

  const totalUnits = storage.reduce((sum, item) => sum + item.amount, 0)
  const pct = Math.min(100, Math.round((totalUnits / storageCapacity) * 100))
  const items: HudListItem[] = [
    { label: 'Status', value: STATUS_LABEL[status], valueColor: STATUS_COLOR[status] },
    { label: 'Condition', value: CONDITION_LABEL[status] },
    { label: 'Used', value: `${totalUnits} / ${storageCapacity}` },
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

      <Divider sx={{ my: 3, borderColor: 'hud.textBorder' }} />

      <SectionHeader>Resources</SectionHeader>
      <ResourceList storage={storage} materials={ALL_MATERIALS.slice(0, PREVIEW_COUNT)} />
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
        <HudButton variant="secondary" onClick={(e) => expand.open(e.currentTarget as HTMLElement)}>
          View all
        </HudButton>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        {/* No storage-task tracking yet — passing null renders the Idle state. */}
        <InProgressBlock task={null} />
      </Box>

      {expand.isOpen && (
        <ExpandModal
          isClosing={expand.isClosing}
          animationStyle={expand.animationStyle}
          modalRef={expand.modalRef}
          onAnimationEnd={expand.onAnimationEnd}
          onClose={expand.close}
          showBackdrop
        >
          <Box sx={{ p: 4 }}>
            <SectionHeader>Resources</SectionHeader>
            <ResourceList storage={storage} materials={ALL_MATERIALS} />
          </Box>
        </ExpandModal>
      )}
    </Box>
  )
}

const ResourceList = ({ storage, materials }: { storage: CargoItem[]; materials: AsteroidMaterial[] }) => (
  <Stack>
    {materials.map((material) => {
      const amount = heldAmount(storage, material)
      const empty = amount === 0
      return (
        <Box key={material} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box
            component="img"
            src={MATERIAL_ICONS[material]}
            alt={material}
            sx={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
          />
          <Typography variant="hud-data" sx={{ flex: 1, color: 'common.white' }}>
            {MATERIAL_NAMES[material]}
          </Typography>
          <Typography variant="hud-data" sx={{ color: empty ? 'hud.textBrightDim' : 'common.white' }}>
            {amount}
          </Typography>
        </Box>
      )
    })}
  </Stack>
)
