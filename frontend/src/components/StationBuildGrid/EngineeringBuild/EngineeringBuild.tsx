import { Box, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'
import { BLUEPRINTS, type Blueprint } from 'models/blueprint'
import { getBlueprintImage } from '../ResearchTree/ResearchCard/ResearchCard'
import { SectionHeader } from '../SectionHeader'

interface Props {
  researchedBlueprints: string[]
}

export const EngineeringBuild = ({ researchedBlueprints }: Props) => {
  const researchedShips = BLUEPRINTS.filter((bp) => bp.category === 'ship' && researchedBlueprints.includes(bp.id))
  const researchedAddons = BLUEPRINTS.filter(
    (bp) => bp.category === 'ship-addon' && researchedBlueprints.includes(bp.id)
  )
  const empty = researchedShips.length === 0 && researchedAddons.length === 0
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SectionHeader>Engineering Bay</SectionHeader>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 1 }}>
        {empty ? (
          <Typography sx={{ fontSize: 13, color: 'hud.textBrightSoft', mt: 2 }}>
            No blueprints researched yet. Research ships and upgrades in the Research Lab.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {researchedShips.length > 0 && <BuildableSection title="Ships" blueprints={researchedShips} />}
            {researchedAddons.length > 0 && <BuildableSection title="Upgrades" blueprints={researchedAddons} />}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

const BuildableSection = ({ title, blueprints }: { title: string; blueprints: Blueprint[] }) => (
  <Box>
    <Typography
      variant="hud-tag"
      sx={{ fontSize: 11, letterSpacing: 1.5, color: 'hud.textBrightSoft', display: 'block', mb: 1.5 }}
    >
      {title}
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 1.5
      }}
    >
      {blueprints.map((bp) => (
        <BuildableCard key={bp.id} blueprint={bp} />
      ))}
    </Box>
  </Box>
)

const BuildableCard = ({ blueprint }: { blueprint: Blueprint }) => {
  const image = getBlueprintImage(blueprint)
  // Placeholder build action — surfaces the request to a real mutation in a follow-up.
  const handleBuild = () => {
    console.log('Build requested:', blueprint.id)
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        bgcolor: 'hud.surface',
        border: '1px solid',
        borderColor: 'hud.borderSubtle'
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'hud.overlayBlack'
        }}
      >
        {image && <Box component="img" src={image} alt="" sx={{ width: '90%', height: '90%', objectFit: 'contain' }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 13,
            color: 'common.white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {blueprint.name}
        </Typography>
      </Box>
      <HudButton variant="secondary" onClick={handleBuild}>
        Build
      </HudButton>
    </Box>
  )
}
