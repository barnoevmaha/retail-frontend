import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token') || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

async function refreshAccess() {
  const refresh = localStorage.getItem('customer_refresh_token')
  if (!refresh) return null
  try {
    const { data } = await axios.post(`${BASE}/customer/auth/refresh`, { refresh_token: refresh })
    localStorage.setItem('customer_token', data.access_token)
    if (data.refresh_token) localStorage.setItem('customer_refresh_token', data.refresh_token)
    return data.access_token
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem('customer_token')
  localStorage.removeItem('customer_refresh_token')
  if (window.location.pathname.startsWith('/account') && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const isAuth401 = err.response?.status === 401
    const hadAuth = !!err.config?.headers?.Authorization
    const hasRefresh = !!localStorage.getItem('customer_refresh_token')
    if (isAuth401 && hadAuth && hasRefresh && !err.config?._retried) {
      err.config._retried = true
      if (!refreshing) refreshing = refreshAccess().finally(() => { refreshing = null })
      const token = await refreshing
      if (token) {
        err.config.headers = err.config.headers || {}
        err.config.headers.Authorization = `Bearer ${token}`
        return api.request(err.config)
      }
    }
    if (isAuth401 && hadAuth) {
      clearSession()
    }
    return Promise.reject(err)
  }
)

export default api