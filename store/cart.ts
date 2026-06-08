'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  size: string
  color: string | null
  quantity: number
  stock: number
  promoType: string | null
}

export function effectiveQuantity(quantity: number, promoType: string | null): number {
  switch (promoType) {
    case 'TWO_FOR_ONE':   return Math.ceil(quantity / 2)
    case 'THREE_FOR_TWO': return quantity - Math.floor(quantity / 3)
    case 'FOUR_FOR_THREE': return quantity - Math.floor(quantity / 4)
    default: return quantity
  }
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string, color: string | null) => void
  updateQuantity: (productId: string, size: string, color: string | null, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items
        const existing = items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        )
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },

      removeItem: (productId, size, color) => {
        set({ items: get().items.filter((i) => !(i.productId === productId && i.size === size && i.color === color)) })
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size && i.color === color ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => {
        const qty = effectiveQuantity(i.quantity, i.promoType)
        return sum + i.price * qty
      }, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'carrito-tienda' }
  )
)
