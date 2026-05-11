import { Grid } from '@mui/material'
import type { Spacecraft, Upgrade } from 'models'
import { ProductCard } from './ProductCard/ProductCard'

interface Props {
  products: (Spacecraft | Upgrade)[]
  onAddClick: (product: Spacecraft | Upgrade) => void
}

export const Products = (props: Props) => {
  const { products, onAddClick } = props

  return (
    <Grid container spacing={6}>
      {products.map((product) => (
        <Grid size={12} key={product.id}>
          <ProductCard product={product} onAddClick={onAddClick} />
        </Grid>
      ))}
    </Grid>
  )
}
