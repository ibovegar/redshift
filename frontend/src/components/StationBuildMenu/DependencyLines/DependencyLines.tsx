interface LineCoord {
  x1: number
  y1: number
  x2: number
  y2: number
  active: boolean
  routing: 'horizontal' | 'elbow'
}

interface DependencyLinesProps {
  lines: LineCoord[]
}

export type { LineCoord }

export const DependencyLines = ({ lines }: DependencyLinesProps) => {
  if (lines.length === 0) return null

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'visible'
      }}
    >
      <defs>
        <marker id="dot-active" markerWidth="6" markerHeight="6" refX="3" refY="3">
          <circle cx="3" cy="3" r="2.5" fill="rgba(66,165,245,0.8)" />
        </marker>
        <marker id="dot-inactive" markerWidth="6" markerHeight="6" refX="3" refY="3">
          <circle cx="3" cy="3" r="2" fill="rgba(100,120,160,0.4)" />
        </marker>
      </defs>

      {lines.map((line, i) => {
        const color = line.active ? 'rgba(66,165,245,0.55)' : 'rgba(100,120,160,0.28)'
        const markerId = line.active ? 'dot-active' : 'dot-inactive'
        const midY = (line.y1 + line.y2) / 2

        const d =
          line.routing === 'horizontal'
            ? `M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`
            : `M ${line.x1} ${line.y1} L ${line.x1} ${midY} L ${line.x2} ${midY} L ${line.x2} ${line.y2}`

        return (
          <g key={i}>
            <path
              d={d}
              stroke={color}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray={line.active ? undefined : '5 4'}
              markerStart={`url(#${markerId})`}
              markerEnd={`url(#${markerId})`}
            />
          </g>
        )
      })}
    </svg>
  )
}
