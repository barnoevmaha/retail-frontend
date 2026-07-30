import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PasswordInput from '../components/PasswordInput'
import { t } from '../i18n'

export default function Register() {
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
      toast?.addToast(t('auth.register.success').replace('{target}', method === 'email' ? form.email : form.phone), 'success')
    } catch (err) {
      setError(err.response?.data?.detail || t('toast.error'))
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
      toast?.addToast(t('auth.register.resend'), 'success')
    } catch (err) {
      setError(err.response?.data?.detail || t('toast.error'))
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    setError('')
    if (password.pwd !== password.confirm) {
      setError(t('auth.error.passwords_mismatch'))
      return
    }
    if (password.pwd.length < 8) {
      setError(t('auth.error.password_length'))
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
      toast?.addToast(t('auth.register.verified'), 'success')
      navigate('/account')
    } catch (err) {
      setError(err.response?.data?.detail || t('toast.error'))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('auth.register.code_title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('auth.register.code_sent').replace('{target}', method === 'email' ? form.email : form.phone)}</p>
        {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={verifyCode}>
          <input type="text" placeholder={t('auth.register.code_placeholder')} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-4 text-center text-2xl tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.register.password')}</label>
            <PasswordInput value={password.pwd} onChange={(e) => setPassword({ ...password, pwd: e.target.value })} placeholder={t('auth.register.password_hint')} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.register.confirm_password')}</label>
            <PasswordInput value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder={t('auth.register.confirm_password')} />
          </div>
          <button disabled={loading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{loading ? t('auth.register.verifying') : t('auth.register.verify')}</button>
        </form>
        <div className="text-center mt-3">
          {resendTimer > 0 ? (
            <span className="text-sm text-gray-400">{resendTimer}s</span>
          ) : (
            <button onClick={resendCode} disabled={loading} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline">{t('auth.register.send_code')}</button>
          )}
        </div>
        <button onClick={() => setStep('form')} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 mt-3 hover:text-gray-700 dark:hover:text-gray-300">{t('auth.register.back')}</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('auth.register.title')}</h1>
      {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
      <div className="flex mb-6 border dark:border-gray-700 rounded">
        <button onClick={() => setMethod('email')} className={`flex-1 p-2 text-sm font-medium ${method === 'email' ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{t('auth.register.email')}</button>
        <button onClick={() => setMethod('phone')} className={`flex-1 p-2 text-sm font-medium ${method === 'phone' ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{t('auth.register.phone')}</button>
      </div>
      <form onSubmit={sendCode}>
        <div className="flex gap-3 mb-3">
          <input type="text" placeholder={t('auth.register.first_name')} className="flex-1 border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={form.first_name} onChange={set('first_name')} required />
          <input type="text" placeholder={t('auth.register.last_name')} className="flex-1 border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={form.last_name} onChange={set('last_name')} required />
        </div>
        {method === 'email' ? (
          <input type="email" placeholder={t('auth.register.email_placeholder')} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-4" value={form.email} onChange={set('email')} required />
        ) : (
          <input type="tel" placeholder={t('auth.register.phone_placeholder')} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-4" value={form.phone} onChange={set('phone')} required />
        )}
        <button disabled={loading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{loading ? t('auth.register.sending') : t('auth.register.send_code')}</button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{t('auth.register.have_account')} <Link to="/login" className="text-gray-900 dark:text-white underline">{t('auth.login.button')}</Link></p>
    </div>
  )
}
