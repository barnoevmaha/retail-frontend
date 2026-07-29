import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import PasswordInput from '../components/PasswordInput'

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('')
  const [step, setStep] = useState('email')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState({ pwd: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/customer/auth/forgot-password', { identifier })
      setMessage('Reset code sent. Check your email or phone.')
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password.pwd !== password.confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.pwd.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/customer/auth/reset-password', {
        identifier, code,
        new_password: password.pwd, confirm_password: password.confirm,
      })
      setMessage('Password reset successfully. You can now sign in.')
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'reset') {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={resetPassword}>
          <input
            type="text" placeholder="000000"
            className="w-full border p-2 rounded mb-4 text-center text-2xl tracking-widest"
            value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <PasswordInput
              value={password.pwd}
              onChange={(e) => setPassword({ ...password, pwd: e.target.value })}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <PasswordInput
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              placeholder="Repeat password"
            />
          </div>
          <button disabled={loading} className="w-full bg-gray-900 text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Password Reset</h1>
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{message}</div>
        <Link to="/login" className="text-gray-900 underline">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
      <p className="text-gray-600 mb-4">Enter your email or phone number to receive a reset code.</p>
      <form onSubmit={sendCode}>
        <input
          type="text" placeholder="Email or phone"
          className="w-full border p-2 rounded mb-4"
          value={identifier} onChange={(e) => setIdentifier(e.target.value)} required
        />
        <button disabled={loading} className="w-full bg-gray-900 text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        <Link to="/login" className="text-gray-900 underline">Back to Sign In</Link>
      </p>
    </div>
  )
}
