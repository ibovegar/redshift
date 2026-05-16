import { Box, Tooltip, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { MATERIAL_ICONS, MATERIAL_NAMES, MATERIAL_SYMBOLS } from 'data/materials'
import type { AsteroidMaterial } from 'models/asteroid'
import type { CargoItem } from 'models/spacecraft'
import { Nav } from '../Nav/Nav'
import { ResourceAmount } from './ResourceAmount/ResourceAmount'

const ALL_MATERIALS: AsteroidMaterial[] = [
  'iron',
  'titanium',
  'copper',
  'carbon',
  'silicates',
  'water_ice',
  'antimatter',
  'uranium',
  'helium3',
  'gold'
]

const Root = styled('div')(({ theme }) => ({
  borderStyle: 'solid',
  borderWidth: '1px 0 1px 0',
  borderColor: theme.palette.grey[800],
  display: 'flex',
  alignItems: 'center',
  height: 60,
  pointerEvents: 'auto',
  position: 'fixed',
  top: theme.spacing(6),
  left: theme.spacing(6),
  right: theme.spacing(6),
  zIndex: 20
}))

const Left = styled('div')({
  flex: '1'
})

const Right = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
  backgroundColor: theme.palette.background.paper
}))

const ResourceChip = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  fontSize: 13,
  color: theme.palette.text.secondary
}))

interface Props {
  storage?: CargoItem[]
}

export const Toolbar = (props: Props) => {
  const { storage = [] } = props

  const storageMap = new Map(storage.map((item) => [item.material, item.amount]))

  return (
    <Root>
      <Left>
        <Nav />
      </Left>
      <Right>
        {ALL_MATERIALS.map((material) => (
          <Tooltip key={material} title={MATERIAL_NAMES[material]}>
            <ResourceChip>
              <Box component="img" src={MATERIAL_ICONS[material]} loading="lazy" sx={{ width: 40, height: 'auto' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {MATERIAL_SYMBOLS[material]}
              </Typography>
              <ResourceAmount target={storageMap.get(material) ?? 0} />
            </ResourceChip>
          </Tooltip>
        ))}
      </Right>
    </Root>
  )
}
