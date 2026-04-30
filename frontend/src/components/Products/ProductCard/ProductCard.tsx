import { Box, Button } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { Spacecraft, Upgrade } from 'models'
import { isSpacecraft } from 'utils/guards'
import { formatCurrency } from 'utils/helpers'
import { Controls, Cover, StyledCard, StyledCardContent, StyledChip, StyledDivider } from './ProductCard.styles'

interface Props {
  product: Spacecraft | Upgrade
  onAddClick: () => void
}

const ProductCard = (props: Props) => {
  const { product, onAddClick } = props

  const imgUrl = isSpacecraft(product)
    ? `/images/spacecraft_lg/${product.spacecraftRegistry}.png`
    : `/images/upgrade_lg/${product.upgradeRegistry}.png`

  return (
    <StyledCard>
      <Cover src={imgUrl} alt="Live from space album cover" />
      <StyledCardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5">{product.name}</Typography>
          <StyledChip label={product.storeType.toUpperCase()} />
        </Box>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {product.manufacturer}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {product.spacecraftRegistry}
        </Typography>
      </StyledCardContent>
      <Controls>
        <Typography component="h6">{formatCurrency(product.price)}</Typography>
        <StyledDivider />
        <Button variant="contained" size="small" color="primary" onClick={onAddClick}>
          ADD
        </Button>
      </Controls>
    </StyledCard>
  )
}

export default ProductCard
