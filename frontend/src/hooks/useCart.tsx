import type { Spacecraft, Upgrade } from 'models'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface CartContextValue {
  cart: (Spacecraft | Upgrade)[]
  addToCart: (product: Spacecraft | Upgrade) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<(Spacecraft | Upgrade)[]>([])

  const addToCart = useCallback((product: Spacecraft | Upgrade) => {
    setCart((prev) => [...prev, product])
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
