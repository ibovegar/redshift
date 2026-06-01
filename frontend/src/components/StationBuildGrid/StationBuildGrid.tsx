import { Box } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import { activeResearchTask, type QueueItem, queuedResearchIds } from 'models/queue'
import type { CargoItem } from 'models/spacecraft'
import { computePower } from 'models/station'
import type { SectionType, StationSection } from 'models/station-section'
import { ENGINEERING_LEVELS, SECTION_NAMES, SECTION_ORDER } from 'models/station-section'
import { useState } from 'react'
import { hudColors } from 'ui/theme/typography'
import { EngineeringBuild } from './EngineeringBuild/EngineeringBuild'
import { InfoPanel } from './InfoPanel/InfoPanel'
import { ModuleListItem } from './ModuleListItem/ModuleListItem'
import { PowerView } from './PowerView/PowerView'
import { ResearchTree } from './ResearchTree/ResearchTree'
import { SectionHeader } from './SectionHeader'
import { StationGrid } from './StationGrid/StationGrid'
import { StorageView } from './StorageView/StorageView'
import { currentEngineeringLevel, isOperational, statusOf } from './utils'

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  storageCapacity: number
  powerCapacity: number
  researchedBlueprints: string[]
  queue: QueueItem[]
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
  powerCapacity,
  researchedBlueprints,
  queue,
  onBuild,
  isPending,
  initialSection = 'command',
  justBuilt = null
}: Props) => {
  const [selected, setSelected] = useState<SectionType>(initialSection)

  const power = computePower({ sections, storageCapacity, powerCapacity })
  const researchInProgress = activeResearchTask(queue)
  const inProgressResearchIds = queuedResearchIds(queue)

  const handleBuild = () => {
    setSelected('command')
    onBuild(selected)
  }

  // Storage Extension is a buildable capacity upgrade — it lives in the StationGrid + research
  // tree but is hidden from the operational module list since the static Storage entry already
  // owns the capacity display. Engineering upgrade tiers (engineering-2/3/4) likewise stay out of
  // the module list — the base Engineering Bay entry surfaces the current level instead.
  const onlineTypes = SECTION_ORDER.filter(
    (t) => t !== 'storage-extension' && !ENGINEERING_LEVELS.includes(t) && isOperational(sections, t)
  )
  const engineeringLevel = currentEngineeringLevel(sections)
  const labelFor = (type: SectionType): string | undefined =>
    type === 'engineering' && engineeringLevel > 0 ? `${SECTION_NAMES.engineering} LVL ${engineeringLevel}` : undefined

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
            <ModuleListItem
              key={type}
              type={type}
              label={labelFor(type)}
              selected={selected === type}
              onSelect={() => setSelected(type)}
            />
          ))}
        </Box>
        <DottedBackground dotColor={hudColors.borderFaint} sx={{ flex: 1, mt: 2 }} />
      </Box>

      <InfoPanel
        type={selected}
        status={statusOf(sections, selected)}
        sections={sections}
        storage={storage}
        storageCapacity={storageCapacity}
        power={power}
        researchedBlueprints={researchedBlueprints}
        researchInProgress={researchInProgress}
        queue={queue}
        isPending={isPending}
        onBuild={handleBuild}
      />

      {/* Each right-column view (research tree, engineering bay, station grid) owns its own
          dotted backdrop, so no shared wrapper here. */}
      {selected === 'research' ? (
        <ResearchTree
          researchedBlueprints={researchedBlueprints}
          researchInProgress={researchInProgress}
          inProgressResearchIds={inProgressResearchIds}
          atMaxPower={power.atMax}
          storage={storage}
        />
      ) : selected === 'storage' ? (
        <StorageView storage={storage} storageCapacity={storageCapacity} />
      ) : selected === 'power' ? (
        <PowerView power={power} sections={sections} storageCapacity={storageCapacity} powerCapacity={powerCapacity} />
      ) : selected === 'engineering' && statusOf(sections, 'engineering') === 'operational' ? (
        <EngineeringBuild researchedBlueprints={researchedBlueprints} atMaxPower={power.atMax} />
      ) : (
        <StationGrid
          sections={sections}
          storage={storage}
          storageCapacity={storageCapacity}
          powerCapacity={powerCapacity}
          atMaxPower={power.atMax}
          researchedBlueprints={researchedBlueprints}
          queue={queue}
          isPending={isPending}
          justBuilt={justBuilt}
          onBuild={onBuild}
        />
      )}
    </Box>
  )
}
