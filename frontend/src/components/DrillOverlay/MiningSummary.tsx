import { Backdrop, Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { HudCard } from 'components/HudCard/HudCard'
import { ResourceRow } from 'components/ResourceRow/ResourceRow'
import { MATERIAL_STORAGE_COST } from 'data/materials'
import { MATERIAL_RARITY } from 'utils/asteroid-generator'
import type { CollectedResource } from './DrillOverlay'

interface MiningSummaryProps {
  collected: CollectedResource[]
  reason: 'completed' | 'timeout' | 'destroyed' | 'aborted'
  onContinue: () => void
}

const REASON_LABELS: Record<MiningSummaryProps['reason'], string> = {
  completed: 'EXTRACTION COMPLETE',
  timeout: 'TIME EXPIRED',
  destroyed: 'DRILL DESTROYED',
  aborted: 'EXTRACTION ABORTED'
}

const REASON_COLORS: Record<MiningSummaryProps['reason'], string> = {
  completed: '#4caf50',
  timeout: '#ff9800',
  destroyed: '#f44336',
  aborted: '#9e9e9e'
}

export function MiningSummary({ collected, reason, onContinue }: MiningSummaryProps) {
  const cargoItems = collected
    .map((item) => ({
      material: item.material,
      amount: Math.round(item.amount * 10),
      storageCost: Math.round(item.amount * 10) * MATERIAL_STORAGE_COST[item.material]
    }))
    .filter((item) => item.amount > 0)

  const totalStorage = cargoItems.reduce((sum, item) => sum + item.storageCost, 0)

  return (
    <Backdrop open sx={{ zIndex: 21, cursor: 'default', pointerEvents: 'auto' }}>
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <HudCard visible interactive size="large">
          <Stack spacing={4}>
            <Box>
              <Typography
                variant="overline"
                sx={{ fontSize: 11, letterSpacing: 2, color: REASON_COLORS[reason], lineHeight: 1 }}
              >
                {REASON_LABELS[reason]}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 20, letterSpacing: 2, fontWeight: 'bold', mt: 0.5 }}>
                Mining Summary
              </Typography>
            </Box>

            <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', pt: 4 }}>
              {cargoItems.length > 0 ? (
                <Stack spacing={6}>
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 11, letterSpacing: 1, color: 'rgba(0,0,0,0.5)', lineHeight: 1, mb: 6 }}
                  >
                    TRANSFERRED TO CARGO
                  </Typography>
                  <Stack spacing={3.5} sx={{ pt: 0.5 }}>
                    {cargoItems.map((item) => (
                      <ResourceRow
                        key={item.material}
                        material={item.material}
                        rarity={MATERIAL_RARITY[item.material]}
                        rightDetail={
                          <>
                            <span style={{ color: 'rgba(0,0,0,0.4)' }}>×{item.amount}</span> {item.storageCost}u
                          </>
                        }
                      />
                    ))}
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      pt: 3,
                      mt: 2.5,
                      pr: 3
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{ fontSize: 11, letterSpacing: 1, color: 'rgba(0,0,0,0.5)', lineHeight: 1 }}
                    >
                      TOTAL STORAGE
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', color: '#000' }}>
                      {totalStorage}u
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                  No resources extracted
                </Typography>
              )}
            </Box>
          </Stack>
        </HudCard>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <HudButton variant="secondary" onClick={onContinue}>
            Continue
          </HudButton>
        </Box>
      </Stack>
    </Backdrop>
  )
}
