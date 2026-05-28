import { Box } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import { ExpandModal } from 'components/ExpandModal/ExpandModal'
import { useCardExpandAnimation } from 'hooks/useCardExpandAnimation'
import type { BuildTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType, StationSection } from 'models/station-section'
import {
  BASE_STORAGE_CAPACITY,
  MAX_STORAGE_EXTENSIONS,
  SECTION_ORDER,
  STORAGE_EXTENSION_CAPACITY
} from 'models/station-section'
import { useCallback, useState } from 'react'
import { SectionHeader } from '../SectionHeader'
import { type CellState, canBuildSection, getCellState } from '../utils'
import { CELL, GridCell } from './GridCell/GridCell'
import { ModuleDetail } from './ModuleDetail/ModuleDetail'

const GAP = 10
const COLS = 5
const MIN_ROWS = 4

// Row 0 holds the always-present modules; the Storage Extension stack grows downward from (1, 1).
const MODULE_POS: Record<SectionType, { col: number; row: number }> = {
  command: { col: 0, row: 0 },
  research: { col: 2, row: 0 },
  engineering: { col: 3, row: 0 },
  power: { col: 4, row: 0 },
  storage: { col: 1, row: 0 },
  'storage-extension': { col: 1, row: 1 }
}

const MAIN_TYPES = SECTION_ORDER.filter((t) => t !== 'storage-extension')

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  storageCapacity: number
  researchedBlueprints: string[]
  buildInProgress: BuildTask | null
  isPending: boolean
  justBuilt?: SectionType | null
  onBuild: (type: SectionType) => void
}

interface RenderCell {
  key: string
  col: number
  row: number
  type: SectionType
  state: CellState
  canBuild: boolean
  buildTask: BuildTask | null
  justBuilt: boolean
}

export const StationGrid = ({
  sections,
  storage,
  storageCapacity,
  researchedBlueprints,
  buildInProgress,
  isPending,
  justBuilt,
  onBuild
}: Props) => {
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

  // Each built extension adds STORAGE_EXTENSION_CAPACITY, so the count of built pods is derived
  // from the running capacity, clamped to the hard cap.
  const builtExtensions = Math.min(
    MAX_STORAGE_EXTENSIONS,
    Math.max(0, Math.round((storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY))
  )

  const cells: RenderCell[] = []

  for (const type of MAIN_TYPES) {
    const { col, row } = MODULE_POS[type]
    cells.push({
      key: type,
      col,
      row,
      type,
      state: getCellState(sections, researchedBlueprints, type),
      // Queue capacity is 1: while any build runs, other cells can't start one.
      canBuild: !buildInProgress && canBuildSection(sections, storage, researchedBlueprints, type),
      buildTask: buildInProgress?.sectionType === type ? buildInProgress : null,
      justBuilt: justBuilt === type
    })
  }

  // Storage Extension column: stacked below the Storage Hub, capped at MAX_STORAGE_EXTENSIONS.
  //   - built pods (i < builtExtensions) are online
  //   - the next slot (i === builtExtensions) is available once researched, else unavailable
  //   - slots beyond the next stay empty until the first pod is being built / is online — only
  //     then do the remaining capacity slots reveal as unavailable
  const extCol = MODULE_POS['storage-extension'].col
  const extStartRow = MODULE_POS['storage-extension'].row
  // The section flips to operational after the first build, but the next slot must read as a build
  // (available/unavailable), not as an online module — so map 'online' back to 'available'.
  const rawSlotState = getCellState(sections, researchedBlueprints, 'storage-extension')
  const nextSlotState: CellState = rawSlotState === 'online' ? 'available' : rawSlotState
  const extBuilding = buildInProgress?.sectionType === 'storage-extension'
  const revealLockedSlots = builtExtensions >= 1 || extBuilding
  for (let i = 0; i < MAX_STORAGE_EXTENSIONS; i++) {
    const isBuilt = i < builtExtensions
    const isNext = i === builtExtensions
    // Beyond-next slots: hidden (empty filler) until the first pod is built/building.
    if (!isBuilt && !isNext && !revealLockedSlots) continue
    let state: CellState = 'unavailable'
    if (isBuilt) state = 'online'
    else if (isNext) state = nextSlotState
    cells.push({
      key: `storage-extension-${i}`,
      col: extCol,
      row: extStartRow + i,
      type: 'storage-extension',
      state,
      canBuild:
        isNext && !buildInProgress && canBuildSection(sections, storage, researchedBlueprints, 'storage-extension'),
      buildTask: isNext && extBuilding ? buildInProgress : null,
      // Only the most recently built pod plays the reveal animation.
      justBuilt: isBuilt && i === builtExtensions - 1 && justBuilt === 'storage-extension'
    })
  }

  const rows = Math.max(MIN_ROWS, extStartRow + MAX_STORAGE_EXTENSIONS)

  const occupied = new Set(cells.map((cell) => `${cell.col},${cell.row}`))
  const emptySlots: Array<{ col: number; row: number }> = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!occupied.has(`${col},${row}`)) emptySlots.push({ col, row })
    }
  }

  return (
    <Box sx={{ flexShrink: 0 }}>
      <SectionHeader>Station Layout</SectionHeader>
      <DottedBackground>
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
            gap: `${GAP}px`
          }}
        >
          {cells.map((cell) => (
            <Box key={cell.key} sx={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}>
              <GridCell
                type={cell.type}
                state={cell.state}
                canBuild={cell.canBuild}
                buildTask={cell.buildTask}
                justBuilt={cell.justBuilt}
                onBuild={(element) => handleAvailableClick(cell.type, element)}
              />
            </Box>
          ))}

          {emptySlots.map(({ col, row }) => (
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
      </DottedBackground>
    </Box>
  )
}
