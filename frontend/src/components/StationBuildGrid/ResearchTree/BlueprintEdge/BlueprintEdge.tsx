import { BaseEdge, type EdgeProps, getSmoothStepPath } from 'reactflow'

// Orthogonal step path between two nodes — sharp 90° corners (borderRadius: 0).
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
  return <BaseEdge path={edgePath} style={style} />
}
