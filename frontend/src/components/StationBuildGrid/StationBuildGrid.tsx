import { Box } from '@mui/material'
import type { ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType, StationSection } from 'models/station-section'
import { SECTION_ORDER } from 'models/station-section'
import { useState } from 'react'
import { InfoPanel } from './InfoPanel/InfoPanel'
import { ModuleListItem } from './ModuleListItem/ModuleListItem'
import { ResearchTree } from './ResearchTree/ResearchTree'
import { SectionHeader } from './SectionHeader'
import { StationGrid } from './StationGrid/StationGrid'
import { isOperational, statusOf } from './utils'

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  onBuild: (type: SectionType) => void
  isPending: boolean
  initialSection?: SectionType
}

export const StationBuildGrid = ({
  sections,
  storage,
  researchedBlueprints,
  researchInProgress,
  onBuild,
  isPending,
  initialSection = 'command'
}: Props) => {
  const [selected, setSelected] = useState<SectionType>(initialSection)

  const handleBuild = () => {
    setSelected('command')
    onBuild(selected)
  }

  const onlineTypes = SECTION_ORDER.filter((t) => isOperational(sections, t))

  return (
    <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <Box sx={{ flex: '0 0 340px', maxWidth: 340 }}>
        <SectionHeader>Modules</SectionHeader>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {onlineTypes.map((type) => (
            <ModuleListItem key={type} type={type} selected={selected === type} onSelect={() => setSelected(type)} />
          ))}
        </Box>
      </Box>

      <InfoPanel
        type={selected}
        status={statusOf(sections, selected)}
        storage={storage}
        isPending={isPending}
        onBuild={handleBuild}
      />

      <Box sx={{ flex: '0 0 964px', width: 964 }}>
        {selected === 'research' ? (
          <ResearchTree
            storage={storage}
            researchedBlueprints={researchedBlueprints}
            researchInProgress={researchInProgress}
          />
        ) : (
          <StationGrid
            sections={sections}
            storage={storage}
            researchedBlueprints={researchedBlueprints}
            onBuild={onBuild}
          />
        )}
      </Box>
    </Box>
  )
}
