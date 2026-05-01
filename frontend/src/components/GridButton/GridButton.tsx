import { keyframes, styled } from '@mui/material/styles'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

const BOX_SIZE = 5

function parseColor(color: string): { r: number; g: number; b: number } {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
  }
  return { r: 200, g: 200, b: 200 }
}

function generateShades(count: number, baseColor: { r: number; g: number; b: number }): string[] {
  const max = Math.max(baseColor.r, baseColor.g, baseColor.b) || 1
  const satR = baseColor.r / max
  const satG = baseColor.g / max
  const satB = baseColor.b / max
  return Array.from({ length: count }, () => {
    const boost = 20 + Math.round(Math.random() * 20)
    const r = Math.min(255, Math.round(baseColor.r + boost * satR))
    const g = Math.min(255, Math.round(baseColor.g + boost * satG))
    const b = Math.min(255, Math.round(baseColor.b + boost * satB))
    return `rgb(${r}, ${g}, ${b})`
  })
}

function lightenColor(color: string, amount: number): string {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return color
  const r = Math.min(255, Number(match[1]) + amount)
  const g = Math.min(255, Number(match[2]) + amount)
  const b = Math.min(255, Number(match[3]) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

interface GridButtonProps {
  children: ReactNode
  active?: boolean
}

const boxPulse = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`

const Root = styled('span')({
  position: 'relative',
  display: 'inline-flex',
  overflow: 'hidden',
  borderRadius: 'inherit',
  width: '100%',
  flex: 1
})

const Content = styled('span')({
  position: 'relative',
  zIndex: 2,
  display: 'inherit',
  width: '100%'
})

const GridContainer = styled('span')<{ columns: number; rows: number }>(({ columns, rows }) => ({
  position: 'absolute',
  inset: '-1px',
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gridTemplateRows: `repeat(${rows}, 1fr)`,
  pointerEvents: 'none',
  zIndex: 1,
  gap: 0
}))

const Box = styled('span')<{ color: string; delay: number }>(({ color, delay }) => ({
  backgroundColor: color,
  transform: 'scale(0)',
  outline: `1px solid ${color}`,
  animation: `${boxPulse} 0.1s ease-out ${delay}ms forwards`
}))

const StaticBox = styled('span')<{ color: string }>(({ color }) => ({
  backgroundColor: color,
  outline: `1px solid ${color}`
}))

export const GridButton = (props: GridButtonProps) => {
  const { children, active } = props

  const rootRef = useRef<HTMLSpanElement>(null)
  const [showBoxes, setShowBoxes] = useState(false)
  const [grid, setGrid] = useState<{
    columns: number
    rows: number
    boxes: { key: string; color: string; delay: number }[]
  }>({
    columns: 0,
    rows: 0,
    boxes: []
  })

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const width = el.offsetWidth
    const height = el.offsetHeight
    const columns = Math.max(1, Math.round(width / BOX_SIZE))
    const rows = Math.max(1, Math.round(height / BOX_SIZE))
    const totalBoxes = columns * rows
    const computedBg = getComputedStyle(el.parentElement ?? el).backgroundColor
    const baseColor = parseColor(computedBg)
    const shades = generateShades(totalBoxes, baseColor)
    const boxes = shades.map((color, i) => ({
      key: `${i}-${color}`,
      color,
      delay: 15 + Math.round(Math.random() * 250)
    }))
    setGrid({ columns, rows, boxes })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setShowBoxes(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setShowBoxes(false)
  }, [])

  return (
    <Root ref={rootRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {grid.boxes.length > 0 && showBoxes && !active && (
        <GridContainer columns={grid.columns} rows={grid.rows}>
          {grid.boxes.map((box) => (
            <Box key={box.key} color={box.color} delay={box.delay} />
          ))}
        </GridContainer>
      )}
      {grid.boxes.length > 0 && active && (
        <GridContainer columns={grid.columns} rows={grid.rows}>
          {grid.boxes.map((box) => (
            <StaticBox key={box.key} color={lightenColor(box.color, 30)} />
          ))}
        </GridContainer>
      )}
      <Content>{children}</Content>
    </Root>
  )
}

export type { GridButtonProps }
