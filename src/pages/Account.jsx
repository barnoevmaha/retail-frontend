import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/client'
import { t } from '../i18n'

export default function Account() {
  const { customer, logout } = useAuth()
  const toast = useToast()
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
      setMessage(t('account.updated'))
      toast?.addToast(t('account.updated'), 'success')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { setError(err.response?.data?.detail || t('toast.error')) }
    finally { setSaving(false) }
  }

  const saveAddress = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.post('/customer/account/addresses', addressForm)
      setAddresses([...addresses, res.data])
      setMessage(t('account.address.added'))
      toast?.addToast(t('account.address.added'), 'success')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { setError(err.response?.data?.detail || t('toast.error')) }
    finally { setSaving(false) }
  }

  const deleteAddress = async (id) => {
    try { await api.delete(`/customer/account/addresses/${id}`); setAddresses(addresses.filter((a) => a.id !== id)) } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">{t('account.title')}</h1>
        <button onClick={() => { logout(); navigate('/') }} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400">{t('account.logout')}</button>
      </div>
      {message && <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-2 rounded mb-4 text-sm">{message}</div>}
      {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700 pb-2">
        <button onClick={() => setTab('profile')} className={`px-4 py-2 text-sm font-medium ${tab === 'profile' ? 'border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 dark:text-gray-400'}`}>{t('account.profile')}</button>
        <button onClick={() => setTab('addresses')} className={`px-4 py-2 text-sm font-medium ${tab === 'addresses' ? 'border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 dark:text-gray-400'}`}>{t('account.addresses')}</button>
        <button onClick={() => setTab('security')} className={`px-4 py-2 text-sm font-medium ${tab === 'security' ? 'border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 dark:text-gray-400'}`}>{t('account.security')}</button>
      </div>
      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.first_name')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.last_name')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} /></div>
          </div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.birthday')}</label><input type="date" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.gender')}</label>
            <select className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
              <option value="">{t('account.gender.none')}</option><option value="male">{t('account.gender.male')}</option><option value="female">{t('account.gender.female')}</option><option value="other">{t('account.gender.other')}</option>
            </select>
          </div>
          <div className="mb-4"><label className="flex items-center gap-2 text-sm dark:text-gray-300"><input type="checkbox" checked={profile.newsletter} onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })} /> {t('account.newsletter')}</label></div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.language')}</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                <option value="en">English</option><option value="ru">Русский</option><option value="uz">O'zbek</option>
              </select>
            </div>
            <div className="flex-1"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.timezone')}</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                <option value="UTC">UTC</option><option value="America/New_York">Eastern</option><option value="Asia/Tashkent">Tashkent</option>
              </select>
            </div>
          </div>
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('account.email_info').replace('{value}', customer?.email || '—')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('account.phone_info').replace('{value}', customer?.phone || '—')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('account.loyalty').replace('{level}', customer?.loyalty_level || '').replace('{points}', customer?.bonus_points || '0')}</p>
          </div>
          <button disabled={saving} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{saving ? t('account.saving') : t('account.save')}</button>
        </form>
      )}
      {tab === 'addresses' && (
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6">
            <h2 className="font-bold mb-4 dark:text-white">{t('account.address.add_title')}</h2>
            <form onSubmit={saveAddress} className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.receiver_name')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.receiver_name} onChange={(e) => setAddressForm({ ...addressForm, receiver_name: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.receiver_phone')}</label><input type="tel" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.receiver_phone} onChange={(e) => setAddressForm({ ...addressForm, receiver_phone: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.country')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.city')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.street')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.house')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.house} onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.apartment')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.apartment} onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account.address.postal_code')}</label><input type="text" className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded" value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} /></div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-1 text-sm dark:text-gray-300"><input type="checkbox" checked={addressForm.is_default_shipping} onChange={(e) => setAddressForm({ ...addressForm, is_default_shipping: e.target.checked })} /> {t('account.address.default_shipping')}</label>
                <label className="flex items-center gap-1 text-sm dark:text-gray-300"><input type="checkbox" checked={addressForm.is_default_billing} onChange={(e) => setAddressForm({ ...addressForm, is_default_billing: e.target.checked })} /> {t('account.address.default_billing')}</label>
              </div>
              <div className="col-span-2"><button disabled={saving} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{saving ? t('account.address.adding') : t('account.address.add')}</button></div>
            </form>
          </div>
          {addresses.map((a) => (
            <div key={a.id} className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-3 flex justify-between items-start">
              <div className="text-sm dark:text-gray-300"><p className="font-medium dark:text-white">{a.receiver_name} — {a.receiver_phone}</p><p className="text-gray-600 dark:text-gray-400">{[a.country, a.city, a.street, a.house, a.apartment].filter(Boolean).join(', ')}</p>{a.is_default_shipping && <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded mr-1">{t('account.address.default_shipping')}</span>}{a.is_default_billing && <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">{t('account.address.default_billing')}</span>}</div>
              <button onClick={() => deleteAddress(a.id)} className="text-red-500 text-sm hover:text-red-700">{t('account.address.delete')}</button>
            </div>
          ))}
        </div>
      )}
      {tab === 'security' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-6">
          <h2 className="font-bold mb-4 dark:text-white">{t('account.security')}</h2>
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('account.email_verified').replace('{value}', customer?.email_verified ? t('account.gender.male').replace('Male', 'Yes') : t('account.gender.female').replace('Female', 'No'))}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('account.phone_verified').replace('{value}', customer?.phone_verified ? t('account.gender.male').replace('Male', 'Yes') : t('account.gender.female').replace('Female', 'No'))}</p>
          </div>
          {!customer?.email && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('account.no_email')}</p>}
          {!customer?.phone && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('account.no_phone')}</p>}
        </div>
      )}
    </div>
  )
}
