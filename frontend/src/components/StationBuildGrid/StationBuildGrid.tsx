import { Box, Typography } from '@mui/material'
import type { CargoItem } from 'models/spacecraft'
import {
  SECTION_BLUEPRINT,
  SECTION_COSTS,
  SECTION_ORDER,
} from 'models/station-section'
import type { SectionStatus, SectionType, StationSection } from 'models/station-section'
import { useState } from 'react'
import { CELL, GridCell, HIGHLIGHT } from './GridCell/GridCell'
import { ModuleListItem } from './ModuleListItem/ModuleListItem'

// ─── Layout constants ──────────────────────────────────────────────────────────

const GAP = 10
const COLS = 5
const ROWS = 3

const MODULE_POS: Record<SectionType, { col: number; row: number }> = {
  command:     { col: 0, row: 0 },
  engineering: { col: 1, row: 0 },
  research:    { col: 2, row: 0 },
  power:       { col: 2, row: 1 },
  storage:     { col: 2, row: 2 },
}

const CONNECTIONS: [SectionType, SectionType][] = [
  ['command', 'engineering'],
  ['engineering', 'research'],
  ['research', 'power'],
  ['research', 'storage'],
]

const cellCenter = (col: number, row: number) => ({
  x: col * (CELL + GAP) + CELL / 2,
  y: row * (CELL + GAP) + CELL / 2,
})

// ─── Helpers ───────────────────────────────────────────────────────────────────

const heldAmount = (storage: CargoItem[], mat: string) =>
  storage.find((s) => s.material === mat)?.amount ?? 0

const canAfford = (costs: Partial<Record<string, number>>, storage: CargoItem[]) =>
  Object.entries(costs).every(([m, n]) => heldAmount(storage, m) >= (n ?? 0))

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  onBuild: (type: SectionType) => void
  isPending: boolean
}

export const StationBuildGrid = ({ sections, storage, onBuild, isPending }: Props) => {
  const sectionMap = new Map(sections.map((s) => [s.type, s]))
  const [selected, setSelected] = useState<SectionType | null>(null)

  const statusOf = (type: SectionType): SectionStatus => sectionMap.get(type)?.status ?? 'locked'

  const isUnavailable = (type: SectionType) => {
    const bp = SECTION_BLUEPRINT[type]
    return !!bp && statusOf(bp) !== 'operational'
  }

  const handleSelect = (type: SectionType) =>
    setSelected((prev) => (prev === type ? null : type))

  const handleBuild = (type: SectionType) => {
    setSelected(null)
    onBuild(type)
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

      {/* ── Module list ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: 2,
            textTransform: 'uppercase', color: '#414649' }}>
            Modules
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SECTION_ORDER.map((type) => {
            const status = statusOf(type)
            const costs = SECTION_COSTS[type]
            const affordable = canAfford(costs, storage)
            const unavailable = isUnavailable(type)

            return (
              <ModuleListItem
                key={type}
                type={type}
                status={status}
                selected={selected === type}
                affordable={affordable && !unavailable}
                unavailable={unavailable}
                storage={storage}
                costs={costs}
                isPending={isPending}
                onSelect={() => handleSelect(type)}
                onBuild={handleBuild}
              />
            )
          })}
        </Box>
      </Box>

      {/* ── Station grid ─────────────────────────────────────────── */}
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: 2,
            textTransform: 'uppercase', color: '#414649' }}>
            Station Layout
          </Typography>
        </Box>

        <Box sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          gap: `${GAP}px`,
        }}>

          {/* SVG: dependency wiring */}
          <svg
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none', zIndex: 1,
            }}
          >
            {CONNECTIONS.map(([parent, child]) => {
              if (statusOf(parent) !== 'operational') return null
              const childBuilt = statusOf(child) === 'operational'
              const pc = cellCenter(MODULE_POS[parent].col, MODULE_POS[parent].row)
              const cc = cellCenter(MODULE_POS[child].col, MODULE_POS[child].row)
              return (
                <line
                  key={`${parent}-${child}`}
                  x1={pc.x} y1={pc.y} x2={cc.x} y2={cc.y}
                  stroke={HIGHLIGHT}
                  strokeOpacity={childBuilt ? 0.9 : 0.55}
                  strokeWidth={1.5}
                  strokeDasharray={childBuilt ? undefined : '5 4'}
                />
              )
            })}
          </svg>

          {SECTION_ORDER.map((type) => {
            const { col, row } = MODULE_POS[type]
            const status = statusOf(type)
            const isOperational = status === 'operational'
            const unavailable = isUnavailable(type)
            const isAvailable = status === 'available' && !unavailable
            const affordable = canAfford(SECTION_COSTS[type], storage)
            const buildable = isAvailable && affordable

            return (
              <Box
                key={type}
                onClick={isAvailable ? () => handleSelect(type) : undefined}
                sx={{
                  gridColumn: col + 1,
                  gridRow: row + 1,
                  cursor: isAvailable ? 'pointer' : 'default',
                }}
              >
                {isOperational ? (
                  <GridCell type={type} status={status} />
                ) : unavailable ? (
                  <GridCell type={type} unavailable />
                ) : buildable ? (
                  <GridCell type={type} status="available" selected />
                ) : isAvailable ? (
                  <GridCell type={type} status="available" />
                ) : (
                  <GridCell />
                )}
              </Box>
            )
          })}
          {Array.from({ length: ROWS * COLS }).map((_, i) => {
            const col = i % COLS
            const row = Math.floor(i / COLS)
            const occupied = SECTION_ORDER.some(
              (t) => MODULE_POS[t].col === col && MODULE_POS[t].row === row,
            )
            if (occupied) return null
            return (
              <Box key={`empty-${col}-${row}`} sx={{ gridColumn: col + 1, gridRow: row + 1 }}>
                <GridCell />
              </Box>
            )
          })}
        </Box>
      </Box>

    </Box>
  )
}
