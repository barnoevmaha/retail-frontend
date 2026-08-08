import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'
import { sessionKey } from '../utils/session'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [total, setTotal] = useState(0)
  const { customer, loading } = useAuth()

  const apply = (r) => {
    setItems(r.data.items || [])
    setSubtotal(r.data.subtotal ?? r.data.total ?? 0)
    setDeliveryFee(r.data.delivery_fee ?? 0)
    setTotal(r.data.total ?? 0)
  }

  const refresh = () =>
    api.get('/cart/', { headers: { 'X-Session-Key': sessionKey() } })
      .then(apply)
      .catch(() => {})

  useEffect(() => { refresh() }, [])

  // After login/logout the authenticated cart changes (server merges the guest cart
  // into the customer's cart). Re-fetch so the UI reflects the authoritative cart.
  useEffect(() => { if (!loading) refresh() }, [customer?.id, loading])

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
    <CartContext.Provider value={{ items, subtotal, deliveryFee, total, count, addToCart, updateQuantity, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
