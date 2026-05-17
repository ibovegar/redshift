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
import { BLUEPRINT_IMAGE, STATUS_LABEL, canAfford, heldAmount } from '../constants'
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

const CLIP = 'polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
const CLIP_INNER = 'polygon(0 0, 100% 0, 100% 100%, 19px 100%, 0 calc(100% - 19px))'

const STATUS_DOT: Record<SectionStatus, string> = {
  operational: '#66bb6a',
  available: '#42a5f5',
  locked: '#555'
}

export const SectionCard = ({ type, status, blueprintMet, storage, isPending, onBuild }: SectionCardProps) => {
  const isLocked = status === 'locked'
  const isOperational = status === 'operational'
  const isAvailable = status === 'available'
  const costs = SECTION_COSTS[type]
  const blueprint = SECTION_BLUEPRINT[type]
  const affordable = canAfford(costs, storage)
  const interactive = !isLocked && !isOperational

  return (
    <Box
      sx={{
        clipPath: CLIP,
        bgcolor: isLocked ? 'rgba(33,150,243,0.1)' : 'rgba(33,150,243,0.35)',
        p: '1px',
        transition: 'bgcolor 0.2s',
        cursor: interactive ? 'pointer' : 'default',
        '&:hover': interactive ? { bgcolor: 'rgba(33,150,243,0.65)' } : undefined
      }}
    >
      <Box
        sx={{
          clipPath: CLIP_INNER,
          bgcolor: '#040b18',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%'
        }}
      >
        {/* Top-left corner accent */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, width: 12, height: 12,
          borderTop: '2px solid #42a5f5', borderLeft: '2px solid #42a5f5',
          zIndex: 2, pointerEvents: 'none'
        }} />
        {/* Top-right corner accent */}
        <Box sx={{
          position: 'absolute', top: 0, right: 0, width: 12, height: 12,
          borderTop: '2px solid #42a5f5', borderRight: '2px solid #42a5f5',
          zIndex: 2, pointerEvents: 'none'
        }} />
        {/* Bottom-right corner accent */}
        <Box sx={{
          position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
          borderBottom: '2px solid #42a5f5', borderRight: '2px solid #42a5f5',
          zIndex: 2, pointerEvents: 'none'
        }} />

        {/* Blue header bar */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1a3fad, #0d2d7a)',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid rgba(66,165,245,0.25)',
          flexShrink: 0
        }}>
          <Typography
            variant="hud-label"
            sx={{ color: '#fff', fontFamily: 'monospace', letterSpacing: 2, fontSize: 11 }}
          >
            {SECTION_NAMES[type]}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%',
              bgcolor: STATUS_DOT[status],
              boxShadow: `0 0 5px ${STATUS_DOT[status]}`
            }} />
            <Typography variant="hud-tag" sx={{ color: STATUS_DOT[status], fontSize: 9, letterSpacing: 1 }}>
              {STATUS_LABEL[status]}
            </Typography>
          </Box>
        </Box>

        {/* Module image */}
        <Box sx={{ height: 100, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <Box
            component="img"
            src={SECTION_IMAGES[type]}
            alt={SECTION_NAMES[type]}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: 'scale(1.2)',
              transformOrigin: 'center',
              filter: isLocked ? 'grayscale(0.8) brightness(0.4)' : 'brightness(0.75)'
            }}
          />
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
            background: 'linear-gradient(transparent, #040b18)',
            pointerEvents: 'none'
          }} />
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="hud-body" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, lineHeight: 1.5 }}>
            {SECTION_DESCRIPTIONS[type]}
          </Typography>

          {isOperational ? (
            <Typography
              variant="hud-tag"
              sx={{ color: '#66bb6a', mt: 'auto', fontFamily: 'monospace', letterSpacing: 1, fontSize: 10 }}
            >
              ● MODULE ACTIVE
            </Typography>
          ) : (
            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
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
                    label={`${MATERIAL_SYMBOLS[mat]}  ${held} / ${amount}`}
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

        {isLocked && <LockedOverlay blueprint={blueprint} />}
      </Box>
    </Box>
  )
}
