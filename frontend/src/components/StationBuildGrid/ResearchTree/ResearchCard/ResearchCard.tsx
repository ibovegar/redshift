import ImageIcon from '@mui/icons-material/Image'
import { Box, LinearProgress, Typography } from '@mui/material'
import type { Blueprint, BlueprintCategory, ResearchTask } from 'models/blueprint'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES } from 'models/station-section'
import { useEffect, useState } from 'react'
import { hudColors } from 'ui/theme/typography'
import { getResearchProgress, type ResearchStatus } from '../../utils'

export const CARD_WIDTH = 80
export const CARD_HEIGHT = 80
const STATUS_INDICATOR_SIZE = 14

// 45° zebra stripes overlaid on cards that haven't been researched yet. Sits above the dimmed
// thumbnail but under the status corner, so the "not yet built" hatching is clearly visible.
const UNRESEARCHED_STRIPES =
  'repeating-linear-gradient(45deg, rgba(140, 175, 210, 0.18) 0, rgba(140, 175, 210, 0.18) 4px, transparent 4px, transparent 10px)'

// Per-category color retained for the connecting lines / external references; cards themselves
// no longer carry a category fill — the EVE-style status corner is the only color signal on a card.
export const CATEGORY_COLORS: Record<BlueprintCategory, { base: string; active: string }> = {
  module: { base: '#6f8aa6', active: '#4d6982' },
  ship: { base: '#b08658', active: '#85633e' },
  'ship-addon': { base: '#6fa07a', active: '#4f7a59' }
}

// EVE-style status corner colors — small triangle in the top-left of each tile. Mirrors the
// modal status badge palette through the same theme tokens.
const STATUS_INDICATOR_COLORS: Record<ResearchStatus, string | null> = {
  researched: hudColors.statusResearched,
  'in-progress': hudColors.statusInProgress,
  queued: hudColors.statusQueued,
  available: hudColors.statusAvailable,
  locked: hudColors.statusLocked
}

export const getBlueprintImage = (bp: Blueprint): string | null => {
  if (bp.category === 'module') return SECTION_IMAGES[bp.targetId as SectionType] ?? null
  // Ships use `public/images/spacecraft_lg/<targetId>.png`. The targetId is intentionally kept
  // in sync with the image filename in `models/blueprint.ts`.
  if (bp.category === 'ship') return `/images/spacecraft_lg/${bp.targetId}.png`
  // Ship-addon targetIds are `<addonType>-<shipTargetId>` (e.g. `engine-tellrx5`); the matching
  // image filename is `<shipTargetId>_<addonType>.png` (e.g. `tellrx5_engine.png`).
  if (bp.category === 'ship-addon') {
    const dash = bp.targetId.indexOf('-')
    if (dash === -1) return null
    const type = bp.targetId.slice(0, dash)
    const shipTargetId = bp.targetId.slice(dash + 1)
    return `/images/upgrade_lg/${shipTargetId}_${type}.png`
  }
  return null
}

interface Props {
  blueprint: Blueprint
  status: ResearchStatus
  /** When the blueprint is available but the player can't pay the cost, a small "INSUFFICIENT"
   *  badge surfaces the gating reason directly on the card (the BlueprintDetail modal echoes the
   *  same hint next to the disabled Start Research button). */
  affordable?: boolean
  /** When provided, the card renders a thin progress bar at the bottom edge if this task targets
   *  the same blueprint as `blueprint.id`. Pulled from the same `researchInProgress` value that
   *  the InfoPanel uses, so the tree and the side panel stay in sync. */
  task?: ResearchTask | null
  onClick: (element: HTMLElement) => void
}

export const ResearchCard = ({ blueprint, status, affordable = true, task, onClick }: Props) => {
  const isResearched = status === 'researched'
  const image = getBlueprintImage(blueprint)
  const isInProgress = status === 'in-progress' && !!task && task.blueprintId === blueprint.id
  // Both active and pending-queued items wear the yellow "queued" overlay — the active one also
  // shows the progress bar underneath it.
  const isQueued = status === 'in-progress' || status === 'queued'
  const showInsufficient = status === 'available' && !affordable
  useCardProgressTick(isInProgress)
  const progress = isInProgress && task ? getResearchProgress(task) : 0

  return (
    <Box
      onClick={(e) => {
        // Stop the click from bubbling up to ReactFlow's `onNodeClick`. Otherwise the same click
        // would fire `handleCardClick` twice — once for THIS specific blueprint (from here), and
        // once for the parent ReactFlow node's blueprint (which for an addon inside ShipGroupNode
        // would mistakenly try to research the SHIP instead of the addon).
        e.stopPropagation()
        onClick(e.currentTarget as HTMLElement)
      }}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <CardThumbnail image={image} dim={!isResearched} />
      {!isResearched && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: UNRESEARCHED_STRIPES,
            pointerEvents: 'none'
          }}
        />
      )}
      {isQueued && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'hud.overlayQueued',
            pointerEvents: 'none'
          }}
        />
      )}
      {status === 'queued' && (
        <Typography
          variant="hud-badge"
          sx={{
            position: 'absolute',
            top: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'hud.statusQueued',
            letterSpacing: 1,
            textTransform: 'uppercase',
            pointerEvents: 'none'
          }}
        >
          Queued
        </Typography>
      )}
      {showInsufficient && (
        <Typography
          variant="hud-badge"
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'hud.error',
            letterSpacing: 1,
            textTransform: 'uppercase',
            pointerEvents: 'none'
          }}
        >
          Insufficient
        </Typography>
      )}
      <StatusCorner status={status} />
      {isInProgress && (
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: 0,
            backgroundColor: 'hud.overlayBlack',
            pointerEvents: 'none',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'hud.progressBar',
              transition: 'transform 0.2s linear'
            }
          }}
        />
      )}
    </Box>
  )
}

// Re-render at 200ms cadence while the card has an active task so the bar moves smoothly off
// `getResearchProgress`. Only one card is in-progress at a time, so the tick cost is negligible.
const useCardProgressTick = (active: boolean) => {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((n) => n + 1), 200)
    return () => clearInterval(id)
  }, [active])
}

const CardThumbnail = ({ image, dim }: { image: string | null; dim: boolean }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: dim ? 0.35 : 1
    }}
  >
    {image ? (
      <Box component="img" src={image} alt="" sx={{ width: '85%', height: '85%', objectFit: 'contain' }} />
    ) : (
      <ImageIcon sx={{ fontSize: 36, color: 'rgba(200,220,240,0.45)' }} />
    )}
  </Box>
)

const StatusCorner = ({ status }: { status: ResearchStatus }) => {
  const color = STATUS_INDICATOR_COLORS[status]
  if (!color) return null
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderTop: `${STATUS_INDICATOR_SIZE}px solid ${color}`,
        borderRight: `${STATUS_INDICATOR_SIZE}px solid transparent`,
        pointerEvents: 'none'
      }}
    />
  )
}
