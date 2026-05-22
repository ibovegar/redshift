import { Box } from '@mui/material'
import { BlueprintBackground } from 'components/BlueprintBackground/BlueprintBackground'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import { getBlueprint, getBlueprintChildren } from 'models/blueprint'
import { useEffect, useMemo, useRef } from 'react'
import ReactFlow, { type Node, type ReactFlowInstance } from 'reactflow'
import 'reactflow/dist/style.css'
import { SectionHeader } from '../SectionHeader'
import { BlueprintEdge } from './BlueprintEdge/BlueprintEdge'
import { CardNode } from './CardNode/CardNode'
import { buildLayout, isShipBp } from './layout'
import { ShipGroupNode } from './ShipGroupNode/ShipGroupNode'

const nodeTypes = { card: CardNode, shipGroup: ShipGroupNode }
const edgeTypes = { blueprint: BlueprintEdge }

const FIT_VIEW_OPTIONS = { padding: 0.2, maxZoom: 1 } as const

interface Props {
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
}

export const ResearchTree = ({ researchedBlueprints, researchInProgress }: Props) => {
  const instanceRef = useRef<ReactFlowInstance | null>(null)

  // Layout is rebuilt every time the researched set changes: hidden subtrees take up no space, so
  // the visible nodes pack into the tightest left-to-right tree possible. Ships expand from a
  // card-sized bbox to a ship-frame bbox the moment they're researched (to fit their Upgrades).
  const layout = useMemo(() => buildLayout(researchedBlueprints), [researchedBlueprints])

  const nodes: Node[] = useMemo(
    () =>
      layout.nodes.map((n) => {
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
    [layout, researchedBlueprints, researchInProgress]
  )

  // Re-fit whenever the layout's node set changes — the zoom adjusts to whatever's currently
  // visible, so the tree fills the panel comfortably at every step of the player's progression.
  // The effect body only touches the (stable) instance ref, so Biome's exhaustive-deps rule can't
  // see the dependency from static analysis.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when computed layout changes
  useEffect(() => {
    instanceRef.current?.fitView({ ...FIT_VIEW_OPTIONS, duration: 400 })
  }, [layout])

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
          edges={layout.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeOrigin={[0, 0]}
          fitView
          fitViewOptions={FIT_VIEW_OPTIONS}
          onInit={(instance) => {
            instanceRef.current = instance
          }}
          translateExtent={layout.translateExtent}
          minZoom={0.3}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'blueprint' }}
        />
      </BlueprintBackground>
    </Box>
  )
}
