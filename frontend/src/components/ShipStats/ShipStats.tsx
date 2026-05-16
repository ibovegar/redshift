import { Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { STAT_LABELS, TYPE_LABELS } from 'data'
import { MATERIAL_ICONS, MATERIAL_NAMES, MATERIAL_STORAGE_COST } from 'data/materials'
import { RARITY_COLORS } from 'data/rarity'
import type { Spacecraft } from 'models'
import { forwardRef } from 'react'
import { MATERIAL_RARITY } from 'utils/asteroid-generator'
import { ArcGauge } from './ArcGauge/ArcGauge'
import { DarkBar } from './DarkBar/DarkBar'
import { Label } from './Label/Label'
import { SciFiPanel } from './SciFiPanel/SciFiPanel'
import { StatusDot } from './StatusDot/StatusDot'
import { Value } from './Value/Value'
import { ACCENT, COL_WIDTH, STATUS_COLORS, STATUS_LABELS, UPGRADE_SLOTS } from './constants'

interface ShipStatsProps {
  visible: boolean
  spacecraft?: Spacecraft
}

export const ShipStats = forwardRef<HTMLDivElement, ShipStatsProps>(({ spacecraft }, ref) => {
  if (!spacecraft) return null

  const cargoUsed = spacecraft.cargo.reduce(
    (sum, item) => sum + item.amount * MATERIAL_STORAGE_COST[item.material],
    0,
  )
  const cargoPercent = Math.round((cargoUsed / spacecraft.cargoCapacity) * 100)
  const fuelPercent = Math.round((spacecraft.fuel / spacecraft.maxFuel) * 100)
  const statusColor = STATUS_COLORS[spacecraft.status] ?? '#fff'
  const statusLabel = STATUS_LABELS[spacecraft.status] ?? spacecraft.status.toUpperCase()
  const upgradeCount = spacecraft.attachedUpgrades.length

  return (
    <Box
      ref={ref}
      sx={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {/* LEFT COLUMN */}
      <Stack
        spacing={2}
        sx={{
          position: 'absolute',
          right: 'calc(100% - var(--ship-x) + var(--ship-gap))',
          top: 'var(--ship-y)',
          transform: 'translateY(-50%)',
          width: COL_WIDTH,
        }}
      >
        <SciFiPanel title="VESSEL IDENTITY">
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="hud-title"
                sx={{ color: '#fff', fontFamily: 'monospace', lineHeight: 1.2 }}
              >
                {spacecraft.name}
              </Typography>
              <Typography
                variant="hud-label"
                sx={{ color: ACCENT, fontFamily: 'monospace', mt: 0.5, display: 'block' }}
              >
                {TYPE_LABELS[spacecraft.type]}
              </Typography>
            </Box>
            <Stack spacing={1.2}>
              {[
                { label: 'Registry', value: spacecraft.spacecraftRegistry.toUpperCase() },
                { label: 'Manufactured', value: String(spacecraft.manufactured) },
                { label: 'Manufacturer', value: spacecraft.manufacturer },
              ].map(({ label, value }) => (
                <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                  <Label>{label}</Label>
                  <Value>{value}</Value>
                </Stack>
              ))}
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>Status</Label>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                  <StatusDot color={statusColor} />
                  <Value sx={{ color: statusColor }}>{statusLabel}</Value>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </SciFiPanel>

        <SciFiPanel title="COMBAT PROFILE">
          <Stack spacing={1.5}>
            {STAT_LABELS.map(({ key, label }) => (
              <Stack key={key} spacing={0.6}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label>{label}</Label>
                  <Value>{spacecraft.baseStats[key]}</Value>
                </Stack>
                <DarkBar value={spacecraft.baseStats[key]} />
              </Stack>
            ))}
          </Stack>
        </SciFiPanel>

        <SciFiPanel title="UPGRADE SLOTS">
          <Stack spacing={1.2}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Label>Installed</Label>
              <Value>{upgradeCount} / {UPGRADE_SLOTS.length}</Value>
            </Stack>
            {UPGRADE_SLOTS.map((slot, i) => {
              const filled = i < upgradeCount
              return (
                <Stack key={slot} direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '2px',
                      bgcolor: filled ? ACCENT : 'transparent',
                      border: `1px solid ${filled ? ACCENT : 'rgba(255,255,255,0.2)'}`,
                      boxShadow: filled ? `0 0 6px ${ACCENT}80` : 'none',
                      flexShrink: 0,
                    }}
                  />
                  <Label>{slot.toUpperCase()}</Label>
                  <Box sx={{ flex: 1 }} />
                  <Typography
                    variant="hud-tag"
                    sx={{ color: filled ? ACCENT : 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
                  >
                    {filled ? 'ACTIVE' : '---'}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        </SciFiPanel>
      </Stack>

      {/* RIGHT COLUMN */}
      <Stack
        spacing={2}
        sx={{
          position: 'absolute',
          left: 'calc(var(--ship-x) + var(--ship-gap))',
          top: 'var(--ship-y)',
          transform: 'translateY(-50%)',
          width: COL_WIDTH,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pointerEvents: 'auto' }}>
          <HudButton id="exit-details-btn">Exit</HudButton>
        </Box>

        <SciFiPanel title="CRITICAL SYSTEMS" accent>
          <Stack spacing={2}>
            <Stack direction="row" sx={{ justifyContent: 'center', gap: 3 }}>
              <ArcGauge value={spacecraft.fuel} label="FUEL" color="#64b5f6" />
              <ArcGauge
                value={spacecraft.condition}
                label="CONDITION"
                color={spacecraft.condition > 50 ? '#81c784' : '#e57373'}
              />
            </Stack>
            <Stack spacing={0.6}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Label>Fuel Reserves</Label>
                <Value>{spacecraft.fuel} / {spacecraft.maxFuel}</Value>
              </Stack>
              <DarkBar
                value={fuelPercent}
                color={fuelPercent > 50 ? '#64b5f6' : fuelPercent > 20 ? '#ffb74d' : '#ef5350'}
              />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Label>Consumption</Label>
              <Value sx={{ color: 'rgba(255,255,255,0.6)' }}>{spacecraft.fuelConsumption} u/jump</Value>
            </Stack>
          </Stack>
        </SciFiPanel>

        <SciFiPanel title="CARGO MANIFEST">
          <Stack spacing={1.5}>
            <Stack spacing={0.6}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Label>Capacity</Label>
                <Value>{cargoUsed} / {spacecraft.cargoCapacity}</Value>
              </Stack>
              <DarkBar
                value={cargoPercent}
                color={cargoPercent > 90 ? '#ef5350' : cargoPercent > 70 ? '#ffb74d' : '#1e88e5'}
              />
            </Stack>
            {spacecraft.cargo.length > 0 ? (
              <Stack spacing={1}>
                {spacecraft.cargo.map((item) => {
                  const rarity = MATERIAL_RARITY[item.material]
                  const color = RARITY_COLORS[rarity]
                  const storageCost = item.amount * MATERIAL_STORAGE_COST[item.material]
                  return (
                    <Stack key={item.material} direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                      <Box
                        component="img"
                        src={MATERIAL_ICONS[item.material]}
                        alt={item.material}
                        loading="lazy"
                        sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                      />
                      <Typography
                        variant="hud-body"
                        sx={{ color: 'rgba(255,255,255,0.8)', flex: 1, fontWeight: 700 }}
                      >
                        {MATERIAL_NAMES[item.material]}
                      </Typography>
                      <Typography variant="hud-data" sx={{ color }}>
                        ×{item.amount}
                      </Typography>
                      <Typography
                        variant="hud-data"
                        sx={{ color: 'rgba(255,255,255,0.3)', width: 32, textAlign: 'right' }}
                      >
                        {storageCost}u
                      </Typography>
                    </Stack>
                  )
                })}
              </Stack>
            ) : (
              <Typography variant="hud-body" sx={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                No cargo
              </Typography>
            )}
          </Stack>
        </SciFiPanel>

        <SciFiPanel title="TECHNICAL SPECS">
          <Stack spacing={1.2}>
            {[
              { label: 'Height', value: `${spacecraft.height} m` },
              { label: 'Length', value: `${spacecraft.length} m` },
              { label: 'Price', value: `${spacecraft.price.toLocaleString()} cr` },
            ].map(({ label, value }) => (
              <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Label>{label}</Label>
                <Value>{value}</Value>
              </Stack>
            ))}
          </Stack>
        </SciFiPanel>
      </Stack>
    </Box>
  )
})
