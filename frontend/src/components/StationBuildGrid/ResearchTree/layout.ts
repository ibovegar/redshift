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

interface LayoutNode {
  id: string
  x: number
  y: number
}

interface SubtreeLayout {
  height: number
  nodes: LayoutNode[]
}

export interface ComputedLayout {
  nodes: LayoutNode[]
  edges: Edge[]
  translateExtent: [[number, number], [number, number]]
}

// Returns the y-offset (px from node top) of the framed box's vertical center, used to align the
// ReactFlow handle with the box midline rather than the whole node bbox (which includes the
// external label above the box).
export const getBoxCenterY = (totalHeight: number) => (totalHeight + FRAME_LABEL_HEIGHT) / 2

export const isShipBp = (bp: Blueprint) => bp.category === 'ship'

// A ship's bbox is wide (SHIP_FRAME) when researched (Upgrades sub-frame visible) and narrow
// (CARD_FRAME) when not researched (only the ship card rendered). Every other category always
// uses card-frame dimensions.
const dimensionsOf = (bp: Blueprint, researchedIds: Set<string>) =>
  isShipBp(bp) && researchedIds.has(bp.id)
    ? { width: SHIP_FRAME_WIDTH, height: SHIP_FRAME_HEIGHT }
    : { width: CARD_FRAME_WIDTH, height: CARD_FRAME_HEIGHT }

/**
 * Compute the tree layout for the currently-researched state. Progressive reveal: a node's
 * children are only included if the node itself is researched, so hidden subtrees take up no
 * space and the visible nodes pack as compactly as possible. Re-call on every research change.
 */
export const buildLayout = (researchedBlueprints: string[]): ComputedLayout => {
  const researchedIds = new Set(researchedBlueprints)

  // Recursive left-to-right tree layout. Each subtree's root is positioned with its center
  // vertically aligned to the midpoint of the combined height of its child subtrees.
  const layoutSubtree = (root: Blueprint, depth: number): SubtreeLayout => {
    // Ship-addons live inside the ship group node — they are not standalone tree nodes
    const children = researchedIds.has(root.id)
      ? getBlueprintChildren(root.id).filter((c) => c.category !== 'ship-addon')
      : []
    const ownDims = dimensionsOf(root, researchedIds)
    const ownStep = ownDims.height + SIBLING_GAP

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

  const allNodes: LayoutNode[] = []
  let yOffset = 0
  for (const root of getBlueprintRoots()) {
    const layout = layoutSubtree(root, 0)
    for (const n of layout.nodes) allNodes.push({ ...n, y: n.y + yOffset })
    yOffset += layout.height
  }

  const visibleIds = new Set(allNodes.map((n) => n.id))
  const edges: Edge[] = []
  for (const node of allNodes) {
    const bp = getBlueprint(node.id)
    if (bp?.parentBlueprintId && visibleIds.has(bp.parentBlueprintId)) {
      edges.push({
        id: `${bp.parentBlueprintId}->${bp.id}`,
        source: bp.parentBlueprintId,
        target: bp.id,
        type: 'blueprint',
        style: { stroke: EDGE_COLOR, strokeWidth: 2 }
      })
    }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const n of allNodes) {
    const bp = getBlueprint(n.id)
    if (!bp) continue
    const dims = dimensionsOf(bp, researchedIds)
    minX = Math.min(minX, n.x)
    maxX = Math.max(maxX, n.x + dims.width)
    minY = Math.min(minY, n.y)
    maxY = Math.max(maxY, n.y + dims.height)
  }

  const translateExtent: [[number, number], [number, number]] = [
    [minX, minY],
    [maxX, maxY]
  ]
  return { nodes: allNodes, edges, translateExtent }
}
