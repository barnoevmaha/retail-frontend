import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Account() {
  const { customer, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ first_name: '', last_name: '', birthday: '', gender: '', newsletter: false, language: 'en', timezone: 'UTC' })
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({ receiver_name: '', receiver_phone: '', country: '', city: '', street: '', house: '', apartment: '', postal_code: '', is_default_shipping: false, is_default_billing: false })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customer) { navigate('/login'); return }
    setProfile({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      birthday: customer.birthday || '',
      gender: customer.gender || '',
      newsletter: customer.newsletter || false,
      language: customer.language || 'en',
      timezone: customer.timezone || 'UTC',
    })
    api.get('/customer/account/addresses').then((r) => setAddresses(r.data)).catch(() => {})
  }, [customer, navigate])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.put('/customer/account/me', profile)
      setMessage('Profile updated')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving profile')
    } finally { setSaving(false) }
  }

  const saveAddress = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.post('/customer/account/addresses', addressForm)
      setAddresses([...addresses, res.data])
      setMessage('Address added')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving address')
    } finally { setSaving(false) }
  }

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/customer/account/addresses/${id}`)
      setAddresses(addresses.filter((a) => a.id !== id))
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Account</h1>
        <button onClick={() => { logout(); navigate('/') }} className="text-sm text-red-500 hover:text-red-700">Logout</button>
      </div>

      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

      <div className="flex gap-2 mb-6 border-b pb-2">
        <button onClick={() => setTab('profile')} className={`px-4 py-2 text-sm font-medium ${tab === 'profile' ? 'border-b-2 border-gray-900' : 'text-gray-500'}`}>Profile</button>
        <button onClick={() => setTab('addresses')} className={`px-4 py-2 text-sm font-medium ${tab === 'addresses' ? 'border-b-2 border-gray-900' : 'text-gray-500'}`}>Addresses</button>
        <button onClick={() => setTab('security')} className={`px-4 py-2 text-sm font-medium ${tab === 'security' ? 'border-b-2 border-gray-900' : 'text-gray-500'}`}>Security</button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" className="w-full border p-2 rounded" value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" className="w-full border p-2 rounded" value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
            <input type="date" className="w-full border p-2 rounded" value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full border p-2 rounded" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={profile.newsletter} onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })} />
              Subscribe to newsletter
            </label>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select className="w-full border p-2 rounded" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                <option value="en">English</option>
                <option value="ru">Russian</option>
                <option value="uz">Uzbek</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select className="w-full border p-2 rounded" value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern</option>
                <option value="Asia/Tashkent">Tashkent</option>
              </select>
            </div>
          </div>
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Email: <strong>{customer?.email || 'Not set'}</strong></p>
            <p className="text-sm text-gray-600">Phone: <strong>{customer?.phone || 'Not set'}</strong></p>
            <p className="text-sm text-gray-600">Loyalty: <strong>{customer?.loyalty_level}</strong> ({customer?.bonus_points} pts)</p>
          </div>
          <button disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      {tab === 'addresses' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-bold mb-4">Add Address</h2>
            <form onSubmit={saveAddress} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
                <input type="text" className="w-full border p-2 rounded" value={addressForm.receiver_name} onChange={(e) => setAddressForm({ ...addressForm, receiver_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Phone</label>
                <input type="tel" className="w-full border p-2 rounded" value={addressForm.receiver_phone} onChange={(e) => setAddressForm({ ...addressForm, receiver_phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" className="w-full border p-2 rounded" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" className="w-full border p-2 rounded" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input type="text" className="w-full border p-2 rounded" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House</label>
                  <input type="text" className="w-full border p-2 rounded" value={addressForm.house} onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment</label>
                  <input type="text" className="w-full border p-2 rounded" value={addressForm.apartment} onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input type="text" className="w-full border p-2 rounded" value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={addressForm.is_default_shipping} onChange={(e) => setAddressForm({ ...addressForm, is_default_shipping: e.target.checked })} /> Default Shipping</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={addressForm.is_default_billing} onChange={(e) => setAddressForm({ ...addressForm, is_default_billing: e.target.checked })} /> Default Billing</label>
              </div>
              <div className="col-span-2">
                <button disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
                  {saving ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>

          {addresses.map((a) => (
            <div key={a.id} className="bg-white rounded-lg shadow p-4 mb-3 flex justify-between items-start">
              <div className="text-sm">
                <p className="font-medium">{a.receiver_name} — {a.receiver_phone}</p>
                <p className="text-gray-600">{[a.country, a.city, a.street, a.house, a.apartment].filter(Boolean).join(', ')}</p>
                {a.is_default_shipping && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded mr-1">Default Shipping</span>}
                {a.is_default_billing && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Default Billing</span>}
              </div>
              <button onClick={() => deleteAddress(a.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold mb-4">Account Security</h2>
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Email verified: <strong>{customer?.email_verified ? '✅ Yes' : '❌ No'}</strong></p>
            <p className="text-sm text-gray-600">Phone verified: <strong>{customer?.phone_verified ? '✅ Yes' : '❌ No'}</strong></p>
          </div>
          {!customer?.email && (
            <p className="text-sm text-gray-500 mb-2">No email linked. Contact support to add one.</p>
          )}
          {!customer?.phone && (
            <p className="text-sm text-gray-500 mb-2">No phone linked. Contact support to add one.</p>
          )}
        </div>
      )}
    </div>
  )
}
