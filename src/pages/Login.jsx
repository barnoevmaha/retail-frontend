import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PasswordInput from '../components/PasswordInput'
import { useI18n } from '../i18n'

export default function Login() {
  const { t } = useI18n()
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
      authLogin(res.data.access_token, res.data.customer, res.data.refresh_token)
      toast?.addToast(t('Welcome back!'), 'success')
      navigate('/')
    } catch (err) {
      if (err.response?.status === 423) {
        setError(t("Account is locked. Try again in 15 minutes."))
      } else {
        setError(err.response?.data?.detail || t("Invalid credentials"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-12">
        <p className="eyebrow text-accent mb-4">{t("The Maison")}</p>
        <h1 className="font-display text-headline-lg text-ink">{t("Sign In")}</h1>
      </div>

      {error && (
        <div className="bg-danger-bg text-danger p-4 rounded-lg mb-8 text-sm border border-danger/20">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label className="block eyebrow text-ink-muted mb-1">{t("Email or phone")}</label>
          <input
            type="text" placeholder={t("Email or phone")}
            className="input-line"
            value={login} onChange={(e) => setLogin(e.target.value)} required
          />
        </div>
        <div className="mb-8">
          <label className="block eyebrow text-ink-muted mb-1">{t("Password")}</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("Password")}
          />
        </div>
        <div className="text-right mb-10">
          <Link to="/forgot-password" className="eyebrow text-ink-muted hover:text-accent transition-colors">{t("Forgot password?")}</Link>
        </div>
        <button disabled={loading} className="btn-primary w-full py-5">
          {loading ? t("Signing in...") : t("Sign In")}
        </button>
      </form>

      <p className="text-center text-body-md text-ink-muted mt-8">
        {t("Don't have an account?")}{' '}
        <Link to="/register" className="eyebrow text-accent hover:text-accent-hover transition-colors">{t("Create one")}</Link>
      </p>
    </div>
  )
}
