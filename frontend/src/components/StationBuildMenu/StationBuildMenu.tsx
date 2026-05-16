import { Box, Typography } from '@mui/material'
import type { CargoItem } from 'models/spacecraft'
import { SECTION_BLUEPRINT, SECTION_ORDER } from 'models/station-section'
import type { SectionType, StationSection } from 'models/station-section'
import { SectionCard } from './SectionCard/SectionCard'

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  onBuild: (type: SectionType) => void
  isPending: boolean
}

export const StationBuildMenu = ({ sections, storage, onBuild, isPending }: Props) => {
  const sectionMap = new Map(sections.map((s) => [s.type, s]))

  return (
    <Box sx={{ minWidth: 720 }}>
      <Typography variant="hud-tag" sx={{ mb: 2.5, display: 'block' }}>
        Station Modules
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {SECTION_ORDER.map((type) => {
          const status = sectionMap.get(type)?.status ?? 'locked'
          const blueprintReq = SECTION_BLUEPRINT[type]
          const blueprintMet = !blueprintReq || sectionMap.get(blueprintReq)?.status === 'operational'

          return (
            <SectionCard
              key={type}
              type={type}
              status={status}
              blueprintMet={blueprintMet}
              storage={storage}
              isPending={isPending}
              onBuild={onBuild}
            />
          )
        })}
      </Box>
    </Box>
  )
}
