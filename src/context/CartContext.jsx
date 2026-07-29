import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const CartContext = createContext(null)

function sessionKey() {
  let key = sessionStorage.getItem('session_key')
  if (!key) {
    key = 'guest_' + Math.random().toString(36).slice(2)
    sessionStorage.setItem('session_key', key)
  }
  return key
}

export function CartProvider({ children }) {
  const [count, setCount] = useState(0)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    api.get('/cart/', { headers: { 'X-Session-Key': sessionKey() } })
      .then((r) => {
        const total = r.data.items.reduce((s, i) => s + i.quantity, 0)
        setCount(total)
      })
      .catch(() => {})
  }, [refresh])

  const addToCart = async (variantId, quantity = 1) => {
    await api.post('/cart/items', { variant_id: variantId, quantity },
      { headers: { 'X-Session-Key': sessionKey() } })
    setRefresh((r) => r + 1)
  }

  return (
    <CartContext.Provider value={{ count, addToCart, refresh: () => setRefresh((r) => r + 1) }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
