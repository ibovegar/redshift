import { Box, Divider, LinearProgress, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { MATERIAL_ICONS, MATERIAL_NAMES, MATERIAL_SYMBOLS } from 'data/materials'
import { useEffect, useState } from 'react'
import type { AsteroidMaterial } from 'models/asteroid'
import { BLUEPRINTS, type Blueprint, getBlueprint, type ResearchTask } from 'models/blueprint'
import type { CargoItem } from 'models/spacecraft'
import type { SectionStatus, SectionType } from 'models/station-section'
import { SECTION_BLUEPRINT, SECTION_COSTS, SECTION_DESCRIPTIONS, SECTION_NAMES } from 'models/station-section'
import { getBlueprintImage } from '../ResearchTree/ResearchCard/ResearchCard'
import { SectionHeader } from '../SectionHeader'
import { canAfford, getResearchProgress, heldAmount } from '../utils'

const ALL_MATERIALS = Object.keys(MATERIAL_NAMES) as AsteroidMaterial[]

const STATUS_LABEL: Record<SectionStatus, string> = {
  operational: 'Operational',
  available: 'Available',
  locked: 'Locked'
}

// Status palette routed through theme tokens so the InfoPanel and the modal status badges
// stay consistent without per-file colour values.
const STATUS_COLOR: Record<SectionStatus, string> = {
  operational: 'hud.success',
  available: 'hud.statusAvailable',
  locked: 'hud.statusLocked'
}

const CONDITION_LABEL: Record<SectionStatus, string> = {
  operational: 'Nominal',
  available: 'Awaiting construction',
  locked: 'Offline'
}

interface Props {
  type: SectionType
  status: SectionStatus
  storage: CargoItem[]
  researchedBlueprints: string[]
  researchInProgress: ResearchTask | null
  isPending: boolean
  onBuild: () => void
}

export const InfoPanel = (props: Props) => {
  if (props.type === 'research') return <ResearchInfo {...props} />
  if (props.status === 'operational') return <OperationalModuleInfo {...props} />
  return <ModuleInfo {...props} />
}

// Dispatcher: each module type gets its own custom stat layout once it's operational. The
// description + status header is shared, the body below it is per-type.
const OperationalModuleInfo = (props: Props) => {
  const { type, status } = props
  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300 }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>
      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3 }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>
      <Divider sx={{ borderColor: 'hud.borderSubtle', mb: 2.5 }} />
      <Stack spacing={1.5}>
        <StatRow label="Status" value={STATUS_LABEL[status]} valueColor={STATUS_COLOR[status]} />
        <StatRow label="Condition" value={CONDITION_LABEL[status]} />
        {type === 'command' && <CommandStats {...props} />}
        {type === 'engineering' && <EngineeringStats {...props} />}
        {type === 'power' && <PowerStats />}
        {type === 'storage' && <StorageStats storage={props.storage} />}
      </Stack>
    </Box>
  )
}

const CommandStats = ({ researchedBlueprints }: Props) => {
  const operationalSections = 1 // synthetic: command is always online, others derived from sections
  return (
    <>
      <StatRow label="Online Modules" value={`${operationalSections} / 5`} />
      <StatRow label="Total Research" value={`${researchedBlueprints.length} / ${BLUEPRINTS.length}`} />
      <StatRow label="Crew" value="12" />
      <StatRow label="Fleet" value="3 docked" />
    </>
  )
}

const EngineeringStats = ({ researchedBlueprints }: Props) => {
  const shipBlueprintsUnlocked = BLUEPRINTS.filter(
    (bp) => bp.category === 'ship' && researchedBlueprints.includes(bp.id)
  ).length
  const totalShipBlueprints = BLUEPRINTS.filter((bp) => bp.category === 'ship').length
  const addonBlueprintsUnlocked = BLUEPRINTS.filter(
    (bp) => bp.category === 'ship-addon' && researchedBlueprints.includes(bp.id)
  ).length
  const totalAddonBlueprints = BLUEPRINTS.filter((bp) => bp.category === 'ship-addon').length
  return (
    <>
      <StatRow label="Ship Blueprints" value={`${shipBlueprintsUnlocked} / ${totalShipBlueprints}`} />
      <StatRow label="Upgrade Blueprints" value={`${addonBlueprintsUnlocked} / ${totalAddonBlueprints}`} />
      <StatRow label="Build Queue" value="Idle" valueColor="hud.textBrightDim" />
      <StatRow label="Ships Constructed" value="0" />
    </>
  )
}

const PowerStats = () => (
  <>
    <StatRow label="Output" value="250 MW" valueColor="hud.success" />
    <StatRow label="Consumption" value="180 MW" />
    <StatRow label="Surplus" value="+70 MW" valueColor="hud.success" />
    <StatRow label="Load" value="72 %" />
  </>
)

const StorageStats = ({ storage }: { storage: CargoItem[] }) => {
  const totalUnits = storage.reduce((sum, item) => sum + item.amount, 0)
  const capacity = 1000
  const pct = Math.min(100, Math.round((totalUnits / capacity) * 100))
  return (
    <>
      <StatRow label="Used" value={`${totalUnits} / ${capacity}`} />
      <StatRow label="Load" value={`${pct} %`} valueColor={pct > 90 ? 'hud.error' : 'common.white'} />
      <StatRow label="Material Types" value={`${storage.filter((s) => s.amount > 0).length}`} />
      <StatRow label="Reserved" value="0" valueColor="hud.textBrightDim" />
    </>
  )
}

const ModuleInfo = ({ type, status, storage, isPending, onBuild }: Props) => {
  const costs = SECTION_COSTS[type]
  const blueprint = SECTION_BLUEPRINT[type]
  const affordable = canAfford(costs, storage)
  const hasCosts = Object.keys(costs).length > 0

  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300 }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>

      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 2.5 }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>

      {blueprint && (
        <Typography variant="hud-data" sx={{ color: 'hud.textMuted', letterSpacing: 0.5, mb: 2 }}>
          REQUIRES: {SECTION_NAMES[blueprint]}
        </Typography>
      )}

      {hasCosts && (
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          {Object.entries(costs).map(([mat, required]) => {
            const material = mat as AsteroidMaterial
            const held = heldAmount(storage, material)
            const met = held >= (required ?? 0)
            return (
              <Box key={material} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="img"
                  src={MATERIAL_ICONS[material]}
                  alt={material}
                  sx={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    flexShrink: 0,
                    filter: met ? 'none' : 'grayscale(0.5) brightness(1.2)'
                  }}
                />
                <Typography variant="hud-data" sx={{ flex: 1, color: 'hud.textMuted' }}>
                  {MATERIAL_SYMBOLS[material]}
                </Typography>
                <Typography variant="hud-data" sx={{ color: met ? 'hud.success' : 'hud.error' }}>
                  {held} / {required}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      )}

      {status === 'available' && (
        <HudButton variant="secondary" disabled={!affordable || isPending} onClick={onBuild}>
          Build Module
        </HudButton>
      )}

      <Divider sx={{ my: 3, borderColor: 'hud.textBorder' }} />

      <SectionHeader>Resources</SectionHeader>

      <Stack spacing={0}>
        {ALL_MATERIALS.map((material) => {
          const amount = heldAmount(storage, material)
          const empty = amount === 0
          return (
            <Box key={material} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box
                component="img"
                src={MATERIAL_ICONS[material]}
                alt={material}
                sx={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="hud-data" sx={{ flex: 1, color: 'common.white' }}>
                {MATERIAL_NAMES[material]}
              </Typography>
              <Typography variant="hud-data" sx={{ color: empty ? 'hud.textBrightDim' : 'common.white' }}>
                {amount}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

const ResearchInfo = ({ type, status, researchedBlueprints, researchInProgress }: Props) => {
  const totalBlueprints = BLUEPRINTS.length
  const researchedCount = researchedBlueprints.length
  const inProgressBp = researchInProgress ? getBlueprint(researchInProgress.blueprintId) : null
  return (
    <Box sx={{ flex: '0 0 300px', maxWidth: 300 }}>
      <SectionHeader>{SECTION_NAMES[type]}</SectionHeader>

      <Typography variant="hud-body" sx={{ color: 'hud.textBright', lineHeight: 1.6, mb: 3 }}>
        {SECTION_DESCRIPTIONS[type]}
      </Typography>

      <Divider sx={{ borderColor: 'hud.borderSubtle', mb: 2.5 }} />

      <InProgressBlock task={researchInProgress} blueprint={inProgressBp} />

      <Divider sx={{ borderColor: 'hud.borderSubtle', my: 2.5 }} />

      <Stack spacing={1.5}>
        <StatRow label="Status" value={STATUS_LABEL[status]} valueColor={STATUS_COLOR[status]} />
        <StatRow label="Condition" value={CONDITION_LABEL[status]} />
        <StatRow label="Total Researched" value={`${researchedCount} / ${totalBlueprints}`} />
        <StatRow label="Queue Capacity" value="1 slot" valueColor="hud.textBrightSoft" />
      </Stack>
    </Box>
  )
}

// Tick state used to drive the progress bar — `getResearchProgress` is time-dependent so the
// component needs to re-render at a steady rate while a task is active. 200ms keeps the bar
// smooth without burning frames.
const useProgressTick = (active: boolean) => {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((n) => n + 1), 200)
    return () => clearInterval(id)
  }, [active])
}

const InProgressBlock = ({ task, blueprint }: { task: ResearchTask | null; blueprint: Blueprint | null | undefined }) => {
  useProgressTick(!!task)
  if (!task || !blueprint) {
    return (
      <Box>
        <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
          In Progress
        </Typography>
        <Typography variant="hud-data" sx={{ color: 'hud.textBrightDim', mt: 1 }}>
          Idle
        </Typography>
      </Box>
    )
  }
  const progress = getResearchProgress(task)
  const pct = Math.round(progress * 100)
  const image = getBlueprintImage(blueprint)
  return (
    <Box>
      <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
        In Progress
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            flexShrink: 0,
            bgcolor: 'hud.surface',
            border: '1px solid',
            borderColor: 'hud.borderSubtle',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {image && (
            <Box component="img" src={image} alt="" sx={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            variant="hud-data"
            sx={{
              color: 'hud.statusInProgress',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {blueprint.name}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 3,
              borderRadius: 0,
              backgroundColor: 'hud.overlayBlack',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'hud.progressBar',
                transition: 'transform 0.2s linear'
              }
            }}
          />
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: 'hud.progressLabel',
              alignSelf: 'flex-end'
            }}
          >
            {pct}%
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

const StatRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 2,
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'hud.borderFaint'
    }}
  >
    <Typography variant="hud-tag" sx={{ fontSize: 10, letterSpacing: 1, color: 'hud.textBrightSoft' }}>
      {label}
    </Typography>
    <Typography variant="hud-data" sx={{ color: valueColor ?? 'common.white', textAlign: 'right' }}>
      {value}
    </Typography>
  </Box>
)
