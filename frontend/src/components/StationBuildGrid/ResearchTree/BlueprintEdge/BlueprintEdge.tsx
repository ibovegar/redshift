import { BaseEdge, type EdgeProps, getSmoothStepPath } from 'reactflow'
import { EDGE_NOTCH_COLOR, EDGE_NOTCH_SIZE } from '../constants'

// EVE-ISIS circuit-trace edge: an orthogonal step path with small filled-square notches at each
// 90° bend, and a terminator notch at the source where the trace leaves the parent frame.
export const BlueprintEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0
  })
  const hasBend = sourceY !== targetY
  const midX = (sourceX + targetX) / 2
  const half = EDGE_NOTCH_SIZE / 2
  return (
    <>
      <BaseEdge path={edgePath} style={style} />
      <rect
        x={sourceX - half}
        y={sourceY - half}
        width={EDGE_NOTCH_SIZE}
        height={EDGE_NOTCH_SIZE}
        fill={EDGE_NOTCH_COLOR}
      />
      {hasBend && (
        <>
          <rect
            x={midX - half}
            y={sourceY - half}
            width={EDGE_NOTCH_SIZE}
            height={EDGE_NOTCH_SIZE}
            fill={EDGE_NOTCH_COLOR}
          />
          <rect
            x={midX - half}
            y={targetY - half}
            width={EDGE_NOTCH_SIZE}
            height={EDGE_NOTCH_SIZE}
            fill={EDGE_NOTCH_COLOR}
          />
        </>
      )}
    </>
  )
}
