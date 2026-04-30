import { Grid } from '@mui/material'
import type { Spacecraft, Upgrade } from 'models'
import ProductCard from './ProductCard/ProductCard'

interface Props {
  products: (Spacecraft | Upgrade)[]
  onAddClick: (product: Spacecraft | Upgrade) => void
}

const Products = (props: Props) => {
  const { products, onAddClick } = props

  return (
    <Grid container spacing={6}>
      {products.map((product, _index) => (
        <Grid size={12} key={product.id}>
          <ProductCard product={product} onAddClick={() => onAddClick(product)} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Products
