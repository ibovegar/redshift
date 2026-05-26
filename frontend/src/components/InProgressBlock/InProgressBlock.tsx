import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { SectionHeader } from 'components/StationBuildGrid/SectionHeader'
import { type PropsWithChildren, useEffect, useState } from 'react'

// Minimal task shape — start/complete ISO timestamps. Anything time-based with a known
// duration (research, ship build, hull repair, refuelling…) maps onto this.
export interface InProgressTask {
  startedAt: string
  completesAt: string
}

interface Props {
  /** Active task, or null when nothing is running. The block renders an "Idle" state in that case. */
  task: InProgressTask | null
  /** Display name of what's being worked on (e.g. blueprint or ship name). Optional. */
  name?: string
  /** Optional thumbnail rendered in the left square. Falls back to an empty square if omitted. */
  image?: string | null
}

// Tick state used to drive the progress bar — the bar value is time-dependent so the component
// needs to re-render at a steady rate while a task is active. 200ms keeps the bar smooth
// without burning frames.
const useProgressTick = (active: boolean) => {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((n) => n + 1), 200)
    return () => clearInterval(id)
  }, [active])
}

const computeProgress = (task: InProgressTask, now: number = Date.now()): number => {
  const start = Date.parse(task.startedAt)
  const end = Date.parse(task.completesAt)
  if (end <= start) return 1
  return Math.min(1, Math.max(0, (now - start) / (end - start)))
}

const Container = ({ children }: PropsWithChildren) => (
  <Stack
    sx={{
      backgroundColor: 'hud.listRest',
      mt: 1,
      borderRadius: '2px',
      px: 3,
      pb: 2,
      pt: 3
    }}
  >
    <SectionHeader sx={{ mb: 1 }}>In Progress</SectionHeader>
    {children}
  </Stack>
)

export const InProgressBlock = ({ task, name, image }: Props) => {
  useProgressTick(!!task)
  if (!task) {
    return (
      <Container>
        <Typography variant="hud-data" sx={{ color: 'hud.textBrightDim' }}>
          Idle
        </Typography>
      </Container>
    )
  }
  const pct = Math.round(computeProgress(task) * 100)
  return (
    <Container>
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {image && (
            <Box component="img" src={image} alt="" sx={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {name && (
            <Typography
              variant="hud-data"
              sx={{
                color: 'hud.statusInProgress',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {name}
            </Typography>
          )}
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 3,
              borderRadius: 0,
              backgroundColor: 'hud.overlayBlack',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'hud.progressBar',
                transition: 'transform 0.2s linear'
              }
            }}
          />
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: 'hud.progressLabel',
              alignSelf: 'flex-end'
            }}
          >
            {pct}%
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
