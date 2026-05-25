import { Box } from '@mui/material'
import { ExpandModal } from 'components/ExpandModal/ExpandModal'
import { useCardExpandAnimation } from 'hooks/useCardExpandAnimation'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType, StationSection } from 'models/station-section'
import { SECTION_ORDER } from 'models/station-section'
import { useCallback, useState } from 'react'
import { SectionHeader } from '../SectionHeader'
import { canBuildSection, getCellState } from '../utils'
import { CELL, GridCell } from './GridCell/GridCell'
import { ModuleDetail } from './ModuleDetail/ModuleDetail'

const GAP = 10
const COLS = 5
const ROWS = 4

const MODULE_POS: Record<SectionType, { col: number; row: number }> = {
  command: { col: 0, row: 0 },
  research: { col: 1, row: 0 },
  engineering: { col: 2, row: 0 },
  power: { col: 2, row: 1 },
  storage: { col: 2, row: 2 }
}

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  researchedBlueprints: string[]
  isPending: boolean
  justBuilt?: SectionType | null
  onBuild: (type: SectionType) => void
}

const buildEmptySlots = () => {
  const slots: Array<{ col: number; row: number }> = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const occupied = SECTION_ORDER.some((t) => MODULE_POS[t].col === col && MODULE_POS[t].row === row)
      if (!occupied) slots.push({ col, row })
    }
  }
  return slots
}

const EMPTY_SLOTS = buildEmptySlots()

export const StationGrid = ({ sections, storage, researchedBlueprints, isPending, justBuilt, onBuild }: Props) => {
  const [selectedType, setSelectedType] = useState<SectionType | null>(null)
  const expand = useCardExpandAnimation(() => setSelectedType(null))

  const handleAvailableClick = useCallback(
    (type: SectionType, element: HTMLElement) => {
      setSelectedType(type)
      expand.open(element)
    },
    [expand.open]
  )

  const handleConfirmBuild = useCallback(() => {
    if (!selectedType) return
    onBuild(selectedType)
    expand.close()
  }, [selectedType, onBuild, expand.close])

  return (
    <Box sx={{ flexShrink: 0 }}>
      <SectionHeader>Station Layout</SectionHeader>

      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          gap: `${GAP}px`
        }}
      >
        {SECTION_ORDER.map((type) => {
          const { col, row } = MODULE_POS[type]
          const state = getCellState(sections, researchedBlueprints, type)
          const buildable = canBuildSection(sections, storage, researchedBlueprints, type)

          return (
            <Box key={type} sx={{ gridColumn: col + 1, gridRow: row + 1 }}>
              <GridCell
                type={type}
                state={state}
                canBuild={buildable}
                justBuilt={justBuilt === type}
                onBuild={(element) => handleAvailableClick(type, element)}
              />
            </Box>
          )
        })}

        {EMPTY_SLOTS.map(({ col, row }) => (
          <Box key={`empty-${col}-${row}`} sx={{ gridColumn: col + 1, gridRow: row + 1 }}>
            <GridCell />
          </Box>
        ))}
      </Box>

      {expand.isOpen && selectedType && (
        <ExpandModal
          isClosing={expand.isClosing}
          animationStyle={expand.animationStyle}
          modalRef={expand.modalRef}
          onAnimationEnd={expand.onAnimationEnd}
          onClose={expand.close}
          showBackdrop
        >
          <ModuleDetail
            type={selectedType}
            storage={storage}
            isPending={isPending}
            onBuild={handleConfirmBuild}
            onClose={expand.close}
          />
        </ExpandModal>
      )}
    </Box>
  )
}
