import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PasswordInput from '../components/PasswordInput'
import { useI18n } from '../i18n'

export default function Register() {
  const { t } = useI18n()
  const [method, setMethod] = useState('email')
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [code, setCode] = useState('')
  const [password, setPassword] = useState({ pwd: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const startResendTimer = () => {
    setResendTimer(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (method === 'email') {
        await api.post('/customer/auth/register/email', { first_name: form.first_name, last_name: form.last_name, email: form.email })
      } else {
        await api.post('/customer/auth/register/phone', { first_name: form.first_name, last_name: form.last_name, phone: form.phone })
      }
      setStep('code')
      startResendTimer()
      toast?.addToast(t("Registration successful. We've sent a verification code to your {target}.").replace('{target}', method === 'email' ? form.email : form.phone), 'success')
    } catch (err) {
      setError(err.response?.data?.detail || t("An error occurred"))
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setError('')
    setLoading(true)
    try {
      if (method === 'email') {
        await api.post('/customer/auth/register/email', { first_name: form.first_name, last_name: form.last_name, email: form.email })
      } else {
        await api.post('/customer/auth/register/phone', { first_name: form.first_name, last_name: form.last_name, phone: form.phone })
      }
      startResendTimer()
      toast?.addToast(t("A new verification code has been sent."), 'success')
    } catch (err) {
      setError(err.response?.data?.detail || t("An error occurred"))
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    setError('')
    if (password.pwd !== password.confirm) {
      setError(t("Passwords do not match"))
      return
    }
    if (password.pwd.length < 8) {
      setError(t("Password must be at least 8 characters"))
      return
    }
    setLoading(true)
    try {
      let res
      if (method === 'email') {
        res = await api.post('/customer/auth/register/email/verify', {
          email: form.email, code,
          password: password.pwd, confirm_password: password.confirm,
        })
      } else {
        res = await api.post('/customer/auth/register/phone/verify', {
          phone: form.phone, code,
          password: password.pwd, confirm_password: password.confirm,
        })
      }
      login(res.data.access_token, res.data.customer)
      toast?.addToast(t("Your account has been verified successfully."), 'success')
      navigate('/account', { state: { justRegistered: true } })
    } catch (err) {
      setError(err.response?.data?.detail || t("An error occurred"))
    } finally {
      setLoading(false)
    }
  }

  const panel = (title, children) => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-12">
        <p className="eyebrow text-accent mb-4">{t("The Maison")}</p>
        <h1 className="font-display text-headline-lg text-ink">{title}</h1>
      </div>
      {error && <div className="bg-danger-bg text-danger p-4 rounded-lg mb-8 text-sm border border-danger/20">{error}</div>}
      {children}
    </div>
  )

  if (step === 'code') {
    return panel(
      t("Enter Code"),
      <>
        <p className="text-body-md text-ink-muted mb-10 text-center">
          {t("A 6-digit code was sent to {target}").replace('{target}', method === 'email' ? form.email : form.phone)}
        </p>
        <form onSubmit={verifyCode}>
          <input
            type="text" placeholder={t("000000")}
            className="input-line mb-10 text-center text-2xl tracking-[0.5em]"
            value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required
          />
          <div className="mb-8">
            <label className="block eyebrow text-ink-muted mb-1">{t("Password")}</label>
            <PasswordInput value={password.pwd} onChange={(e) => setPassword({ ...password, pwd: e.target.value })} placeholder={t("At least 8 characters")} />
          </div>
          <div className="mb-10">
            <label className="block eyebrow text-ink-muted mb-1">{t("Confirm Password")}</label>
            <PasswordInput value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder={t("Confirm Password")} />
          </div>
          <button disabled={loading} className="btn-primary w-full py-5">{loading ? t("Verifying...") : t("Create Account")}</button>
        </form>
        <div className="text-center mt-6">
          {resendTimer > 0 ? (
            <span className="eyebrow text-ink-muted">{resendTimer}s</span>
          ) : (
            <button onClick={resendCode} disabled={loading} className="eyebrow text-ink-muted hover:text-accent transition-colors underline underline-offset-4">{t("Send Verification Code")}</button>
          )}
        </div>
        <button onClick={() => setStep('form')} className="w-full text-center text-body-md text-ink-muted mt-4 hover:text-accent transition-colors">{t("Back")}</button>
      </>
    )
  }

  return panel(
    t("Create Account"),
    <>
      <div className="flex mb-10 border border-border/40">
        <button
          onClick={() => setMethod('email')}
          className={`flex-1 py-3.5 text-label-sm uppercase tracking-widest transition-colors duration-300 ${method === 'email' ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink'}`}
        >
          {t("Continue with Email")}
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={`flex-1 py-3.5 text-label-sm uppercase tracking-widest transition-colors duration-300 ${method === 'phone' ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink'}`}
        >
          {t("Continue with Phone")}
        </button>
      </div>
      <form onSubmit={sendCode}>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block eyebrow text-ink-muted mb-1">{t("First Name")}</label>
            <input type="text" placeholder={t("First Name")} className="input-line" value={form.first_name} onChange={set('first_name')} required />
          </div>
          <div>
            <label className="block eyebrow text-ink-muted mb-1">{t("Last Name")}</label>
            <input type="text" placeholder={t("Last Name")} className="input-line" value={form.last_name} onChange={set('last_name')} required />
          </div>
        </div>
        <div className="mb-10">
          <label className="block eyebrow text-ink-muted mb-1">{method === 'email' ? t("Email") : t("Phone number")}</label>
          <input
            type={method === 'email' ? 'email' : 'tel'}
            placeholder={method === 'email' ? t("Email") : t("Phone number")}
            className="input-line"
            value={method === 'email' ? form.email : form.phone}
            onChange={set(method === 'email' ? 'email' : 'phone')}
            required
          />
        </div>
        <button disabled={loading} className="btn-primary w-full py-5">{loading ? t("Sending...") : t("Send Verification Code")}</button>
      </form>
      <p className="text-center text-body-md text-ink-muted mt-8">
        {t("Already have an account?")}{' '}
        <Link to="/login" className="eyebrow text-accent hover:text-accent-hover transition-colors">{t("Sign In")}</Link>
      </p>
    </>
  )
}
