import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, LinearProgress, Typography } from '@mui/material'
import { getBlueprint } from 'models/blueprint'
import type { QueueItem as QueueItemData } from 'models/queue'
import type { SectionType } from 'models/station-section'
import { SECTION_IMAGES, SECTION_NAMES } from 'models/station-section'
import { useEffect, useState } from 'react'

// Minimal task shape — start/complete ISO timestamps. Anything time-based with a known duration
// (research, ship build, hull repair, refuelling…) maps onto this.
export interface InProgressTask {
  startedAt: string
  completesAt: string
}

const computeProgress = (task: InProgressTask, now: number = Date.now()): number => {
  const start = Date.parse(task.startedAt)
  const end = Date.parse(task.completesAt)
  if (end <= start) return 1
  return Math.min(1, Math.max(0, (now - start) / (end - start)))
}

// Live 0–100 progress for a time-based task. Re-renders on a 200ms tick while a task is active
// (the value is wall-clock derived) — smooth enough without burning frames. Returns 0 when idle.
// Exported so any view (e.g. the in-cell BuildingCell progress bar) can render its own progress.
export const useTaskProgress = (task: InProgressTask | null): number => {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!task) return
    const id = setInterval(() => setTick((n) => n + 1), 200)
    return () => clearInterval(id)
  }, [task])
  return task ? Math.round(computeProgress(task) * 100) : 0
}

// Resolves a queue item to a display name + section image (when applicable). Module-blueprint
// research reuses its section image; ships/addons have no image here (their image lives in the
// research card view).
const resolveQueueItem = (item: QueueItemData): { name: string; image: string | null } => {
  if (item.kind === 'build') {
    const type = item.targetId as SectionType
    return { name: SECTION_NAMES[type], image: SECTION_IMAGES[type] }
  }
  const blueprint = getBlueprint(item.targetId)
  const image =
    blueprint && blueprint.category === 'module' ? (SECTION_IMAGES[blueprint.targetId as SectionType] ?? null) : null
  return { name: blueprint?.name ?? item.targetId, image }
}

interface Props {
  item: QueueItemData
  onCancel: (id: string) => void
  disableCancel?: boolean
}

// One row in the unified work queue. Active items render with a live progress bar; pending items
// read "Queued". Each row has a × cancel control that removes the item (and refunds its cost via
// the cancel mutation upstream).
export const QueueItem = ({ item, onCancel, disableCancel }: Props) => {
  const isActive = !!item.startedAt && !!item.completesAt
  const task = isActive ? { startedAt: item.startedAt as string, completesAt: item.completesAt as string } : null
  const pct = useTaskProgress(task)
  const { name, image } = resolveQueueItem(item)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {image && <Box component="img" src={image} alt="" sx={{ width: '85%', height: '85%', objectFit: 'contain' }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="hud-data"
          sx={{
            color: isActive ? 'hud.statusInProgress' : 'hud.textBrightSoft',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {name}
        </Typography>
        {isActive ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                flex: 1,
                height: 3,
                borderRadius: 0,
                backgroundColor: 'hud.overlayBlack',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'hud.progressBar',
                  transition: 'transform 0.2s linear'
                }
              }}
            />
            <Typography sx={{ fontFamily: 'monospace', fontSize: 10, color: 'hud.progressLabel' }}>{pct}%</Typography>
          </Box>
        ) : (
          <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightDim' }}>
            Queued
          </Typography>
        )}
      </Box>
      <IconButton
        onClick={() => onCancel(item.id)}
        disabled={disableCancel}
        size="small"
        sx={{ color: 'hud.textBrightSoft' }}
        aria-label={`Cancel ${name}`}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
