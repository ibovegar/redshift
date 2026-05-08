import { Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { HudCard } from 'components/HudCard/HudCard'
import { ProgressBar } from 'components/ProgressBar/ProgressBar'
import { MATERIAL_ICONS, MATERIAL_NAMES, RARITY_COLORS, RARITY_LABELS } from 'data'
import type { Asteroid, AsteroidMaterial, ResourceRarity } from 'models/asteroid'
import { forwardRef } from 'react'

export interface ScanResultProps {
  visible: boolean
  asteroid: Asteroid | null
  revealed: boolean
  progress: number
  onMiningStart?: () => void
}

export const ScanResult = forwardRef<HTMLDivElement, ScanResultProps>(
  ({ visible, asteroid, revealed, progress, onMiningStart }, ref) => {
    return (
      <Box ref={ref}>
        <HudCard visible={visible} interactive={visible && revealed} size="medium">
          {asteroid && (
            <Stack spacing={0}>
              <Typography variant="body2" sx={{ fontSize: 15, letterSpacing: 1, mb: 1, fontWeight: 'bold' }}>
                {asteroid.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontSize: 11, color: 'rgba(0,0,0,0.6)', mb: 2.5, letterSpacing: 0.5 }}
              >
                Class {asteroid.stats.class} · {asteroid.stats.mass.toFixed(0)} Mt · {asteroid.stats.density.toFixed(0)}{' '}
                kg/m³
              </Typography>
              <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                {renderDeposits(asteroid, revealed, progress)}
              </Stack>
              {!revealed && (
                <Stack spacing={0.75} sx={{ mt: 1, alignItems: 'center' }}>
                  <Typography variant="overline" sx={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', letterSpacing: 1 }}>
                    SCANNING...
                  </Typography>
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
    const rarityColor = RARITY_COLORS[d.rarity as ResourceRarity] ?? '#aaa'
    const animating = isRevealed && !revealed
    const overlayClass = animating ? 'scan-reveal' : !isRevealed ? 'scan-overlay' : undefined
    return (
      <Stack
        key={d.material}
        className={overlayClass}
        direction="row"
        sx={{
          alignItems: 'center',
          bgcolor: '#fff',
          p: '8px 10px 8px 4px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2px',
          gap: '20px'
        }}
      >
        <Box
          component="img"
          src={MATERIAL_ICONS[d.material as AsteroidMaterial]}
          alt={d.material}
          sx={{ width: 52, height: 'auto', flexShrink: 0 }}
        />
        <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 8, color: rarityColor, fontWeight: 'bold', letterSpacing: 0.5 }}>
            {RARITY_LABELS[d.rarity as ResourceRarity]}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#000', fontWeight: 'bold' }}>
            {MATERIAL_NAMES[d.material] ?? d.material}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'rgba(0,0,0,0.7)' }}>{(d.abundance * 100).toFixed(1)}%</Typography>
        </Stack>
      </Stack>
    )
  })
}
