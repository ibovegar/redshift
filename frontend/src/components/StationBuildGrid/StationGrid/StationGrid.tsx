import { Box } from '@mui/material'
import type { SectionType, StationSection } from 'models/station-section'
import { SECTION_ORDER } from 'models/station-section'
import { CELL, GridCell } from '../GridCell/GridCell'
import { SectionHeader } from '../SectionHeader'
import { isBlueprintUnmet, statusOf } from '../utils'

const GAP = 10
const COLS = 5
const ROWS = 4

const MODULE_POS: Record<SectionType, { col: number; row: number }> = {
  command: { col: 0, row: 0 },
  engineering: { col: 1, row: 0 },
  research: { col: 2, row: 0 },
  power: { col: 2, row: 1 },
  storage: { col: 2, row: 2 }
}

const CELL_HOVER_SX = {
  cursor: 'pointer',
  transition: 'filter 0.15s, transform 0.15s',
  '&:hover': { filter: 'brightness(1.12)', transform: 'translateY(-1px)' }
} as const

interface Props {
  sections: StationSection[]
  onSelect: (type: SectionType) => void
}

export const StationGrid = ({ sections, onSelect }: Props) => {
  const emptySlots: Array<{ col: number; row: number }> = []
  for (let i = 0; i < ROWS * COLS; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const occupied = SECTION_ORDER.some((t) => MODULE_POS[t].col === col && MODULE_POS[t].row === row)
    if (!occupied) emptySlots.push({ col, row })
  }

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
          const online = statusOf(sections, type) === 'operational'
          const unavailable = isBlueprintUnmet(sections, type)

          return (
            <Box
              key={type}
              onClick={() => onSelect(type)}
              sx={{ gridColumn: col + 1, gridRow: row + 1, ...CELL_HOVER_SX }}
            >
              {online ? (
                <GridCell type={type} status="operational" />
              ) : unavailable ? (
                <GridCell type={type} unavailable />
              ) : (
                <GridCell type={type} status="available" />
              )}
            </Box>
          )
        })}

        {emptySlots.map(({ col, row }) => (
          <Box key={`empty-${col}-${row}`} sx={{ gridColumn: col + 1, gridRow: row + 1, ...CELL_HOVER_SX }}>
            <GridCell />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
