import type { Blueprint, ResearchTask } from 'models/blueprint'
import { Handle, type NodeProps, Position } from 'reactflow'
import { getResearchStatus } from '../../utils'
import { CARD_FRAME_HEIGHT, CARD_FRAME_WIDTH } from '../constants'
import { getBoxCenterY } from '../layout'
import { NodeFrame } from '../NodeFrame/NodeFrame'
import { ResearchCard } from '../ResearchCard/ResearchCard'

export interface CardNodeData {
  blueprint: Blueprint
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  activeResearchId: string | null
  inProgressResearchIds: string[]
  onCardClick: (blueprint: Blueprint, element: HTMLElement) => void
}

const HIDDEN_HANDLE_STYLE = { opacity: 0, pointerEvents: 'none' as const }
const CARD_HANDLE_TOP = `${getBoxCenterY(CARD_FRAME_HEIGHT)}px`

export const CardNode = ({ data }: NodeProps<CardNodeData>) => {
  const { blueprint, researchedBlueprints, researchInProgress, activeResearchId, inProgressResearchIds, onCardClick } =
    data
  const status = getResearchStatus(blueprint, researchedBlueprints, activeResearchId, inProgressResearchIds)
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...HIDDEN_HANDLE_STYLE, top: CARD_HANDLE_TOP, transform: 'translate(-50%, -50%)' }}
      />
      <NodeFrame label={blueprint.name} width={CARD_FRAME_WIDTH} height={CARD_FRAME_HEIGHT}>
        <ResearchCard
          blueprint={blueprint}
          status={status}
          task={researchInProgress}
          onClick={(el) => onCardClick(blueprint, el)}
        />
      </NodeFrame>
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...HIDDEN_HANDLE_STYLE, top: CARD_HANDLE_TOP, transform: 'translate(50%, -50%)' }}
      />
    </>
  )
}
