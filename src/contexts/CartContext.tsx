import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartLine, CartOptionSelection } from '../lib/types'

const STORAGE_KEY = 'ochag_cart_v1'

function lineKey(menuItemId: string, options: CartOptionSelection[], comment?: string) {
  const optionIds = options.map((o) => o.option_id).sort().join(',')
  return `${menuItemId}__${optionIds}__${comment ?? ''}`
}

interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  addItem: (line: Omit<CartLine, 'key'>) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  setComment: (key: string, comment: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartLine[]) : []
    } catch {
      return []
    }
  })

  // Cart persists across refresh, navigation, and language switches — it is
  // never cleared by changing i18n language, only by clear()/checkout.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addItem: CartContextValue['addItem'] = (line) => {
    const key = lineKey(line.menu_item_id, line.selected_options, line.comment)
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l))
      }
      return [...prev, { ...line, key }]
    })
  }

  const updateQuantity: CartContextValue['updateQuantity'] = (key, quantity) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity } : l))
    )
  }

  const removeItem: CartContextValue['removeItem'] = (key) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  const setComment: CartContextValue['setComment'] = (key, comment) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, comment } : l)))
  }

  const clear = () => setLines([])

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])
  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const optionsTotal = l.selected_options.reduce((s, o) => s + o.price_delta, 0)
        return sum + (l.unit_price + optionsTotal) * l.quantity
      }, 0),
    [lines]
  )

  return (
    <CartContext.Provider
      value={{ lines, itemCount, subtotal, addItem, updateQuantity, removeItem, setComment, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
