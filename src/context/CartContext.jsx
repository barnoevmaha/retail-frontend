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
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)

  const apply = (r) => {
    setItems(r.data.items || [])
    setTotal(r.data.total || 0)
  }

  const refresh = () =>
    api.get('/cart/', { headers: { 'X-Session-Key': sessionKey() } })
      .then((r) => { setItems(r.data.items || []); setTotal(r.data.total || 0) })
      .catch(() => {})

  useEffect(() => { refresh() }, [])

  const addToCart = async (variantId, quantity = 1) => {
    const r = await api.post('/cart/items', { variant_id: variantId, quantity },
      { headers: { 'X-Session-Key': sessionKey() } })
    apply(r)
  }

  const updateQuantity = async (itemId, quantity) => {
    const r = await api.put(`/cart/items/${itemId}`, { quantity },
      { headers: { 'X-Session-Key': sessionKey() } })
    apply(r)
  }

  const removeItem = async (itemId) => {
    const r = await api.delete(`/cart/items/${itemId}`,
      { headers: { 'X-Session-Key': sessionKey() } })
    apply(r)
  }

  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, count, addToCart, updateQuantity, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)