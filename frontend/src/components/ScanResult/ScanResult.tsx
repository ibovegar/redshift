import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { HudButton } from 'components/HudButton/HudButton'
import { HudCard } from 'components/HudCard/HudCard'
import { ProgressBar } from 'components/ProgressBar/ProgressBar'
import { ResourceRow } from 'components/ResourceRow/ResourceRow'
import type { Asteroid, AsteroidMaterial, ResourceRarity } from 'models/asteroid'
import { forwardRef } from 'react'

const revealSlide = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
`

const contentFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export interface ScanResultProps {
  visible: boolean
  asteroid: Asteroid | null
  revealed: boolean
  progress: number
  onMiningStart?: () => void
  onAbort?: () => void
}

export const ScanResult = forwardRef<HTMLDivElement, ScanResultProps>(
  ({ visible, asteroid, revealed, progress, onMiningStart, onAbort }, ref) => {
    return (
      <Box ref={ref}>
        <HudCard visible={visible} interactive={visible && revealed} size="medium">
          {asteroid && (
            <Stack spacing={0}>
              <Typography variant="hud-heading" sx={{ mb: 1 }}>
                {asteroid.name}
              </Typography>
              <Typography variant="hud-body" sx={{ color: 'hud.muted', letterSpacing: 0.5, mb: 2.5 }}>
                Class {asteroid.stats.class} · {asteroid.stats.mass.toFixed(0)} Mt · {asteroid.stats.density.toFixed(0)}{' '}
                kg/m³
              </Typography>
              <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                {renderDeposits(asteroid, revealed, progress)}
              </Stack>
              {!revealed && (
                <Stack spacing={0.75} sx={{ mt: 1, alignItems: 'center' }}>
                  <Typography variant="hud-tag">SCANNING...</Typography>
                  <ProgressBar value={(progress ?? 0) * 100} size="large" animated />
                </Stack>
              )}
            </Stack>
          )}
        </HudCard>
        {asteroid && revealed && onMiningStart && (
          <Box sx={{ mt: 1.5 }}>
            <HudButton variant="secondary" onClick={onMiningStart}>
              START MINING
            </HudButton>
          </Box>
        )}
        {asteroid && !revealed && onAbort && (
          <Box sx={{ mt: 1.5 }}>
            <HudButton variant="secondary" onClick={onAbort}>
              ABORT SCAN
            </HudButton>
          </Box>
        )}
      </Box>
    )
  }
)

function renderDeposits(asteroid: Asteroid, revealed: boolean, progress: number) {
  const deposits = asteroid.stats.deposits
  const total = deposits.length
  const thresholds = deposits.map((dep) => {
    let hash = 0
    for (let c = 0; c < dep.material.length; c++) {
      hash = (hash * 31 + dep.material.charCodeAt(c)) | 0
    }
    return (Math.abs(hash) % 1000) / 1000
  })
  const sorted = [...thresholds].sort((a, b) => a - b)
  const mappedThresholds = thresholds.map((t) => {
    const rank = sorted.indexOf(t)
    return 0.1 + (rank / Math.max(1, total - 1)) * 0.85
  })

  return deposits.map((d, i) => {
    const revealThreshold = mappedThresholds[i]
    const isRevealed = revealed || progress >= revealThreshold
    const animating = isRevealed && !revealed
    const overlaySx = animating
      ? {
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: '-1px',
            background: '#e0e0e0',
            borderRadius: '2px',
            animation: `${revealSlide} 0.2s ease-out forwards`,
            zIndex: 2
          },
          '& > *': {
            opacity: 0,
            animation: `${contentFadeIn} 0.15s ease-in 0.2s forwards`
          }
        }
      : !isRevealed
        ? {
            '&::before': {
              content: "''",
              position: 'absolute',
              inset: '-1px',
              background: '#e0e0e0',
              borderRadius: '2px',
              zIndex: 2
            },
            '&::after': {
              content: "'UNKNOWN'",
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              letterSpacing: '0.5px',
              color: 'rgba(0,0,0,0.35)',
              zIndex: 3
            },
            '& > *': { opacity: 0 }
          }
        : {}
    return (
      <ResourceRow
        key={d.material}
        material={d.material as AsteroidMaterial}
        rarity={d.rarity as ResourceRarity}
        detail={`${(d.abundance * 100).toFixed(1)}%`}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          ...overlaySx
        }}
      />
    )
  })
}
