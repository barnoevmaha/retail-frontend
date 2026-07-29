import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/customer/auth/login', { login, password })
      authLogin(res.data.access_token, res.data.customer)
      navigate('/account')
    } catch (err) {
      if (err.response?.status === 423) {
        setError('Account is locked. Try again in 15 minutes.')
      } else {
        setError(err.response?.data?.detail || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text" placeholder="Email or phone"
          className="w-full border p-2 rounded mb-3"
          value={login} onChange={(e) => setLogin(e.target.value)} required
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <div className="text-right mt-1 mb-4">
          <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">Forgot password?</Link>
        </div>
        <button disabled={loading} className="w-full bg-gray-900 text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account? <Link to="/register" className="text-gray-900 underline">Create one</Link>
      </p>
    </div>
  )
}
