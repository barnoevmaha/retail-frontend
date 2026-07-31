import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import PasswordInput from '../components/PasswordInput'
import { useI18n } from '../i18n'

export default function ForgotPassword() {
  const { t } = useI18n()
  const [identifier, setIdentifier] = useState('')
  const [step, setStep] = useState('email')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState({ pwd: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const sendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/customer/auth/forgot-password', { identifier })
      setMessage(t("Reset code sent. Check your email or phone."))
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.detail || t("An error occurred"))
    } finally { setLoading(false) }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password.pwd !== password.confirm) { setError(t("Passwords do not match")); return }
    if (password.pwd.length < 8) { setError(t("Password must be at least 8 characters")); return }
    setLoading(true)
    try {
      await api.post('/customer/auth/reset-password', {
        identifier, code,
        new_password: password.pwd, confirm_password: password.confirm,
      })
      setMessage(t("Password reset successfully. You can now sign in."))
      setStep('done')
      toast?.addToast(t("Password reset successfully. You can now sign in."), 'success')
    } catch (err) { setError(err.response?.data?.detail || t("An error occurred")) }
    finally { setLoading(false) }
  }

  if (step === 'reset') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow text-accent mb-4">{t("The Maison")}</p>
          <h1 className="font-display text-headline-lg text-ink">{t("Reset Password")}</h1>
        </div>
        {message && <div className="bg-success-bg text-success p-4 rounded-lg mb-8 text-sm border border-success/20">{message}</div>}
        {error && <div className="bg-danger-bg text-danger p-4 rounded-lg mb-8 text-sm border border-danger/20">{error}</div>}
        <form onSubmit={resetPassword}>
          <div className="mb-8">
            <label className="block eyebrow text-ink-muted mb-1">{t("Verification Code")}</label>
            <input type="text" placeholder={t("000000")} className="input-line text-center text-2xl tracking-[0.5em]" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
          </div>
          <div className="mb-8">
            <label className="block eyebrow text-ink-muted mb-1">{t("New Password")}</label>
            <PasswordInput value={password.pwd} onChange={(e) => setPassword({ ...password, pwd: e.target.value })} placeholder={t("At least 8 characters")} />
          </div>
          <div className="mb-10">
            <label className="block eyebrow text-ink-muted mb-1">{t("Confirm Password")}</label>
            <PasswordInput value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder={t("Confirm Password")} />
          </div>
          <button disabled={loading} className="btn-primary w-full py-5">{loading ? t("Resetting...") : t("Reset Password")}</button>
        </form>
      </div>
    )
  }
  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="eyebrow text-accent mb-4">{t("The Maison")}</p>
        <h1 className="font-display text-headline-lg text-ink mb-8">{t("Password Reset")}</h1>
        <div className="bg-success-bg text-success p-6 rounded-lg mb-10 border border-success/20">{message}</div>
        <Link to="/login" className="btn-primary">{t("Sign In")}</Link>
      </div>
    )
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-12">
        <p className="eyebrow text-accent mb-4">{t("The Maison")}</p>
        <h1 className="font-display text-headline-lg text-ink">{t("Forgot Password")}</h1>
      </div>
      {error && <div className="bg-danger-bg text-danger p-4 rounded-lg mb-8 text-sm border border-danger/20">{error}</div>}
      <p className="text-body-md text-ink-muted mb-10 text-center">{t("Enter your email or phone number to receive a reset code.")}</p>
      <form onSubmit={sendCode}>
        <div className="mb-10">
          <label className="block eyebrow text-ink-muted mb-1">{t("Email or phone")}</label>
          <input type="text" placeholder={t("Email or phone")} className="input-line" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        </div>
        <button disabled={loading} className="btn-primary w-full py-5">{loading ? t("Sending...") : t("Send Reset Code")}</button>
      </form>
      <p className="text-center text-body-md text-ink-muted mt-8">
        <Link to="/login" className="eyebrow text-accent hover:text-accent-hover transition-colors">{t("Back to Sign In")}</Link>
      </p>
    </div>
  )
}
