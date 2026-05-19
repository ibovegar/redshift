import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_SYMBOLS } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { Blueprint, ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import { useEffect, useState } from 'react'
import { canAfford, getResearchProgress, getResearchStatus, heldAmount, type ResearchStatus } from '../utils'

const CARD_WIDTH = 180
const PROGRESS_TICK_MS = 500
const CARD_CLIP_PATH = 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))'

const useTickWhile = (active: boolean, intervalMs: number) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])
  return now
}

interface Props {
  blueprint: Blueprint
  storage: CargoItem[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  isPending: boolean
  onStart: (id: string) => void
}

export const ResearchCard = ({ blueprint, storage, researchedBlueprints, researchInProgress, isPending, onStart }: Props) => {
  const status = getResearchStatus(blueprint, researchedBlueprints, researchInProgress)
  const isInProgress = status === 'in-progress'
  const now = useTickWhile(isInProgress, PROGRESS_TICK_MS)

  const affordable = canAfford(blueprint.cost, storage)
  const blockedByOther = !!researchInProgress && researchInProgress.blueprintId !== blueprint.id
  const canStart = status === 'available' && affordable && !blockedByOther && !isPending
  const isResearched = status === 'researched'

  return (
    <Box
      sx={{
        width: CARD_WIDTH,
        bgcolor: isResearched ? 'hud.cardBgActive' : 'hud.cardBg',
        clipPath: CARD_CLIP_PATH,
        p: 1.5,
        opacity: status === 'locked' ? 0.5 : 1
      }}
    >
      <CardTitle name={blueprint.name} category={blueprint.category} isResearched={isResearched} />
      <CostList costs={blueprint.cost} storage={storage} isResearched={isResearched} />

      <Typography variant="hud-data" sx={{ color: 'hud.textMuted', mb: 1 }}>
        Duration: {Math.round(blueprint.durationMs / 1000)}s
      </Typography>

      <CardFooter
        status={status}
        canStart={canStart}
        onStart={() => onStart(blueprint.id)}
        progress={isInProgress && researchInProgress ? getResearchProgress(researchInProgress, now) : 0}
      />
    </Box>
  )
}

const CardTitle = ({ name, category, isResearched }: { name: string; category: string; isResearched: boolean }) => (
  <>
    <Typography variant="hud-heading" sx={{ color: isResearched ? 'common.white' : 'hud.text', mb: 0.5 }}>
      {name}
    </Typography>
    <Typography variant="hud-tag" sx={{ mb: 1 }}>
      {category.replace('-', ' ')}
    </Typography>
  </>
)

const CostList = ({
  costs,
  storage,
  isResearched
}: {
  costs: Blueprint['cost']
  storage: CargoItem[]
  isResearched: boolean
}) => (
  <Stack spacing={0.25} sx={{ mb: 1 }}>
    {Object.entries(costs).map(([material, required]) => {
      const mat = material as AsteroidMaterial
      const held = heldAmount(storage, mat)
      const met = held >= (required ?? 0)
      const amountColor = isResearched ? 'common.white' : met ? 'hud.success' : 'hud.error'
      return (
        <Box key={mat} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="hud-data" sx={{ color: 'hud.textMuted' }}>
            {MATERIAL_SYMBOLS[mat]}
          </Typography>
          <Typography variant="hud-data" sx={{ color: amountColor }}>
            {held} / {required}
          </Typography>
        </Box>
      )
    })}
  </Stack>
)

const CardFooter = ({
  status,
  canStart,
  onStart,
  progress
}: {
  status: ResearchStatus
  canStart: boolean
  onStart: () => void
  progress: number
}) => {
  if (status === 'researched') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'hud.success' }}>
        <CheckCircleIcon fontSize="inherit" />
        <Typography variant="hud-data" sx={{ color: 'inherit' }}>
          Researched
        </Typography>
      </Box>
    )
  }
  if (status === 'in-progress') {
    return <ProgressIndicator progress={progress} />
  }
  if (status === 'locked') {
    return (
      <Typography variant="hud-data" sx={{ color: 'hud.textFaint', textAlign: 'center' }}>
        Locked
      </Typography>
    )
  }
  return (
    <HudButton variant="primary" disabled={!canStart} onClick={onStart}>
      Research
    </HudButton>
  )
}

const ProgressIndicator = ({ progress }: { progress: number }) => (
  <Box>
    <Box sx={{ height: 4, bgcolor: 'rgba(65,70,73,0.2)', mb: 0.5, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: 0, width: `${progress * 100}%`, bgcolor: 'primary.main' }} />
    </Box>
    <Typography variant="hud-data" sx={{ color: 'hud.textMuted', textAlign: 'center' }}>
      Researching… {Math.round(progress * 100)}%
    </Typography>
  </Box>
)
