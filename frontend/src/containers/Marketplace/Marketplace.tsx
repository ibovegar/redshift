import { Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Cart, Products } from 'components'
import { usePurchase, useStoreProducts, useUser } from 'hooks'
import { useCart } from 'hooks/useCart'
import type { Spacecraft, Upgrade } from 'models'
import { useCallback, useState } from 'react'
import { filterObjArr } from 'utils/helpers'
import SpacecraftFilter from './SpacecraftFilter/SpacecraftFilter'
import StoreTypeFilter from './StoreTypeFilter/StoreTypeFilter'

const StyledGrid = styled(Grid)({
  position: 'relative'
})

const StickyGrid = styled(Grid)({
  height: '100%',
  position: 'sticky',
  top: 0
})

const Marketplace = () => {
  const { data: products = [] } = useStoreProducts()
  const { data: user } = useUser()
  const { cart, addToCart, removeFromCart, clearCart } = useCart()
  const purchaseMutation = usePurchase()

  const [productTypeFilter, setProductTypeFilter] = useState<string[]>([])
  const [spacecraftFilter, setSpacecraftFilter] = useState<string[]>([])

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
    purchaseMutation.mutate(cart, {
      onSuccess: () => clearCart()
    })
  }, [purchaseMutation, cart, clearCart])

  let filtered: (Spacecraft | Upgrade)[] = products
  filtered = filterObjArr(products, spacecraftFilter, 'spacecraftRegistry')
  filtered = filterObjArr(filtered, productTypeFilter, 'storeType')

  return (
    <StyledGrid container spacing={6}>
      <StickyGrid size="grow">
        <SpacecraftFilter onFilterClick={setSpacecraftFilter} />
        <StoreTypeFilter onFilterClick={setProductTypeFilter} />
      </StickyGrid>
      <Grid size={8}>
        <Products onAddClick={handleAddToCart} products={filtered} />
      </Grid>
      <StickyGrid size="grow">
        <Cart credits={user?.credits ?? 0} cart={cart} onRemove={handleRemoveFromCart} onPurchase={handlePurchase} />
      </StickyGrid>
    </StyledGrid>
  )
}

export default Marketplace
