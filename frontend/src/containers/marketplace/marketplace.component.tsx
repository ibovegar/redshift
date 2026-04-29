import { Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Cart, Products } from 'components'
import type { Spacecraft, Upgrade } from 'models'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import type { AppState } from 'store'
import { addToCart, loadStore, purchase, removeFromCart } from 'store/marketplace'
import { filterObjArr } from 'utils/helpers'
// import CategoryFilter from './category-filter/category-filter.component';
import SpacecraftFilter from './spacecraft-filter/spacecraft-filter.component'
import StoreTypeFilter from './store-type-filter/store-type-filter.component'

const StyledGrid = styled(Grid)({
  position: 'relative'
})

const StickyGrid = styled(Grid)({
  height: '100%',
  position: 'sticky',
  top: 0
})

interface Props {
  products: (Spacecraft | Upgrade)[]
  cart: (Spacecraft | Upgrade)[]
  credits: number
  loadStore: () => void
  addToCart: (product: Spacecraft | Upgrade) => void
  removeFromCart: (index: number) => void
  purchase: (cart: (Spacecraft | Upgrade)[]) => void
}

const Marketplace = (props: Props) => {
  const { products, cart, credits, loadStore, addToCart, removeFromCart, purchase } = props

  const [productTypeFilter, setProductTypeFilter] = useState<string[]>([])
  const [spacecraftFilter, setSpacecraftFilter] = useState<string[]>([])

  useEffect(() => {
    loadStore()
  }, [loadStore])

  const handleAddToCart = useCallback(
    (product: Spacecraft | Upgrade) => {
      addToCart(product)
    },
    [addToCart]
  )

  const handleRemoveFromCart = useCallback(
    (index: number) => {
      removeFromCart(index)
    },
    [removeFromCart]
  )

  const handlePurchase = useCallback(() => {
    purchase(cart)
  }, [purchase, cart])

  let filtered: (Spacecraft | Upgrade)[] = products
  filtered = filterObjArr(products, spacecraftFilter, 'spacecraftRegistry')
  filtered = filterObjArr(filtered, productTypeFilter, 'storeType')

  return (
    <StyledGrid container spacing={6}>
      <StickyGrid size="grow">
        {/* <CategoryFilter onFilterClick={handleCategoryFilter} /> */}
        <SpacecraftFilter onFilterClick={setSpacecraftFilter} />
        <StoreTypeFilter onFilterClick={setProductTypeFilter} />
      </StickyGrid>
      <Grid size={8}>
        <Products onAddClick={handleAddToCart} products={filtered} />
      </Grid>
      <StickyGrid size="grow">
        <Cart credits={credits} cart={cart} onRemove={handleRemoveFromCart} onPurchase={handlePurchase} />
      </StickyGrid>
    </StyledGrid>
  )
}

export const mapStateToProps = (state: AppState) => ({
  products: state.marketplace.products,
  cart: state.marketplace.cart,
  credits: state.user.credits
})

export const mapDispatchToProps = {
  loadStore,
  addToCart,
  removeFromCart,
  purchase
}

export default connect(mapStateToProps, mapDispatchToProps)(Marketplace)
