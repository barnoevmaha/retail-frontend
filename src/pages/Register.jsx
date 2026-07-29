import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

export default function Register() {
  const [method, setMethod] = useState('email')
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [code, setCode] = useState('')
  const [password, setPassword] = useState({ pwd: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

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
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (e) => {
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
      navigate('/account')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Enter Code</h1>
        <p className="text-gray-600 mb-4">A 6-digit code was sent to {method === 'email' ? form.email : form.phone}</p>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={verifyCode}>
          <input
            type="text" placeholder="000000"
            className="w-full border p-2 rounded mb-4 text-center text-2xl tracking-widest"
            value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            {loading ? 'Verifying...' : 'Create Account'}
          </button>
        </form>
        <button onClick={() => setStep('form')} className="w-full text-center text-sm text-gray-500 mt-3 hover:text-gray-700">
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

      <div className="flex mb-6 border rounded">
        <button
          onClick={() => setMethod('email')}
          className={`flex-1 p-2 text-sm font-medium ${method === 'email' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
        >
          Continue with Email
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={`flex-1 p-2 text-sm font-medium ${method === 'phone' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
        >
          Continue with Phone
        </button>
      </div>

      <form onSubmit={sendCode}>
        <div className="flex gap-3 mb-3">
          <input
            type="text" placeholder="First Name"
            className="flex-1 border p-2 rounded"
            value={form.first_name} onChange={set('first_name')} required
          />
          <input
            type="text" placeholder="Last Name"
            className="flex-1 border p-2 rounded"
            value={form.last_name} onChange={set('last_name')} required
          />
        </div>

        {method === 'email' ? (
          <input
            type="email" placeholder="Email"
            className="w-full border p-2 rounded mb-4"
            value={form.email} onChange={set('email')} required
          />
        ) : (
          <input
            type="tel" placeholder="Phone number"
            className="w-full border p-2 rounded mb-4"
            value={form.phone} onChange={set('phone')} required
          />
        )}

        <button disabled={loading} className="w-full bg-gray-900 text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/login" className="text-gray-900 underline">Sign In</Link>
      </p>
    </div>
  )
}
