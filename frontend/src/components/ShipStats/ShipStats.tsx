import { keyframes } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { STAT_LABELS, TYPE_LABELS } from 'data'
import { MATERIAL_ICONS, MATERIAL_NAMES, MATERIAL_STORAGE_COST } from 'data/materials'
import { RARITY_COLORS } from 'data/rarity'
import type { Spacecraft } from 'models'
import { forwardRef } from 'react'
import { MATERIAL_RARITY } from 'utils/asteroid-generator'

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
`

const ACCENT = '#42a5f5'
const PANEL_BG = '#040b18'
const PANEL_BORDER = 'rgba(33,150,243,0.35)'
const CRITICAL_BG = '#0d2d6b'
const CORNER = 10
const COL_WIDTH = 300

const STATUS_COLORS: Record<string, string> = {
  docked: '#81c784',
  deployed: '#64b5f6',
  'in-transit': '#ffb74d',
}
const STATUS_LABELS: Record<string, string> = {
  docked: 'DOCKED',
  deployed: 'DEPLOYED',
  'in-transit': 'IN TRANSIT',
}

const UPGRADE_SLOTS = ['Engine', 'Plating', 'Deflector', 'Weapons', 'Stabilizer']

interface ShipStatsProps {
  visible: boolean
  spacecraft?: Spacecraft
}

const SciFiPanel = ({
  title,
  children,
  accent = false,
}: {
  title: string
  children: React.ReactNode
  accent?: boolean
}) => (
  <Box
    sx={{
      position: 'relative',
      width: COL_WIDTH,
      bgcolor: accent ? CRITICAL_BG : PANEL_BG,
      p: 6,
      boxShadow: accent
        ? `0 0 32px rgba(33,150,243,0.45), inset 0 0 24px rgba(33,150,243,0.06)`
        : `0 0 14px rgba(33,150,243,0.1)`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -1,
        left: -1,
        width: CORNER,
        height: CORNER,
        borderTop: `2px solid ${ACCENT}`,
        borderLeft: `2px solid ${ACCENT}`,
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: CORNER,
        height: CORNER,
        borderBottom: `2px solid ${ACCENT}`,
        borderRight: `2px solid ${ACCENT}`,
        pointerEvents: 'none',
      },
    }}
  >
    <Box
      sx={{
        pb: 1,
        mb: 1.5,
        borderBottom: `1px solid ${accent ? 'rgba(255,255,255,0.15)' : PANEL_BORDER}`,
      }}
    >
      <Typography
        variant="hud-tag"
        sx={{ color: accent ? 'rgba(255,255,255,0.55)' : ACCENT, fontFamily: 'monospace' }}
      >
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="hud-tag" sx={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
    {children}
  </Typography>
)

const Value = ({ children, sx }: { children: React.ReactNode; sx?: object }) => (
  <Typography variant="hud-data" sx={{ color: '#fff', fontWeight: 700, ...sx }}>
    {children}
  </Typography>
)

const DarkBar = ({ value, color = '#1e88e5' }: { value: number; color?: string }) => (
  <Box sx={{ position: 'relative', height: 3, bgcolor: 'rgba(255,255,255,0.08)', width: '100%' }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${Math.min(100, Math.max(0, value))}%`,
        bgcolor: color,
        boxShadow: `0 0 6px ${color}80`,
        transition: 'width 0.3s ease',
      }}
    />
  </Box>
)

const StatusDot = ({ color }: { color: string }) => (
  <Box
    sx={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      bgcolor: color,
      boxShadow: `0 0 6px ${color}`,
      flexShrink: 0,
      animation: `${pulse} 2s ease-in-out infinite`,
    }}
  />
)

const ArcGauge = ({ value, label, color }: { value: number; label: string; color: string }) => {
  const radius = 42
  const stroke = 6
  const circumference = Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', width: 96, height: 58 }}>
        <svg width="96" height="58" viewBox="0 0 96 58" style={{ overflow: 'visible' }}>
          <path
            d={`M 6 54 A ${radius} ${radius} 0 0 1 90 54`}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M 6 54 A ${radius} ${radius} 0 0 1 90 54`}
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
          sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', color: '#fff' }}
        >
          {value}
        </Typography>
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        <StatusDot color={color} />
        <Label>{label}</Label>
      </Stack>
    </Stack>
  )
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
