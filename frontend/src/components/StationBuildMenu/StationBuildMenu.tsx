import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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
  SECTION_NAMES,
  SECTION_ORDER
} from 'models/station-section'
import type { SectionStatus, SectionType, StationSection } from 'models/station-section'

const COLORS = {
  operational: '#5a9e6f',
  reqMet: '#2e7d32',
  reqUnmet: '#c62828',
  text: '#111',
  textTitle: '#222',
  textMuted: '#888',
  textLocked: '#bbb',
  cardBg: '#fff',
  overlayBg: 'rgba(255, 255, 255, 0.55)',
  cardShadow: '0 2px 12px rgba(0,0,0,0.12)',
  cardShadowHover: '0 8px 28px rgba(0,0,0,0.18)'
} as const

const BLUEPRINT_IMAGE = '/images/materials/blueprint.jpg'

const STATUS_LABEL: Record<SectionStatus, string> = {
  operational: '● Online',
  available: '○ Available',
  locked: '○ Locked'
}

const heldAmount = (storage: CargoItem[], material: AsteroidMaterial): number =>
  storage.find((s) => s.material === material)?.amount ?? 0

const canAfford = (costs: Partial<Record<AsteroidMaterial, number>>, storage: CargoItem[]): boolean =>
  Object.entries(costs).every(([m, n]) => heldAmount(storage, m as AsteroidMaterial) >= n)

interface ReqRowProps {
  met: boolean
  label: string
  image: string
}

const ReqRow = ({ met, label, image }: ReqRowProps) => {
  const Icon = met ? CheckCircleIcon : CancelOutlinedIcon
  const color = met ? COLORS.reqMet : COLORS.reqUnmet
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={image}
        alt=""
        sx={{
          width: 28,
          height: 28,
          objectFit: 'contain',
          borderRadius: '6px',
          flexShrink: 0,
          filter: met ? 'none' : 'grayscale(0.6) brightness(0.8)'
        }}
      />
      <Typography sx={{ color: COLORS.text, fontSize: 12, lineHeight: 1.4, flex: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Icon sx={{ fontSize: 18, color, flexShrink: 0 }} />
    </Box>
  )
}

interface LockedOverlayProps {
  blueprint: SectionType | null
}

const LockedOverlay = ({ blueprint }: LockedOverlayProps) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      backgroundColor: COLORS.overlayBg,
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      px: 3
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: '#000'
      }}
    >
      Blueprint Required
    </Typography>
    {blueprint && (
      <Typography sx={{ fontSize: 14, color: '#000', textAlign: 'center', lineHeight: 1.6, fontWeight: 500 }}>
        Build the{' '}
        <Box component="span" sx={{ color: '#000', fontWeight: 700 }}>
          {SECTION_NAMES[blueprint]}
        </Box>
        {' '}to unlock this module
      </Typography>
    )}
  </Box>
)

interface SectionCardProps {
  type: SectionType
  status: SectionStatus
  blueprintMet: boolean
  storage: CargoItem[]
  isPending: boolean
  onBuild: (type: SectionType) => void
}

const SectionCard = ({ type, status, blueprintMet, storage, isPending, onBuild }: SectionCardProps) => {
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
          component="img"
          src={SECTION_IMAGES[type]}
          alt={SECTION_NAMES[type]}
          sx={{
            width: '100%',
            height: 260,
            objectFit: 'cover',
            display: 'block',
            borderRadius: '20px 20px 0 0'
          }}
        />

        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="hud-title" sx={{ color: COLORS.textTitle, lineHeight: 1.2 }}>
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

          <Typography variant="caption" sx={{ color: COLORS.text, lineHeight: 1.6, display: 'block', fontSize: 13 }}>
            {SECTION_DESCRIPTIONS[type]}
          </Typography>

          {isOperational ? (
            <Typography
              variant="caption"
              sx={{ color: COLORS.operational, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, mt: 'auto' }}
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

interface Props {
  sections: StationSection[]
  storage: CargoItem[]
  onBuild: (type: SectionType) => void
  isPending: boolean
}

export const StationBuildMenu = ({ sections, storage, onBuild, isPending }: Props) => {
  const sectionMap = new Map(sections.map((s) => [s.type, s]))

  return (
    <Box sx={{ minWidth: 720 }}>
      <Typography variant="hud-tag" sx={{ color: '#999', mb: 2.5, letterSpacing: 2, display: 'block' }}>
        Station Modules
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {SECTION_ORDER.map((type) => {
          const status = sectionMap.get(type)?.status ?? 'locked'
          const blueprintReq = SECTION_BLUEPRINT[type]
          const blueprintMet = !blueprintReq || sectionMap.get(blueprintReq)?.status === 'operational'

          return (
            <SectionCard
              key={type}
              type={type}
              status={status}
              blueprintMet={blueprintMet}
              storage={storage}
              isPending={isPending}
              onBuild={onBuild}
            />
          )
        })}
      </Box>
    </Box>
  )
}
