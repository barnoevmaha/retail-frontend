import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { customer } = useAuth()
  const [faves, setFaves] = useState(new Set())
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!customer) { setFaves(new Set()); return }
    api.get('/favorites/')
      .then((r) => setFaves(new Set(r.data.map((f) => f.product_id))))
      .catch(() => {})
  }, [customer, refreshKey])

  const toggle = async (productId) => {
    if (!customer) return false
    try {
      if (faves.has(productId)) {
        await api.delete(`/favorites/${productId}`)
        setFaves((prev) => { const n = new Set(prev); n.delete(productId); return n })
      } else {
        await api.post('/favorites/', { product_id: productId })
        setFaves((prev) => new Set(prev).add(productId))
      }
      return true
    } catch { return false }
  }

  return (
    <FavoritesContext.Provider value={{ faves, toggle, refresh: () => setRefreshKey((k) => k + 1) }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
