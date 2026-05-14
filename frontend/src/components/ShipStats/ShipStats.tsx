import { Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { HudCard } from 'components/HudCard/HudCard'
import { ProgressBar } from 'components/ProgressBar/ProgressBar'
import { STAT_LABELS, TYPE_LABELS } from 'data'
import { MATERIAL_NAMES, MATERIAL_STORAGE_COST, MATERIAL_SYMBOLS } from 'data/materials'
import { RARITY_COLORS } from 'data/rarity'
import type { Spacecraft } from 'models'
import { forwardRef } from 'react'
import { MATERIAL_RARITY } from 'utils/asteroid-generator'

interface ShipStatsProps {
  visible: boolean
  spacecraft?: Spacecraft
}

const ArcGauge = ({ value, label, color }: { value: number; label: string; color: string }) => {
  const radius = 48
  const stroke = 7
  const circumference = Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', width: 108, height: 64 }}>
        <svg
          width="108"
          height="64"
          viewBox="0 0 108 64"
          role="img"
          aria-label={`${label}: ${value}%`}
          style={{ overflow: 'visible' }}
        >
          <path
            d={`M ${6} ${58} A ${radius} ${radius} 0 0 1 ${102} ${58}`}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${6} ${58} A ${radius} ${radius} 0 0 1 ${102} ${58}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <Typography
          variant="hud-data-xl"
          sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
        >
          {value}
        </Typography>
      </Box>
      <Typography variant="hud-tag">{label}</Typography>
    </Stack>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="hud-tag" sx={{ width: 100, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="hud-data">{value}</Typography>
  </Stack>
)

export const ShipStats = forwardRef<HTMLDivElement, ShipStatsProps>(({ visible, spacecraft }, ref) => {
  if (!spacecraft) return null

  const cargoUsed = spacecraft.cargo.reduce((sum, item) => sum + item.amount * MATERIAL_STORAGE_COST[item.material], 0)
  const cargoPercent = Math.round((cargoUsed / spacecraft.cargoCapacity) * 100)

  return (
    <HudCard ref={ref} visible={visible} size="large">
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="hud-title">{spacecraft.name}</Typography>
            <Typography variant="hud-body" sx={{ color: 'hud.muted', letterSpacing: 0.5 }}>
              {TYPE_LABELS[spacecraft.type]} · {spacecraft.spacecraftRegistry.toUpperCase()} · {spacecraft.manufactured}
            </Typography>
          </Box>
          <HudButton id="exit-details-btn">Exit</HudButton>
        </Box>
        <Stack direction="row" sx={{ justifyContent: 'center', gap: 6, py: 1.5 }}>
          <ArcGauge value={spacecraft.fuel} label="FUEL" color="#1976d2" />
          <ArcGauge
            value={spacecraft.condition}
            label="CONDITION"
            color={spacecraft.condition > 50 ? '#2e7d32' : '#d32f2f'}
          />
        </Stack>
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', pt: 2 }}>
          <Stack spacing={1}>
            {STAT_LABELS.map(({ key, label }) => (
              <Stack key={key} direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                <Typography variant="hud-tag" sx={{ width: 100, lineHeight: 1.6, flexShrink: 0 }}>
                  {label}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <ProgressBar value={spacecraft.baseStats[key]} />
                </Box>
                <Typography variant="hud-data" sx={{ width: 24, textAlign: 'right' }}>
                  {spacecraft.baseStats[key]}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', pt: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="hud-tag">FUEL</Typography>
              <Typography variant="hud-data">
                {spacecraft.fuel} / {spacecraft.maxFuel}
              </Typography>
            </Stack>
            <ProgressBar
              value={Math.round((spacecraft.fuel / spacecraft.maxFuel) * 100)}
              color={
                spacecraft.fuel / spacecraft.maxFuel > 0.5
                  ? 'primary'
                  : spacecraft.fuel / spacecraft.maxFuel > 0.2
                    ? 'warning'
                    : 'error'
              }
            />
          </Stack>
        </Box>
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', pt: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="hud-tag">CARGO HOLD</Typography>
              <Typography variant="hud-data">
                {cargoUsed} / {spacecraft.cargoCapacity}
              </Typography>
            </Stack>
            <ProgressBar
              value={cargoPercent}
              color={cargoPercent > 90 ? 'error' : cargoPercent > 70 ? 'warning' : 'primary'}
            />
            {spacecraft.cargo.length > 0 && (
              <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                {spacecraft.cargo.map((item) => {
                  const rarity = MATERIAL_RARITY[item.material]
                  const color = RARITY_COLORS[rarity]
                  const storageCost = item.amount * MATERIAL_STORAGE_COST[item.material]
                  return (
                    <Stack key={item.material} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      <Typography variant="hud-data" sx={{ color, width: 28, flexShrink: 0 }}>
                        {MATERIAL_SYMBOLS[item.material]}
                      </Typography>
                      <Typography variant="hud-body" sx={{ flex: 1 }}>
                        {MATERIAL_NAMES[item.material]}
                      </Typography>
                      <Typography variant="hud-data" sx={{ color: 'hud.muted' }}>
                        ×{item.amount}
                      </Typography>
                      <Typography variant="hud-data" sx={{ color: 'hud.faint', width: 32, textAlign: 'right' }}>
                        {storageCost}u
                      </Typography>
                    </Stack>
                  )
                })}
              </Stack>
            )}
            {spacecraft.cargo.length === 0 && (
              <Typography variant="hud-body" sx={{ color: 'hud.faint', fontStyle: 'italic', pt: 0.5 }}>
                Empty
              </Typography>
            )}
          </Stack>
        </Box>
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', pt: 2 }}>
          <Stack spacing={0.5}>
            <InfoRow label="Manufacturer" value={spacecraft.manufacturer} />
            <InfoRow label="Height" value={`${spacecraft.height} m`} />
            <InfoRow label="Length" value={`${spacecraft.length} m`} />
            <InfoRow label="Price" value={`${spacecraft.price.toLocaleString()} cr`} />
          </Stack>
        </Box>
      </Stack>
    </HudCard>
  )
})
