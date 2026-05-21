import type { Blueprint } from 'models/blueprint'
import { getBlueprint, getBlueprintChildren, getBlueprintRoots } from 'models/blueprint'
import type { Edge } from 'reactflow'
import {
  CARD_FRAME_HEIGHT,
  CARD_FRAME_WIDTH,
  DEPTH_STEP,
  EDGE_COLOR,
  FRAME_LABEL_HEIGHT,
  SHIP_FRAME_HEIGHT,
  SHIP_FRAME_WIDTH,
  SIBLING_GAP
} from './constants'

export const isShipBp = (bp: Blueprint) => bp.category === 'ship'
export const getNodeWidth = (bp: Blueprint) => (isShipBp(bp) ? SHIP_FRAME_WIDTH : CARD_FRAME_WIDTH)
export const getNodeHeight = (bp: Blueprint) => (isShipBp(bp) ? SHIP_FRAME_HEIGHT : CARD_FRAME_HEIGHT)
const getSiblingStep = (bp: Blueprint) => getNodeHeight(bp) + SIBLING_GAP

// Returns the y-offset (px from node top) of the framed box's vertical center, used to align
// the ReactFlow handle with the box midline rather than the whole node bbox (which includes the
// external label above the box).
export const getBoxCenterY = (totalHeight: number) => (totalHeight + FRAME_LABEL_HEIGHT) / 2

interface LayoutNode {
  id: string
  x: number
  y: number
}

interface SubtreeLayout {
  height: number
  nodes: LayoutNode[]
}

/**
 * Recursive left-to-right tree layout. Each subtree's root is positioned with its center
 * vertically aligned to the midpoint of the combined height of its child subtrees.
 */
const layoutSubtree = (root: Blueprint, depth: number): SubtreeLayout => {
  // Ship-addons live inside the ship group node — they are not standalone tree nodes
  const children = getBlueprintChildren(root.id).filter((c) => c.category !== 'ship-addon')
  const ownStep = getSiblingStep(root)
  if (children.length === 0) {
    return {
      height: ownStep,
      nodes: [{ id: root.id, x: depth * DEPTH_STEP, y: 0 }]
    }
  }

  const childLayouts = children.map((child) => layoutSubtree(child, depth + 1))
  const totalChildHeight = childLayouts.reduce((sum, l) => sum + l.height, 0)

  let cursor = 0
  const childNodes: LayoutNode[] = []
  for (const cl of childLayouts) {
    for (const n of cl.nodes) {
      childNodes.push({ ...n, y: n.y + cursor })
    }
    cursor += cl.height
  }

  return {
    height: totalChildHeight,
    nodes: [{ id: root.id, x: depth * DEPTH_STEP, y: totalChildHeight / 2 - ownStep / 2 }, ...childNodes]
  }
}

const buildLayoutAndEdges = () => {
  const allNodes: LayoutNode[] = []
  let yOffset = 0
  for (const root of getBlueprintRoots()) {
    const layout = layoutSubtree(root, 0)
    for (const n of layout.nodes) allNodes.push({ ...n, y: n.y + yOffset })
    yOffset += layout.height
  }

  const edges: Edge[] = []
  for (const node of allNodes) {
    const bp = getBlueprint(node.id)
    if (bp?.parentBlueprintId) {
      edges.push({
        id: `${bp.parentBlueprintId}->${bp.id}`,
        source: bp.parentBlueprintId,
        target: bp.id,
        type: 'blueprint',
        style: { stroke: EDGE_COLOR, strokeWidth: 1.5 }
      })
    }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const n of allNodes) {
    const bp = getBlueprint(n.id)!
    minX = Math.min(minX, n.x)
    maxX = Math.max(maxX, n.x + getNodeWidth(bp))
    minY = Math.min(minY, n.y)
    maxY = Math.max(maxY, n.y + getNodeHeight(bp))
  }

  return {
    nodes: allNodes,
    edges,
    bbox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
  }
}

export const LAYOUT = buildLayoutAndEdges()

// Bbox kept only to bound panning to the tree area. Initial zoom + viewport are handled by
// ReactFlow's fitView — no manual scale / centering math needed.
export const TRANSLATE_EXTENT: [[number, number], [number, number]] = [
  [LAYOUT.bbox.minX, LAYOUT.bbox.minY],
  [LAYOUT.bbox.maxX, LAYOUT.bbox.maxY]
]
