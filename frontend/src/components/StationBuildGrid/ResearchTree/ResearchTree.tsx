import { Box } from '@mui/material'
import { BlueprintBackground } from 'components/BlueprintBackground/BlueprintBackground'
import { useStartResearch } from 'hooks/useBlueprints'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import { getBlueprint, getBlueprintChildren } from 'models/blueprint'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import ReactFlow, { type Node, type ReactFlowInstance } from 'reactflow'
import 'reactflow/dist/style.css'
import { SectionHeader } from '../SectionHeader'
import { getResearchStatus } from '../utils'
import { BlueprintEdge } from './BlueprintEdge/BlueprintEdge'
import { CardNode } from './CardNode/CardNode'
import { CARD_FRAME_HEIGHT, CARD_FRAME_WIDTH, SHIP_FRAME_HEIGHT, SHIP_FRAME_WIDTH } from './constants'
import { buildLayout, isShipBp } from './layout'
import { ShipGroupNode } from './ShipGroupNode/ShipGroupNode'

const nodeTypes = { card: CardNode, shipGroup: ShipGroupNode }
const edgeTypes = { blueprint: BlueprintEdge }

// Zoom range chosen so the initial tree (just command + research + 3 modules) reads close at
// ~1.5x, and as engineering → ships → upgrades reveal, fitView zooms out smoothly to fit the
// growing bbox. The 0.1 padding leaves enough breathing room without wasting panel space.
const FIT_VIEW_OPTIONS = { padding: 0.1, minZoom: 0.3, maxZoom: 1.5 } as const
const FIT_VIEW_DURATION_MS = 600

interface Props {
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
}

export const ResearchTree = ({ researchedBlueprints, researchInProgress }: Props) => {
  const instanceRef = useRef<ReactFlowInstance | null>(null)
  const prevResearchedRef = useRef<string[]>(researchedBlueprints)
  const prevLayoutRef = useRef<ReturnType<typeof buildLayout> | null>(null)
  const startResearch = useStartResearch()

  // Layout is rebuilt every time the researched set changes: hidden subtrees take up no space, so
  // the visible nodes pack into the tightest left-to-right tree possible. Ships expand from a
  // card-sized bbox to a ship-frame bbox the moment they're researched (to fit their Upgrades).
  const layout = useMemo(() => buildLayout(researchedBlueprints), [researchedBlueprints])

  // No pan constraint — ReactFlow's `translateExtent` is in world coords and any value tight
  // enough to prevent overflow at one zoom level snaps-to-center at another. Pan is left
  // unconstrained so it works at every zoom; the `setCenter` animation on each research keeps
  // the camera framed on the new content.

  // Placeholder click handler until the proper detail modal + Research button lands. For now,
  // clicking an available card immediately fires the startResearch mutation; the backend deducts
  // materials and rejects if there aren't enough. The `isPending` guard prevents a second click
  // from firing while the first mutation is still in flight (otherwise the React Query cache
  // hasn't updated yet, status looks `available` from a stale read, and the backend then
  // (correctly) rejects the second mutation with "Already researched").
  const handleCardClick = useCallback(
    (blueprint: Blueprint) => {
      if (researchInProgress || startResearch.isPending) return
      const status = getResearchStatus(blueprint, researchedBlueprints, researchInProgress)
      if (status !== 'available') return
      startResearch.mutate(blueprint.id)
    },
    [researchedBlueprints, researchInProgress, startResearch]
  )

  const nodes: Node[] = useMemo(
    () =>
      layout.nodes.map((n) => {
        const blueprint = getBlueprint(n.id) as Blueprint
        if (isShipBp(blueprint)) {
          const addons = getBlueprintChildren(blueprint.id)
          return {
            id: n.id,
            type: 'shipGroup',
            position: { x: n.x, y: n.y },
            data: { ship: blueprint, addons, researchedBlueprints, researchInProgress, onCardClick: handleCardClick }
          }
        }
        return {
          id: n.id,
          type: 'card',
          position: { x: n.x, y: n.y },
          data: { blueprint, researchedBlueprints, researchInProgress, onCardClick: handleCardClick }
        }
      }),
    [layout, researchedBlueprints, researchInProgress, handleCardClick]
  )

  // Re-fit whenever the layout's node set changes. To make the camera feel like it zooms OUT
  // FROM the freshly researched item — without the jarring jump that a snap-then-fitView creates —
  // we do a SINGLE animated `setCenter` call:
  //   - target position = the freshly researched node's center (so the camera ends up centered on it)
  //   - target zoom     = the zoom level fitView would have picked for the new tree's bbox
  // Because setCenter animates from the current viewport, the visible motion is: current view
  // → researched item is brought into the middle while the camera simultaneously zooms out to
  // the new fit zoom. One continuous transition, no teleport.
  //
  // The double rAF is intentional: calling setCenter synchronously here uses ReactFlow's STALE
  // internal node-store (it hasn't yet committed the new positions we just passed in via `nodes`),
  // so the resulting transform is wrong. Deferring through two animation frames lets React commit,
  // ReactFlow's own effects run, and its internal node positions update first.
  //
  // Biome can't see the dependency on `layout` from static analysis because the body only
  // touches the stable instance/prev refs, hence the suppression.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when computed layout changes
  useEffect(() => {
    const prev = prevResearchedRef.current
    const prevLayout = prevLayoutRef.current
    const newlyResearched = researchedBlueprints.find((id) => !prev.includes(id))
    prevResearchedRef.current = researchedBlueprints
    prevLayoutRef.current = layout

    let cancelled = false
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        const instance = instanceRef.current
        if (!instance) return

        // Fall back to a plain fitView on initial render (nothing was newly researched).
        if (!newlyResearched) {
          instance.fitView({ ...FIT_VIEW_OPTIONS, duration: FIT_VIEW_DURATION_MS })
          return
        }

        const node = layout.nodes.find((n) => n.id === newlyResearched)
        const oldNode = prevLayout?.nodes.find((n) => n.id === newlyResearched)
        const bp = getBlueprint(newlyResearched)
        if (!node || !bp) return

        const isShip = isShipBp(bp) && researchedBlueprints.includes(bp.id)
        const nodeW = isShip ? SHIP_FRAME_WIDTH : CARD_FRAME_WIDTH
        const nodeH = isShip ? SHIP_FRAME_HEIGHT : CARD_FRAME_HEIGHT

        // Pre-shift the viewport (no animation) to compensate for the researched node's world
        // position change. The layout algorithm re-centers each parent within its subtree, so
        // when a leaf becomes a parent (e.g. engineering gaining 5 ships as children), its own
        // y coordinate shifts to the middle of the new subtree — making the card visibly pop
        // to a new screen position before the camera catches up.
        //
        // By translating the viewport by `(oldNode - newNode) * zoom`, the researched item ends
        // up at the SAME screen pixel after the layout commits, so the subsequent setCenter
        // animation starts from a position where the card hasn't visually moved.
        const viewport = instance.getViewport()
        if (oldNode && (oldNode.x !== node.x || oldNode.y !== node.y)) {
          instance.setViewport(
            {
              x: viewport.x + (oldNode.x - node.x) * viewport.zoom,
              y: viewport.y + (oldNode.y - node.y) * viewport.zoom,
              zoom: viewport.zoom
            },
            { duration: 0 }
          )
        }

        // Compute the zoom level that `fitView` would pick — same formula ReactFlow uses
        // internally: shrink the container by the padding factor, then take the smaller of the
        // x / y zoom needed to fit the tree bbox in that area.
        const reactFlowEl = instance.viewportInitialized
          ? (document.querySelector('.react-flow') as HTMLElement | null)
          : null
        const containerW = reactFlowEl?.clientWidth ?? 960
        const containerH = reactFlowEl?.clientHeight ?? 600
        const bboxW = layout.translateExtent[1][0] - layout.translateExtent[0][0]
        const bboxH = layout.translateExtent[1][1] - layout.translateExtent[0][1]
        const xZoom = (containerW * (1 - FIT_VIEW_OPTIONS.padding * 2)) / bboxW
        const yZoom = (containerH * (1 - FIT_VIEW_OPTIONS.padding * 2)) / bboxH
        const fitZoom = Math.min(
          Math.max(Math.min(xZoom, yZoom), FIT_VIEW_OPTIONS.minZoom),
          FIT_VIEW_OPTIONS.maxZoom
        )

        instance.setCenter(node.x + nodeW / 2, node.y + nodeH / 2, {
          zoom: fitZoom,
          duration: FIT_VIEW_DURATION_MS
        })
      })
    })
    return () => {
      cancelled = true
    }
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
          // ReactFlow's documented way to handle node clicks. Fires even with
          // `elementsSelectable={false}` and `nodesDraggable={false}`, so we don't have to fight
          // with pointer-event interception on the custom node content.
          onNodeClick={(_, node) => {
            const bp = getBlueprint(node.id)
            if (bp) handleCardClick(bp)
          }}
          // Soft pan constraint via onMoveEnd: pan/zoom is fully free during the drag, but on
          // release we check whether the viewport's center is still inside the tree's bbox; if
          // not, smoothly animate back to the nearest valid position. This avoids ReactFlow's
          // `translateExtent` snapping behavior while still keeping the tree on-screen.
          onMoveEnd={(_, vp) => {
            const instance = instanceRef.current
            const el = document.querySelector('.react-flow') as HTMLElement | null
            if (!instance || !el) return
            const [[minX, minY], [maxX, maxY]] = layout.translateExtent
            const centerX = (-vp.x + el.clientWidth / 2) / vp.zoom
            const centerY = (-vp.y + el.clientHeight / 2) / vp.zoom
            const clampedX = Math.max(minX, Math.min(centerX, maxX))
            const clampedY = Math.max(minY, Math.min(centerY, maxY))
            if (clampedX !== centerX || clampedY !== centerY) {
              instance.setCenter(clampedX, clampedY, { zoom: vp.zoom, duration: 200 })
            }
          }}
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
          preventScrolling
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'blueprint' }}
        />
      </BlueprintBackground>
    </Box>
  )
}
