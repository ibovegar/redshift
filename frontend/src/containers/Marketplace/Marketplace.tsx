import { Grid } from '@mui/material'
import { Cart, Products } from 'components'
import { usePurchase, useStoreProducts, useUser } from 'hooks'
import { useCart } from 'hooks/useCart'
import type { Spacecraft, Upgrade } from 'models'
import { useCallback, useMemo, useState } from 'react'
import { filterObjArr } from 'utils/helpers'
import { SpacecraftFilter } from './SpacecraftFilter/SpacecraftFilter'
import { StoreTypeFilter } from './StoreTypeFilter/StoreTypeFilter'

export const Marketplace = () => {
  const { data: products } = useStoreProducts()
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

  const filtered: (Spacecraft | Upgrade)[] = useMemo(() => {
    let result: (Spacecraft | Upgrade)[] = products
    result = filterObjArr(result, spacecraftFilter, 'spacecraftRegistry')
    result = filterObjArr(result, productTypeFilter, 'storeType')
    return result
  }, [products, spacecraftFilter, productTypeFilter])

  return (
    <Grid container spacing={6} sx={{ position: 'relative' }}>
      <Grid size="grow" sx={{ height: '100%', position: 'sticky', top: 0 }}>
        <SpacecraftFilter onFilterClick={setSpacecraftFilter} />
        <StoreTypeFilter onFilterClick={setProductTypeFilter} />
      </Grid>
      <Grid size={8}>
        <Products onAddClick={handleAddToCart} products={filtered} />
      </Grid>
      <Grid size="grow" sx={{ height: '100%', position: 'sticky', top: 0 }}>
        <Cart credits={user?.credits ?? 0} cart={cart} onRemove={handleRemoveFromCart} onPurchase={handlePurchase} />
      </Grid>
    </Grid>
  )
}
