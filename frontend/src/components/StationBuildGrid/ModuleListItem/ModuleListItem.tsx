import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Collapse, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_ICONS, MATERIAL_SYMBOLS } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import {
  SECTION_BLUEPRINT,
  SECTION_DESCRIPTIONS,
  SECTION_IMAGES,
  SECTION_NAMES,
} from 'models/station-section'
import type { SectionStatus, SectionType } from 'models/station-section'

interface ModuleListItemProps {
  type: SectionType
  status: SectionStatus
  selected: boolean
  affordable: boolean
  unavailable: boolean
  storage: CargoItem[]
  costs: Partial<Record<AsteroidMaterial, number>>
  isPending: boolean
  onSelect: () => void
  onBuild: (type: SectionType) => void
}

const heldAmount = (storage: CargoItem[], mat: AsteroidMaterial) =>
  storage.find((s) => s.material === mat)?.amount ?? 0

const STATUS_LABEL: Record<SectionStatus, string> = {
  operational: '● Online',
  available: '○ Available',
  locked: '○ Locked',
}

const STATUS_COLOR: Record<SectionStatus, string> = {
  operational: '#66bb6a',
  available: '#414649',
  locked: 'rgba(65,70,73,0.4)',
}

export const ModuleListItem = ({
  type, status, selected, affordable, unavailable, storage, costs, isPending, onSelect, onBuild
}: ModuleListItemProps) => {
  const isLocked = status === 'locked' && !unavailable
  const isOperational = status === 'operational'
  const isAvailable = status === 'available' && !unavailable
  const isDisabled = isAvailable && !affordable
  const blueprint = SECTION_BLUEPRINT[type]

  return (
    <Box sx={{
      position: 'relative',
      bgcolor: selected ? '#707D7E' : '#A4ABA9',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      transition: 'background-color 0.15s',
      overflow: 'hidden',
      '&:hover': isAvailable && !selected ? { bgcolor: '#909898' } : undefined,
    }}>
      {/* Header row — clickable */}
      <Box
        onClick={isAvailable ? onSelect : undefined}
        sx={{
          display: 'flex', alignItems: 'center', py: 2,
          cursor: isAvailable ? 'pointer' : 'default',
        }}
      >
        {/* Thumbnail */}
        <Box sx={{ width: 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', width: 52, height: 52, visibility: unavailable ? 'hidden' : 'visible' }}>
            <Box sx={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden' }}>
              <Box
                component="img"
                src={SECTION_IMAGES[type]}
                alt=""
                sx={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  filter: isLocked
                    ? 'blur(2px)'
                    : isOperational
                      ? 'brightness(0.9)'
                      : isDisabled
                        ? 'brightness(0.6) grayscale(1)'
                        : 'brightness(0.85) saturate(0.8)',
                  transform: isLocked ? 'scale(1.1)' : 'none',
                }}
              />
            </Box>
            {isOperational && (
              <Box sx={{
                position: 'absolute', bottom: 2, right: 2,
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: '#66bb6a', boxShadow: '0 0 6px #66bb6a',
              }} />
            )}
          </Box>
        </Box>

        {/* Text area */}
        <Box sx={{ flex: 1, px: 2, py: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{
            fontSize: 13, fontFamily: 'monospace', letterSpacing: 1,
            textTransform: 'uppercase',
            color: isLocked || isDisabled ? 'rgba(65,70,73,0.5)' : '#414649',
            lineHeight: 1.2,
            visibility: unavailable ? 'hidden' : 'visible',
          }}>
            {SECTION_NAMES[type]}
          </Typography>
          <Typography sx={{
            fontSize: 11,
            color: unavailable
              ? 'rgba(65,70,73,0.55)'
              : isDisabled
                ? 'rgba(65,70,73,0.5)'
                : STATUS_COLOR[status],
            fontFamily: 'monospace', mt: 0.75,
          }}>
            {unavailable ? '○ Unavailable' : isDisabled ? '○ Insufficient resources' : STATUS_LABEL[status]}
          </Typography>
        </Box>

        {isLocked && (
          <Box sx={{ pr: 2, display: 'flex', alignItems: 'center' }}>
            <LockOutlinedIcon sx={{ fontSize: 16, color: 'rgba(65,70,73,0.3)' }} />
          </Box>
        )}
      </Box>

      {/* Expanded panel */}
      <Collapse in={selected && isAvailable}>
        <Box sx={{ px: 2, pt: 2, pb: 2.5 }}>
          <Typography sx={{
            fontSize: 11, color: '#414649',
            lineHeight: 1.6, mb: 2,
          }}>
            {SECTION_DESCRIPTIONS[type]}
          </Typography>

          {blueprint && (
            <Typography sx={{
              fontSize: 9, color: 'rgba(65,70,73,0.6)',
              fontFamily: 'monospace', letterSpacing: 0.5, mb: 1.5,
            }}>
              REQUIRES: {SECTION_NAMES[blueprint]}
            </Typography>
          )}

          {Object.keys(costs).length > 0 && (
            <Stack spacing={1} sx={{ mb: 2.5 }}>
              {Object.entries(costs).map(([mat, required]) => {
                const held = heldAmount(storage, mat as AsteroidMaterial)
                const met = held >= required
                return (
                  <Box key={mat} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={MATERIAL_ICONS[mat as AsteroidMaterial]}
                      alt={mat}
                      sx={{
                        width: 20, height: 20, objectFit: 'contain', flexShrink: 0,
                        filter: met ? 'none' : 'grayscale(0.5) brightness(1.2)',
                      }}
                    />
                    <Typography sx={{
                      fontSize: 11, fontFamily: 'monospace', flex: 1,
                      color: 'rgba(65,70,73,0.6)',
                    }}>
                      {MATERIAL_SYMBOLS[mat as AsteroidMaterial]}
                    </Typography>
                    <Typography sx={{
                      fontSize: 11, fontFamily: 'monospace',
                      color: met ? '#66bb6a' : '#cc6655',
                    }}>
                      {held} / {required}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          )}

          <HudButton
            variant="secondary"
            disabled={!affordable || isPending}
            onClick={() => onBuild(type)}
          >
            Build Module
          </HudButton>
        </Box>
      </Collapse>

      {/* Unavailable striped overlay */}
      {unavailable && (
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 8px, rgba(65,70,73,0.18) 8px 16px)',
        }} />
      )}
    </Box>
  )
}
