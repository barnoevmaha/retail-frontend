import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('customer_token')
    if (token) {
      api.get('/customer/account/me')
        .then((r) => setCustomer(r.data))
        .catch(() => localStorage.removeItem('customer_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, customerData) => {
    localStorage.setItem('customer_token', token)
    setCustomer(customerData)
  }

  const logout = () => {
    localStorage.removeItem('customer_token')
    setCustomer(null)
  }

  return (
    <AuthContext.Provider value={{ customer, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
