import { Box } from '@mui/material'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import { Handle, type NodeProps, Position } from 'reactflow'
import { getResearchStatus } from '../../utils'
import { CARD_FRAME_HEIGHT, CARD_FRAME_WIDTH, SHIP_FRAME_HEIGHT, SHIP_FRAME_WIDTH } from '../constants'
import { getBoxCenterY } from '../layout'
import { NodeFrame } from '../NodeFrame/NodeFrame'
import { ResearchCard } from '../ResearchCard/ResearchCard'

export interface ShipGroupNodeData {
  ship: Blueprint
  addons: Blueprint[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  onCardClick: (blueprint: Blueprint) => void
}

// The ship group renders as TWO sibling frames inside one ReactFlow node: a small frame for the
// ship card on the left, and a wider frame for the upgrade grid on the right. Total width still
// matches SHIP_FRAME_WIDTH so the tree layout placement is unchanged.
const SHIP_BOX_WIDTH = CARD_FRAME_WIDTH
const UPGRADES_BOX_WIDTH = SHIP_FRAME_WIDTH - SHIP_BOX_WIDTH

const HIDDEN_HANDLE_STYLE = { opacity: 0, pointerEvents: 'none' as const }
const SHIP_HANDLE_TOP = `${getBoxCenterY(SHIP_FRAME_HEIGHT)}px`

export const ShipGroupNode = ({ data }: NodeProps<ShipGroupNodeData>) => {
  const { ship, addons, researchedBlueprints, researchInProgress, onCardClick } = data
  const shipStatus = getResearchStatus(ship, researchedBlueprints, researchInProgress)
  // Upgrades only appear once the ship itself has been researched — until then we only render
  // the ship card on the left, and the right-hand slot in the node bbox stays empty.
  const shipResearched = researchedBlueprints.includes(ship.id)
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...HIDDEN_HANDLE_STYLE, top: SHIP_HANDLE_TOP, transform: 'translate(-50%, -50%)' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <NodeFrame label={ship.name} width={SHIP_BOX_WIDTH} height={CARD_FRAME_HEIGHT}>
          <ResearchCard blueprint={ship} status={shipStatus} onClick={() => onCardClick(ship)} />
        </NodeFrame>
        {shipResearched && (
          <NodeFrame label="Upgrades" width={UPGRADES_BOX_WIDTH} height={SHIP_FRAME_HEIGHT}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', columnGap: 1, rowGap: 1 }}>
              {addons.map((addon) => (
                <ResearchCard
                  key={addon.id}
                  blueprint={addon}
                  status={getResearchStatus(addon, researchedBlueprints, researchInProgress)}
                  onClick={() => onCardClick(addon)}
                />
              ))}
            </Box>
          </NodeFrame>
        )}
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...HIDDEN_HANDLE_STYLE, top: SHIP_HANDLE_TOP, transform: 'translate(50%, -50%)' }}
      />
    </>
  )
}
