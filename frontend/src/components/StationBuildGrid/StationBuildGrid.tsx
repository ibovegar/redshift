import { Box } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import type { ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType, StationSection } from 'models/station-section'
import { SECTION_ORDER } from 'models/station-section'
import { useState } from 'react'
import { EngineeringBuild } from './EngineeringBuild/EngineeringBuild'
import { InfoPanel } from './InfoPanel/InfoPanel'
import { ModuleListItem } from './ModuleListItem/ModuleListItem'
import { ResearchTree } from './ResearchTree/ResearchTree'
import { SectionHeader } from './SectionHeader'
import { StationGrid } from './StationGrid/StationGrid'
import { hudColors } from 'ui/theme/typography'
import { isOperational, statusOf } from './utils'

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  onBuild: (type: SectionType) => void
  isPending: boolean
  initialSection?: SectionType
  /** Section that just finished building — drives a one-shot fade-in on its grid cell. */
  justBuilt?: SectionType | null
}

export const StationBuildGrid = ({
  sections,
  storage,
  researchedBlueprints,
  researchInProgress,
  onBuild,
  isPending,
  initialSection = 'command',
  justBuilt = null
}: Props) => {
  const [selected, setSelected] = useState<SectionType>(initialSection)

  const handleBuild = () => {
    setSelected('command')
    onBuild(selected)
  }

  const onlineTypes = SECTION_ORDER.filter((t) => isOperational(sections, t))

  return (
    <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start', height: '100%' }}>
      <Box
        sx={{
          flex: '0 0 340px',
          maxWidth: 340,
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <SectionHeader>Modules</SectionHeader>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {onlineTypes.map((type) => (
            <ModuleListItem key={type} type={type} selected={selected === type} onSelect={() => setSelected(type)} />
          ))}
        </Box>
        <DottedBackground dotColor={hudColors.borderFaint} sx={{ flex: 1, mt: 2 }} />
      </Box>

      <InfoPanel
        type={selected}
        status={statusOf(sections, selected)}
        storage={storage}
        researchedBlueprints={researchedBlueprints}
        researchInProgress={researchInProgress}
        isPending={isPending}
        onBuild={handleBuild}
      />

      {/* Right column shares the same dotted backdrop as the module list (left), so the build
          surface, engineering bay, and research tree all sit on a consistent stippled background. */}
      <DottedBackground
        dotColor={hudColors.borderFaint}
        sx={{ flex: '0 0 964px', width: 964, alignSelf: 'stretch' }}
      >
        {selected === 'research' ? (
          <ResearchTree
            researchedBlueprints={researchedBlueprints}
            researchInProgress={researchInProgress}
          />
        ) : selected === 'engineering' && statusOf(sections, 'engineering') === 'operational' ? (
          <EngineeringBuild researchedBlueprints={researchedBlueprints} />
        ) : (
          <StationGrid
            sections={sections}
            storage={storage}
            researchedBlueprints={researchedBlueprints}
            isPending={isPending}
            justBuilt={justBuilt}
            onBuild={onBuild}
          />
        )}
      </DottedBackground>
    </Box>
  )
}
