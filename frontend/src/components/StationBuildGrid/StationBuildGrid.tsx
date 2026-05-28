import { Box } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import type { BuildTask, ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType, StationSection } from 'models/station-section'
import { SECTION_ORDER } from 'models/station-section'
import { useState } from 'react'
import { hudColors } from 'ui/theme/typography'
import { EngineeringBuild } from './EngineeringBuild/EngineeringBuild'
import { InfoPanel } from './InfoPanel/InfoPanel'
import { ModuleListItem } from './ModuleListItem/ModuleListItem'
import { ResearchTree } from './ResearchTree/ResearchTree'
import { SectionHeader } from './SectionHeader'
import { StationGrid } from './StationGrid/StationGrid'
import { StorageView } from './StorageView/StorageView'
import { isOperational, statusOf } from './utils'

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  storageCapacity: number
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  buildInProgress: BuildTask | null
  onBuild: (type: SectionType) => void
  isPending: boolean
  initialSection?: SectionType
  /** Section that just finished building — drives a one-shot fade-in on its grid cell. */
  justBuilt?: SectionType | null
}

export const StationBuildGrid = ({
  sections,
  storage,
  storageCapacity,
  researchedBlueprints,
  researchInProgress,
  buildInProgress,
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

  // Storage Extension is a buildable capacity upgrade — it lives in the StationGrid + research
  // tree but is hidden from the operational module list since the static Storage entry already
  // owns the capacity display.
  const onlineTypes = SECTION_ORDER.filter((t) => t !== 'storage-extension' && isOperational(sections, t))

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
        storageCapacity={storageCapacity}
        researchedBlueprints={researchedBlueprints}
        researchInProgress={researchInProgress}
        buildInProgress={buildInProgress}
        isPending={isPending}
        onBuild={handleBuild}
      />

      {/* Each right-column view (research tree, engineering bay, station grid) owns its own
          dotted backdrop, so no shared wrapper here. */}
      {selected === 'research' ? (
        <ResearchTree researchedBlueprints={researchedBlueprints} researchInProgress={researchInProgress} />
      ) : selected === 'storage' ? (
        <StorageView storage={storage} storageCapacity={storageCapacity} />
      ) : selected === 'engineering' && statusOf(sections, 'engineering') === 'operational' ? (
        <EngineeringBuild researchedBlueprints={researchedBlueprints} />
      ) : (
        <StationGrid
          sections={sections}
          storage={storage}
          storageCapacity={storageCapacity}
          researchedBlueprints={researchedBlueprints}
          buildInProgress={buildInProgress}
          isPending={isPending}
          justBuilt={justBuilt}
          onBuild={onBuild}
        />
      )}
    </Box>
  )
}
