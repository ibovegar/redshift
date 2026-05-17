import { Box, Typography } from '@mui/material'
import type { CargoItem } from 'models/spacecraft'
import { SECTION_BLUEPRINT, SECTION_ORDER } from 'models/station-section'
import type { SectionType, StationSection } from 'models/station-section'
import { useLayoutEffect, useRef, useState } from 'react'
import { DependencyLines } from './DependencyLines/DependencyLines'
import type { LineCoord } from './DependencyLines/DependencyLines'
import { SectionCard } from './SectionCard/SectionCard'

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  onBuild: (type: SectionType) => void
  isPending: boolean
}

const ROW_OF: Record<SectionType, number> = {
  command: 0, research: 0, engineering: 0,
  storage: 1, power: 1
}

export const StationBuildMenu = ({ sections, storage, onBuild, isPending }: Props) => {
  const sectionMap = new Map(sections.map((s) => [s.type, s]))
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Partial<Record<SectionType, HTMLDivElement>>>({})
  const [lines, setLines] = useState<LineCoord[]>([])

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      if (!container) return
      const cr = container.getBoundingClientRect()

      const deps = (Object.entries(SECTION_BLUEPRINT) as [SectionType, SectionType | null][]).filter(
        ([, parent]) => parent !== null
      ) as [SectionType, SectionType][]

      const newLines: LineCoord[] = deps.flatMap(([child, parent]): LineCoord[] => {
        const parentEl = cardRefs.current[parent]
        const childEl = cardRefs.current[child]
        if (!parentEl || !childEl) return []

        const p = parentEl.getBoundingClientRect()
        const c = childEl.getBoundingClientRect()
        const sameRow = ROW_OF[parent] === ROW_OF[child]
        const active = sectionMap.get(parent)?.status === 'operational'

        if (sameRow) {
          return [{
            x1: p.right - cr.left,
            y1: p.top + p.height / 2 - cr.top,
            x2: c.left - cr.left,
            y2: c.top + c.height / 2 - cr.top,
            active,
            routing: 'horizontal'
          }]
        }

        return [{
          x1: p.left + p.width / 2 - cr.left,
          y1: p.bottom - cr.top,
          x2: c.left + c.width / 2 - cr.left,
          y2: c.top - cr.top,
          active,
          routing: 'elbow'
        }]
      })

      setLines(newLines)
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [sections])

  return (
    <Box sx={{ minWidth: 720 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 3, height: 16, bgcolor: '#42a5f5', flexShrink: 0 }} />
        <Typography variant="hud-tag" sx={{ color: '#42a5f5', fontFamily: 'monospace', letterSpacing: 2 }}>
          Station Modules
        </Typography>
      </Box>

      <Box ref={containerRef} sx={{ position: 'relative' }}>
        <DependencyLines lines={lines} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, position: 'relative', zIndex: 1 }}>
          {SECTION_ORDER.map((type) => {
            const status = sectionMap.get(type)?.status ?? 'locked'
            const blueprintReq = SECTION_BLUEPRINT[type]
            const blueprintMet = !blueprintReq || sectionMap.get(blueprintReq)?.status === 'operational'

            return (
              <Box
                key={type}
                ref={(el) => { cardRefs.current[type] = el as HTMLDivElement }}
              >
                <SectionCard
                  type={type}
                  status={status}
                  blueprintMet={blueprintMet}
                  storage={storage}
                  isPending={isPending}
                  onBuild={onBuild}
                />
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
