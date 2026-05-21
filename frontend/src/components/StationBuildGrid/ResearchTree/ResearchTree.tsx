import { Box } from '@mui/material'
import { BlueprintBackground } from 'components/BlueprintBackground/BlueprintBackground'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import { getBlueprint, getBlueprintChildren } from 'models/blueprint'
import { useMemo } from 'react'
import ReactFlow, { type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import { SectionHeader } from '../SectionHeader'
import { BlueprintEdge } from './BlueprintEdge/BlueprintEdge'
import { CardNode } from './CardNode/CardNode'
import { isShipBp, LAYOUT, TRANSLATE_EXTENT } from './layout'
import { ShipGroupNode } from './ShipGroupNode/ShipGroupNode'

const nodeTypes = { card: CardNode, shipGroup: ShipGroupNode }
const edgeTypes = { blueprint: BlueprintEdge }

interface Props {
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
}

export const ResearchTree = ({ researchedBlueprints, researchInProgress }: Props) => {
  const nodes: Node[] = useMemo(
    () =>
      LAYOUT.nodes.map((n) => {
        const blueprint = getBlueprint(n.id) as Blueprint
        const onCardClick = () => {
          /* modal hook-up coming later */
        }
        if (isShipBp(blueprint)) {
          const addons = getBlueprintChildren(blueprint.id)
          return {
            id: n.id,
            type: 'shipGroup',
            position: { x: n.x, y: n.y },
            data: { ship: blueprint, addons, researchedBlueprints, researchInProgress, onCardClick }
          }
        }
        return {
          id: n.id,
          type: 'card',
          position: { x: n.x, y: n.y },
          data: { blueprint, researchedBlueprints, researchInProgress, onCardClick }
        }
      }),
    [researchedBlueprints, researchInProgress]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SectionHeader>Research Tree</SectionHeader>
      <BlueprintBackground
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          position: 'relative',
          borderRadius: 0.5,
          overflow: 'hidden'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={LAYOUT.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeOrigin={[0, 0]}
          fitView
          fitViewOptions={{ padding: 0.05, maxZoom: 1 }}
          translateExtent={TRANSLATE_EXTENT}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'blueprint' }}
        />
      </BlueprintBackground>
    </Box>
  )
}
