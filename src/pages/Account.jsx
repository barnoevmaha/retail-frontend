import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/client'
import { useI18n } from '../i18n'
import { orderStatus } from '../utils/orders'

const inputCls = 'input-line'

export default function Account() {
  const { t } = useI18n()
  const { customer, loading, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = Boolean(location.state?.justRegistered)
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ first_name: '', last_name: '', birthday: '', gender: '', newsletter: false, language: 'en', timezone: 'UTC' })
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [addressForm, setAddressForm] = useState({ receiver_name: '', receiver_phone: '', country: '', city: '', street: '', house: '', apartment: '', postal_code: '', is_default_shipping: false, is_default_billing: false })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
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
    api.get('/customer/account/addresses').then((r) => setAddresses(r.data)).catch(() => { })
  }, [customer, loading, navigate])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.put('/customer/account/me', profile)
      setMessage(t("Profile updated"))
      toast?.addToast(t("Profile updated"), 'success')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { setError(err.response?.data?.detail || t("An error occurred")) }
    finally { setSaving(false) }
  }

  const saveAddress = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.post('/customer/account/addresses', addressForm)
      setAddresses([...addresses, res.data])
      setMessage(t("Address added"))
      toast?.addToast(t("Address added"), 'success')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) { setError(err.response?.data?.detail || t("An error occurred")) }
    finally { setSaving(false) }
  }

  const deleteAddress = async (id) => {
    try { await api.delete(`/customer/account/addresses/${id}`); setAddresses(addresses.filter((a) => a.id !== id)) } catch { }
  }

  const navItems = [
    { id: 'profile', label: t("Profile"), icon: 'person' },
    { id: 'addresses', label: t("Addresses"), icon: 'location_on' },
    { id: 'orders', label: t("Orders"), icon: 'receipt_long' },
    { id: 'security', label: t("Security"), icon: 'manage_accounts' },
  ]

  useEffect(() => {
    if (tab !== 'orders' || !customer) return
    setOrdersLoading(true)
    api.get('/customer/orders/').then((r) => setOrders(r.data || [])).catch(() => {}).finally(() => setOrdersLoading(false))
  }, [tab, customer])

  return (
    <div className="flex flex-col md:flex-row gap-gutter">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="md:sticky md:top-32 mb-12 md:mb-0">
          <h2 className="font-display text-headline-md text-ink mb-8">{t("My Account")}</h2>
          <nav className="flex md:flex-col gap-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`group flex items-center gap-4 py-3 pl-4 border-l-2 transition-all duration-300 ${
                  tab === item.id
                    ? 'border-accent bg-surface-muted/60'
                    : 'border-transparent hover:bg-surface-muted/60 hover:border-border'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-colors ${tab === item.id ? 'text-accent' : 'text-ink-muted group-hover:text-ink'}`}>{item.icon}</span>
                <span className={`eyebrow transition-colors ${tab === item.id ? 'text-ink font-bold' : 'text-ink-muted group-hover:text-ink'}`}>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => { logout(); navigate('/') }}
              className="group flex items-center gap-4 py-3 pl-4 border-l-2 border-transparent hover:bg-danger-bg/30 transition-all duration-300 md:mt-8"
            >
              <span className="material-symbols-outlined text-[20px] text-danger/70 group-hover:text-danger transition-colors">logout</span>
              <span className="eyebrow text-danger/70 group-hover:text-danger transition-colors">{t("Sign Out")}</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <section className="flex-grow min-w-0">
        {justRegistered && (
          <div className="bg-success-bg text-success p-8 rounded-xl mb-8 text-center border border-success/30 hover-lift">
            <p className="font-display text-headline-md mb-6">{t("Registration completed successfully.")}</p>
            <button
              onClick={() => navigate('/market')}
              className="btn-primary"
            >
              {t("Go to Market")}
            </button>
          </div>
        )}
        {message && <div className="bg-success-bg text-success p-4 rounded-lg mb-8 text-sm border border-success/20">{message}</div>}
        {error && <div className="bg-danger-bg text-danger p-4 rounded-lg mb-8 text-sm border border-danger/20">{error}</div>}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="glass-panel rounded-xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 mb-8">
              <div><label className="block eyebrow text-ink-muted mb-1">{t("First Name")}</label><input type="text" className={inputCls} value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></div>
              <div><label className="block eyebrow text-ink-muted mb-1">{t("Last Name")}</label><input type="text" className={inputCls} value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} /></div>
              <div><label className="block eyebrow text-ink-muted mb-1">{t("Birthday")}</label><input type="date" className={inputCls} value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} /></div>
              <div>
                <label className="block eyebrow text-ink-muted mb-1">{t("Gender")}</label>
                <select className={inputCls} value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="">{t("Prefer not to say")}</option><option value="male">{t("Male")}</option><option value="female">{t("Female")}</option><option value="other">{t("Other")}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 text-body-md text-ink-muted cursor-pointer">
                  <input type="checkbox" checked={profile.newsletter} onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })} className="accent-accent w-4 h-4" />
                  {t("Subscribe to newsletter")}
                </label>
              </div>
              <div><label className="block eyebrow text-ink-muted mb-1">{t("Language")}</label>
                <select className={inputCls} value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                  <option value="en">English</option><option value="ru">Русский</option><option value="uz">O'zbek</option>
                </select>
              </div>
              <div><label className="block eyebrow text-ink-muted mb-1">{t("Timezone")}</label>
                <select className={inputCls} value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                  <option value="UTC">UTC</option><option value="America/New_York">Eastern</option><option value="Asia/Tashkent">Tashkent</option>
                </select>
              </div>
            </div>
            <div className="mb-8 p-5 bg-surface-muted/60 rounded-lg space-y-1">
              <p className="text-body-md text-ink-muted">{t("Email: {value}").replace('{value}', customer?.email || '—')}</p>
              <p className="text-body-md text-ink-muted">{t("Phone: {value}").replace('{value}', customer?.phone || '—')}</p>
              <p className="text-body-md text-ink-muted">{t("Loyalty: {level} ({points} pts)").replace('{level}', customer?.loyalty_level || '').replace('{points}', customer?.bonus_points || '0')}</p>
            </div>
            <button disabled={saving} className="btn-primary">{saving ? t("Saving...") : t("Save")}</button>
          </form>
        )}

        {tab === 'addresses' && (
          <div>
            <div className="glass-panel rounded-xl p-8 mb-10">
              <h2 className="font-display text-headline-md text-ink mb-8">{t("Add Address")}</h2>
              <form onSubmit={saveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                <div><label className="block eyebrow text-ink-muted mb-1">{t("Receiver Name")}</label><input type="text" className={inputCls} value={addressForm.receiver_name} onChange={(e) => setAddressForm({ ...addressForm, receiver_name: e.target.value })} required /></div>
                <div><label className="block eyebrow text-ink-muted mb-1">{t("Receiver Phone")}</label><input type="tel" className={inputCls} value={addressForm.receiver_phone} onChange={(e) => setAddressForm({ ...addressForm, receiver_phone: e.target.value })} required /></div>
                <div><label className="block eyebrow text-ink-muted mb-1">{t("Country")}</label><input type="text" className={inputCls} value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} /></div>
                <div><label className="block eyebrow text-ink-muted mb-1">{t("City")}</label><input type="text" className={inputCls} value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="block eyebrow text-ink-muted mb-1">{t("Street")}</label><input type="text" className={inputCls} value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} /></div>
                <div><label className="block eyebrow text-ink-muted mb-1">{t("House")}</label><input type="text" className={inputCls} value={addressForm.house} onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })} /></div>
                <div><label className="block eyebrow text-ink-muted mb-1">{t("Apartment")}</label><input type="text" className={inputCls} value={addressForm.apartment} onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })} /></div>
                <div><label className="block eyebrow text-ink-muted mb-1">{t("Postal Code")}</label><input type="text" className={inputCls} value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} /></div>
                <div className="flex items-end gap-6">
                  <label className="flex items-center gap-2 text-body-md text-ink-muted cursor-pointer"><input type="checkbox" checked={addressForm.is_default_shipping} onChange={(e) => setAddressForm({ ...addressForm, is_default_shipping: e.target.checked })} className="accent-accent w-4 h-4" /> {t("Default Shipping")}</label>
                  <label className="flex items-center gap-2 text-body-md text-ink-muted cursor-pointer"><input type="checkbox" checked={addressForm.is_default_billing} onChange={(e) => setAddressForm({ ...addressForm, is_default_billing: e.target.checked })} className="accent-accent w-4 h-4" /> {t("Default Billing")}</label>
                </div>
                <div className="sm:col-span-2"><button disabled={saving} className="btn-primary">{saving ? t("Adding...") : t("Add Address")}</button></div>
              </form>
            </div>
            {addresses.map((a) => (
              <div key={a.id} className="glass-panel rounded-xl p-6 mb-4 flex justify-between items-start hover-lift">
                <div className="text-body-md text-ink-muted">
                  <p className="font-display text-body-lg text-ink mb-1">{a.receiver_name} — {a.receiver_phone}</p>
                  <p>{[a.country, a.city, a.street, a.house, a.apartment].filter(Boolean).join(', ')}</p>
                  {(a.is_default_shipping || a.is_default_billing) && (
                    <div className="flex gap-2 mt-2">
                      {a.is_default_shipping && <span className="eyebrow text-accent border border-accent/40 px-2.5 py-1">{t("Default Shipping")}</span>}
                      {a.is_default_billing && <span className="eyebrow text-accent border border-accent/40 px-2.5 py-1">{t("Default Billing")}</span>}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteAddress(a.id)} className="eyebrow text-danger hover:opacity-75 transition-opacity">{t("Delete")}</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            {ordersLoading ? (
              <p className="py-16 text-center text-body-md text-ink-muted">{t("Loading...")}</p>
            ) : orders.length === 0 ? (
              <div className="py-24 text-center">
                <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">receipt_long</span>
                <p className="text-body-lg text-ink-muted mb-10">{t("No orders yet")}</p>
                <Link to="/catalog" className="btn-primary">{t("Explore Collection")}</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    to={`/orders/${o.id}`}
                    className="glass-panel rounded-xl p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover-lift"
                  >
                    <div>
                      <p className="font-display text-body-lg text-ink">{t("Order #")}{o.id}</p>
                      <p className="text-body-sm text-ink-muted mt-1">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}
                        {' · '}{o.items.length} {t("Items")}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="eyebrow text-accent">{orderStatus(o.status, t)}</span>
                      <span className="font-display text-body-md text-ink">${Number(o.total_amount || 0).toFixed(2)}</span>
                      <span className="material-symbols-outlined text-[18px] text-ink-muted">arrow_forward</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'security' && (
          <div className="glass-panel rounded-xl p-8">
            <h2 className="font-display text-headline-md text-ink mb-6">{t("Security")}</h2>
            <div className="mb-6 p-5 bg-surface-muted/60 rounded-lg space-y-1">
              <p className="text-body-md text-ink-muted">{t("Email verified: {value}").replace('{value}', customer?.email_verified ? t("Yes") : t("No"))}</p>
              <p className="text-body-md text-ink-muted">{t("Phone verified: {value}").replace('{value}', customer?.phone_verified ? t("Yes") : t("No"))}</p>
            </div>
            {!customer?.email && <p className="text-body-md text-ink-muted mb-2">{t("No email linked. Contact support to add one.")}</p>}
            {!customer?.phone && <p className="text-body-md text-ink-muted mb-2">{t("No phone linked. Contact support to add one.")}</p>}
          </div>
        )}
      </section>
    </div>
  )
}
