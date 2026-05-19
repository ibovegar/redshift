import { Box } from '@mui/material'
import { useStartResearch } from 'hooks'
import { BLUEPRINTS } from 'models/blueprint'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import { SectionHeader } from '../SectionHeader'
import { ResearchCard } from './ResearchCard'

const ENGINEERING_BLUEPRINT_ID = 'bp-mod-engineering'

const childrenOf = (parentId: string | undefined): Blueprint[] =>
  BLUEPRINTS.filter((bp) => bp.parentBlueprintId === parentId)

const moduleBlueprints = childrenOf(undefined).filter((bp) => bp.category === 'module')
const shipBlueprints = childrenOf(ENGINEERING_BLUEPRINT_ID).filter((bp) => bp.category === 'ship')

interface Props {
  storage: CargoItem[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
}

export const ResearchTree = ({ storage, researchedBlueprints, researchInProgress }: Props) => {
  const startResearch = useStartResearch()

  const cardProps = {
    storage,
    researchedBlueprints,
    researchInProgress,
    isPending: startResearch.isPending,
    onStart: (id: string) => startResearch.mutate(id)
  }

  return (
    <Box sx={{ flex: 1 }}>
      <SectionHeader>Research Tree</SectionHeader>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Row>
          {moduleBlueprints.map((bp) => (
            <ResearchCard key={bp.id} blueprint={bp} {...cardProps} />
          ))}
        </Row>

        {shipBlueprints.map((ship) => (
          <Box key={ship.id} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Row>
              <ResearchCard blueprint={ship} {...cardProps} />
            </Row>
            <Row wrap>
              {childrenOf(ship.id).map((addon) => (
                <ResearchCard key={addon.id} blueprint={addon} {...cardProps} />
              ))}
            </Row>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const Row = ({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</Box>
)
