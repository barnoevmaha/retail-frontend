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
      <h1 className="text-2xl font-bold mb-6 text-ink">{t('auth.login.title')}</h1>
      {error && <div className="bg-danger-bg text-danger p-3 rounded-control mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text" placeholder={t('auth.login.email_or_phone')}
          className="w-full border border-border bg-surface text-ink rounded-control px-3 py-2 mb-3 focus:border-accent focus:outline-none transition-colors"
          value={login} onChange={(e) => setLogin(e.target.value)} required
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.login.password')}
        />
        <div className="text-right mt-1 mb-4">
          <Link to="/forgot-password" className="text-sm text-ink-muted hover:text-accent transition-colors">{t('auth.login.forgot')}</Link>
        </div>
        <button disabled={loading} className="w-full bg-accent text-accent-ink p-2.5 rounded-control font-medium hover:bg-accent-hover transition-colors disabled:opacity-50">
          {loading ? t('auth.login.loading') : t('auth.login.button')}
        </button>
      </form>
      <p className="text-center text-sm text-ink-muted mt-4">
        {t('auth.login.no_account')} <Link to="/register" className="font-medium text-accent hover:text-accent-hover transition-colors">{t('auth.login.create')}</Link>
      </p>
    </div>
  )
}