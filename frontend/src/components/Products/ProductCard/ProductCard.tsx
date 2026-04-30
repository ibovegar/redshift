import { Box, Button, Card, CardContent, Chip, Divider } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { Spacecraft, Upgrade } from 'models'
import { isSpacecraft } from 'utils/guards'
import { formatCurrency } from 'utils/helpers'

interface Props {
  product: Spacecraft | Upgrade
  onAddClick: () => void
}

export const ProductCard = (props: Props) => {
  const { product, onAddClick } = props

  const imgUrl = isSpacecraft(product)
    ? `/images/spacecraft_lg/${product.spacecraftRegistry}.png`
    : `/images/upgrade_lg/${product.upgradeRegistry}.png`

  return (
    <Card sx={{ display: 'flex' }}>
      <Box
        component="img"
        src={imgUrl}
        alt="Live from space album cover"
        sx={{ width: 320, minWidth: 320, maxWidth: 320, height: 220, objectFit: 'cover' }}
      />
      <CardContent sx={{ flex: 1, p: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5">{product.name}</Typography>
          <Chip label={product.storeType.toUpperCase()} sx={{ ml: 4 }} />
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {product.manufacturer}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.spacecraftRegistry}
        </Typography>
      </CardContent>
      <Box sx={{ p: 8, textAlign: 'right' }}>
        <Typography component="h6">{formatCurrency(product.price)}</Typography>
        <Divider sx={{ mt: 2, mb: 6 }} />
        <Button variant="contained" size="small" color="primary" onClick={onAddClick}>
          ADD
        </Button>
      </Box>
    </Card>
  )
}
