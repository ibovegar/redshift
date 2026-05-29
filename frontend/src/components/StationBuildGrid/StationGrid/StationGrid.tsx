import { Box } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import { ExpandModal } from 'components/ExpandModal/ExpandModal'
import { useCardExpandAnimation } from 'hooks/useCardExpandAnimation'
import type { BuildTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType, StationSection } from 'models/station-section'
import {
  BASE_POWER,
  BASE_STORAGE_CAPACITY,
  MAX_POWER_CORES,
  MAX_STORAGE_EXTENSIONS,
  POWER_PER_CORE,
  SECTION_ORDER,
  STORAGE_EXTENSION_CAPACITY
} from 'models/station-section'
import { useCallback, useState } from 'react'
import { SectionHeader } from '../SectionHeader'
import { type CellState, canBuildSection, getCellState, isOperational } from '../utils'
import { CELL, GridCell } from './GridCell/GridCell'
import { ModuleDetail } from './ModuleDetail/ModuleDetail'

const GAP = 10
const COLS = 5
const MIN_ROWS = 4

// Row 0 holds the always-present modules. The two repeatable types each grow a vertical stack:
// Storage Extensions downward from (1, 1), Power Cores downward from (4, 0).
const MODULE_POS: Record<SectionType, { col: number; row: number }> = {
  command: { col: 0, row: 0 },
  research: { col: 2, row: 0 },
  engineering: { col: 3, row: 0 },
  power: { col: 4, row: 0 },
  storage: { col: 1, row: 0 },
  'storage-extension': { col: 1, row: 1 }
}

const MAIN_TYPES = SECTION_ORDER.filter((t) => t !== 'storage-extension' && t !== 'power')

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  storageCapacity: number
  powerCapacity: number
  atMaxPower: boolean
  researchedBlueprints: string[]
  buildInProgress: BuildTask[]
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

const builtCount = (capacity: number, base: number, per: number, cap: number): number =>
  Math.min(cap, Math.max(0, Math.round((capacity - base) / per)))

export const StationGrid = ({
  sections,
  storage,
  storageCapacity,
  powerCapacity,
  atMaxPower,
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

  // Builds run concurrently, one per section type — a cell is only affected by a build of its OWN
  // type (it shows that task's progress and hides its Build button), never by another type's build.
  const buildTaskFor = (type: SectionType): BuildTask | null =>
    buildInProgress.find((t) => t.sectionType === type) ?? null

  const cells: RenderCell[] = []

  for (const type of MAIN_TYPES) {
    const { col, row } = MODULE_POS[type]
    const buildTask = buildTaskFor(type)
    cells.push({
      key: type,
      col,
      row,
      type,
      state: getCellState(sections, researchedBlueprints, type),
      canBuild: !buildTask && canBuildSection(sections, storage, researchedBlueprints, type, atMaxPower),
      buildTask,
      justBuilt: justBuilt === type
    })
  }

  // Repeatable stacks (Storage Extension, Power Core). Each renders one online cell per built unit,
  // then a "next" build slot (available once researched / unavailable / building). Slots beyond the
  // next stay empty until the first unit is online, then reveal as unavailable. Capped.
  // `built` comes from the running capacity, but is floored to 1 once the section is operational so
  // the column stays consistent (one online cell + revealed unavailable slots) even if the capacity
  // read momentarily lags behind the section flipping operational.
  const stacks = [
    {
      type: 'storage-extension' as SectionType,
      ...MODULE_POS['storage-extension'],
      built: Math.max(
        isOperational(sections, 'storage-extension') ? 1 : 0,
        builtCount(storageCapacity, BASE_STORAGE_CAPACITY, STORAGE_EXTENSION_CAPACITY, MAX_STORAGE_EXTENSIONS)
      ),
      cap: MAX_STORAGE_EXTENSIONS
    },
    {
      type: 'power' as SectionType,
      ...MODULE_POS.power,
      built: Math.max(
        isOperational(sections, 'power') ? 1 : 0,
        builtCount(powerCapacity, BASE_POWER, POWER_PER_CORE, MAX_POWER_CORES)
      ),
      cap: MAX_POWER_CORES
    }
  ]

  for (const stack of stacks) {
    const rawSlotState = getCellState(sections, researchedBlueprints, stack.type)
    // The section flips operational after the first build, but the next slot must read as a build
    // (available/unavailable), not online — so map 'online' back to 'available'.
    const nextSlotState: CellState = rawSlotState === 'online' ? 'available' : rawSlotState
    const buildTask = buildTaskFor(stack.type)
    // Reveal the locked slots only once a unit is actually online — not while the first is still
    // building, so pressing Build doesn't immediately surface the rest of the column.
    const revealLockedSlots = stack.built >= 1
    for (let i = 0; i < stack.cap; i++) {
      const isBuilt = i < stack.built
      const isNext = i === stack.built
      // Beyond-next slots: hidden (empty filler) until the first unit is online.
      if (!isBuilt && !isNext && !revealLockedSlots) continue
      let state: CellState = 'unavailable'
      if (isBuilt) state = 'online'
      else if (isNext) state = nextSlotState
      cells.push({
        key: `${stack.type}-${i}`,
        col: stack.col,
        row: stack.row + i,
        type: stack.type,
        state,
        canBuild:
          isNext && !buildTask && canBuildSection(sections, storage, researchedBlueprints, stack.type, atMaxPower),
        buildTask: isNext ? buildTask : null,
        // Only the most recently built unit plays the reveal animation.
        justBuilt: isBuilt && i === stack.built - 1 && justBuilt === stack.type
      })
    }
  }

  const rows = Math.max(MIN_ROWS, ...stacks.map((s) => s.row + s.cap))

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
