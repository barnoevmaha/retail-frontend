import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import PasswordInput from '../components/PasswordInput'
import { t } from '../i18n'

export default function ForgotPassword() {
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
      setMessage(t('auth.reset.sent'))
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.detail || t('toast.error'))
    } finally { setLoading(false) }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password.pwd !== password.confirm) { setError(t('auth.error.passwords_mismatch')); return }
    if (password.pwd.length < 8) { setError(t('auth.error.password_length')); return }
    setLoading(true)
    try {
      await api.post('/customer/auth/reset-password', {
        identifier, code,
        new_password: password.pwd, confirm_password: password.confirm,
      })
      setMessage(t('auth.reset.success'))
      setStep('done')
      toast?.addToast(t('auth.reset.success'), 'success')
    } catch (err) { setError(err.response?.data?.detail || t('toast.error')) }
    finally { setLoading(false) }
  }

  if (step === 'reset') {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('auth.reset.title')}</h1>
        {message && <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-2 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={resetPassword}>
          <input type="text" placeholder={t('auth.reset.code_placeholder')} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-4 text-center text-2xl tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.reset.new_password')}</label>
            <PasswordInput value={password.pwd} onChange={(e) => setPassword({ ...password, pwd: e.target.value })} placeholder={t('auth.register.password_hint')} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.reset.confirm_password')}</label>
            <PasswordInput value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder={t('auth.register.confirm_password')} />
          </div>
          <button disabled={loading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{loading ? t('auth.reset.loading') : t('auth.reset.button')}</button>
        </form>
      </div>
    )
  }
  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('auth.reset.done_title')}</h1>
        <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-4 rounded mb-4">{message}</div>
        <Link to="/login" className="text-gray-900 dark:text-white underline">{t('auth.login.button')}</Link>
      </div>
    )
  }
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('auth.forgot.title')}</h1>
      {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t('auth.forgot.description')}</p>
      <form onSubmit={sendCode}>
        <input type="text" placeholder={t('auth.forgot.identifier')} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-4" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <button disabled={loading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{loading ? t('auth.forgot.sending') : t('auth.forgot.send')}</button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"><Link to="/login" className="text-gray-900 dark:text-white underline">{t('auth.forgot.back')}</Link></p>
    </div>
  )
}
