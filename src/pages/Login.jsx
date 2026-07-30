import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PasswordInput from '../components/PasswordInput'
import { t } from '../i18n'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/customer/auth/login', { login, password })
      authLogin(res.data.access_token, res.data.customer)
      toast?.addToast('Welcome back!', 'success')
      navigate('/account')
    } catch (err) {
      if (err.response?.status === 423) {
        setError(t('auth.login.locked'))
      } else {
        setError(err.response?.data?.detail || t('auth.login.invalid'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('auth.login.title')}</h1>
      {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text" placeholder={t('auth.login.email_or_phone')}
          className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-3"
          value={login} onChange={(e) => setLogin(e.target.value)} required
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.login.password')}
        />
        <div className="text-right mt-1 mb-4">
          <Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">{t('auth.login.forgot')}</Link>
        </div>
        <button disabled={loading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">
          {loading ? t('auth.login.loading') : t('auth.login.button')}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        {t('auth.login.no_account')} <Link to="/register" className="text-gray-900 dark:text-white underline">{t('auth.login.create')}</Link>
      </p>
    </div>
  )
}
