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
        .catch(() => {
          if (!localStorage.getItem('customer_refresh_token')) {
            localStorage.removeItem('customer_token')
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, customerData, refreshToken) => {
    localStorage.setItem('customer_token', token)
    if (refreshToken) localStorage.setItem('customer_refresh_token', refreshToken)
    setCustomer(customerData)
  }

  const logout = () => {
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_refresh_token')
    localStorage.removeItem('token')
    setCustomer(null)
  }

  return (
    <AuthContext.Provider value={{ customer, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
