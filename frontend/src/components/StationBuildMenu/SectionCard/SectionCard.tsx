import { Box, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_ICONS, MATERIAL_SYMBOLS } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import {
  SECTION_BLUEPRINT,
  SECTION_COSTS,
  SECTION_DESCRIPTIONS,
  SECTION_IMAGES,
  SECTION_NAMES
} from 'models/station-section'
import type { SectionStatus, SectionType } from 'models/station-section'
import { BLUEPRINT_IMAGE, COLORS, STATUS_LABEL, canAfford, heldAmount } from '../constants'
import { LockedOverlay } from '../LockedOverlay/LockedOverlay'
import { ReqRow } from '../ReqRow/ReqRow'

export interface SectionCardProps {
  type: SectionType
  status: SectionStatus
  blueprintMet: boolean
  storage: CargoItem[]
  isPending: boolean
  onBuild: (type: SectionType) => void
}

export const SectionCard = ({ type, status, blueprintMet, storage, isPending, onBuild }: SectionCardProps) => {
  const isLocked = status === 'locked'
  const isOperational = status === 'operational'
  const isAvailable = status === 'available'
  const costs = SECTION_COSTS[type]
  const blueprint = SECTION_BLUEPRINT[type]
  const affordable = canAfford(costs, storage)
  const interactive = !isLocked && !isOperational

  const statusColor = isOperational
    ? COLORS.operational
    : isAvailable
      ? COLORS.textMuted
      : COLORS.textLocked

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'box-shadow 0.18s, transform 0.18s',
        boxShadow: COLORS.cardShadow,
        '&:hover': interactive
          ? { boxShadow: COLORS.cardShadowHover, transform: 'translateY(-4px)' }
          : undefined
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          backgroundColor: COLORS.cardBg,
          filter: isLocked ? 'blur(3px)' : 'none',
          opacity: isLocked ? 0.55 : 1
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: 260,
            overflow: 'hidden',
            borderRadius: '20px 20px 0 0',
            flexShrink: 0
          }}
        >
          <Box
            component="img"
            src={SECTION_IMAGES[type]}
            alt={SECTION_NAMES[type]}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: 'scale(1.4)',
              transformOrigin: 'center'
            }}
          />
        </Box>

        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="hud-title" sx={{ color: COLORS.textTitle }}>
              {SECTION_NAMES[type]}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: statusColor,
                fontWeight: 700,
                ml: 1,
                flexShrink: 0
              }}
            >
              {STATUS_LABEL[status]}
            </Typography>
          </Box>

          <Typography variant="caption">
            {SECTION_DESCRIPTIONS[type]}
          </Typography>

          {isOperational ? (
            <Typography
              variant="caption"
              sx={{ color: COLORS.operational, fontWeight: 700, mt: 'auto' }}
            >
              Module active
            </Typography>
          ) : (
            <Box sx={{ mt: 'auto', pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {blueprint && (
                <ReqRow
                  met={blueprintMet}
                  label={`${SECTION_NAMES[blueprint]} Blueprint`}
                  image={BLUEPRINT_IMAGE}
                />
              )}

              {Object.entries(costs).map(([material, amount]) => {
                const mat = material as AsteroidMaterial
                const held = heldAmount(storage, mat)
                return (
                  <ReqRow
                    key={material}
                    met={held >= amount}
                    label={`${MATERIAL_SYMBOLS[mat]}  ${held} / ${amount} required`}
                    image={MATERIAL_ICONS[mat]}
                  />
                )
              })}

              {isAvailable && (
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <HudButton
                    variant="secondary"
                    disabled={!affordable || isPending}
                    onClick={() => onBuild(type)}
                  >
                    Build Module
                  </HudButton>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {isLocked && <LockedOverlay blueprint={blueprint} />}
    </Box>
  )
}
