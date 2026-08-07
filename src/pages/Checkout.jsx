import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useI18n } from '../i18n'
import MapPicker from '../components/MapPicker'

function sessionKey() {
  let key = sessionStorage.getItem('session_key')
  if (!key) {
    key = 'guest_' + Math.random().toString(36).slice(2)
    sessionStorage.setItem('session_key', key)
  }
  return key
}

const inputCls = 'input-line'
const errCls = 'text-body-sm text-danger mt-1.5'

export default function Checkout() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const toast = useToast()
  const { refresh } = useCart()
  const { customer } = useAuth()
  const [items, setItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', address: '', apartment: '', delivery_note: '', save_address: false, latitude: null, longitude: null })
  const [errors, setErrors] = useState({})
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    api.get('/cart/', { headers: { 'X-Session-Key': sessionKey() } })
      .then((r) => {
        setItems(r.data.items || [])
        setSubtotal(r.data.subtotal ?? r.data.total ?? 0)
        setDeliveryFee(r.data.delivery_fee ?? 0)
        setTotal(r.data.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const applyPromo = async () => {
    const code = promoCode.trim()
    if (!code) return
    const base = subtotal + deliveryFee
    try {
      const res = await api.post('/promotions/validate', { code, order_total: base })
      api.get('/cart/', { headers: { 'X-Session-Key': sessionKey() } })
        .then((r) => {
          setSubtotal(r.data.subtotal ?? r.data.total ?? 0)
          setDeliveryFee(r.data.delivery_fee ?? 0)
        })
        .catch(() => {})
      setAppliedPromo(res.data)
      setTotal(round2(Math.max(base - res.data.discount, 0)))
      setPromoError('')
    } catch (err) {
      setPromoError(err.response?.data?.detail || t('Invalid promo code'))
      setAppliedPromo(null)
      setTotal(subtotal + deliveryFee)
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
    setPromoError('')
    setTotal(subtotal + deliveryFee)
  }

  const round2 = (n) => Math.round(n * 100) / 100

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = t('Full name is required')
    if (!/^\+?[\d\s()-]{7,20}$/.test(form.phone.trim())) e.phone = t('Enter a valid phone number')
    if (!form.city.trim()) e.city = t('City is required')
    if (!form.address.trim()) e.address = t('Address is required')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const placeOrder = async () => {
    if (placing || items.length === 0) return
    if (!validate()) { toast?.addToast(t('Please fill in all required fields'), 'error'); return }
    setPlacing(true)
    try {
      const headers = { 'X-Session-Key': sessionKey() }
      if (customer?.id) headers['X-Customer-Id'] = String(customer.id)
      const res = await api.post('/checkout/', {
        payment_method: 'card',
        session_key: sessionKey(),
        promo_code: appliedPromo ? appliedPromo.code : null,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        apartment: form.apartment.trim() || '',
        delivery_note: form.delivery_note.trim() || null,
        latitude: form.latitude,
        longitude: form.longitude,
      }, { headers })
      if (customer?.id && form.save_address) {
        api.post('/customer/account/addresses', {
          receiver_name: form.full_name.trim(),
          receiver_phone: form.phone.trim(),
          city: form.city.trim(),
          street: form.address.trim(),
          apartment: form.apartment.trim(),
          is_default_shipping: false,
          is_default_billing: false,
        }).catch(() => {})
      }
      refresh()
      navigate(`/order-confirmation/${res.data.id}`, { state: { order: res.data } })
    } catch (err) {
      toast?.addToast(err.response?.data?.detail || t('Checkout failed. Please try again.'), 'error')
      setPlacing(false)
    }
  }

  const pickLocation = async (lat, lon) => {
    setShowMap(false)
    setForm({ ...form, latitude: lat, longitude: lon })
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, { headers: { 'Accept': 'application/json' } })
      const data = await res.json()
      const a = data.address || {}
      const road = [a.road || a.pedestrian || '', a.house_number || ''].filter(Boolean).join(' ')
      const city = a.city || a.town || a.village || a.county || form.city
      if (road) setForm((f) => ({ ...f, address: road, city, latitude: lat, longitude: lon }))
      else setForm((f) => ({ ...f, latitude: lat, longitude: lon }))
    } catch {
      toast?.addToast(t('Location set. Adjust the address fields if needed.'), 'info')
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-body-md text-ink-muted">{t('Loading...')}</div>
  }

  if (items.length === 0) {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">shopping_bag</span>
        <p className="text-body-lg text-ink-muted mb-10">{t('Your cart is empty')}</p>
        <Link to="/catalog" className="btn-primary">{t('Explore Collection')}</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12 border-b border-border/10 pb-6">
        <h1 className="font-display text-headline-lg text-ink">{t('Secure Checkout')}</h1>
        <p className="text-body-md text-ink-muted mt-2">{t('Enter your delivery details and review your order.')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-headline-md text-ink mb-8">{t('Delivery Information')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
            <div className="sm:col-span-2">
              <label className="block eyebrow text-ink-muted mb-1.5">{t('Full Name')} *</label>
              <input type="text" className={inputCls} value={form.full_name} onChange={set('full_name')} placeholder={t('Full Name')} />
              {errors.full_name && <p className={errCls}>{errors.full_name}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block eyebrow text-ink-muted mb-1.5">{t('Phone Number')} *</label>
              <input type="tel" className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+998 90 123 45 67" />
              {errors.phone && <p className={errCls}>{errors.phone}</p>}
            </div>
            <div>
              <label className="block eyebrow text-ink-muted mb-1.5">{t('City')} *</label>
              <input type="text" className={inputCls} value={form.city} onChange={set('city')} placeholder={t('City')} />
              {errors.city && <p className={errCls}>{errors.city}</p>}
            </div>
            <div>
              <label className="block eyebrow text-ink-muted mb-1.5">{t('Apartment / Building')}</label>
              <input type="text" className={inputCls} value={form.apartment} onChange={set('apartment')} placeholder={t('Optional')} />
            </div>
            <div className="sm:col-span-2">
              <label className="block eyebrow text-ink-muted mb-1.5">{t('Delivery Address')} *</label>
              <div className="flex gap-2">
                <input type="text" className={inputCls} value={form.address} onChange={set('address')} placeholder={t('Street, house number')} />
                <button type="button" onClick={() => setShowMap(true)} className="btn-ghost shrink-0 flex items-center gap-2 px-4 text-body-sm">
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  {t('Choose on map')}
                </button>
              </div>
              {errors.address && <p className={errCls}>{errors.address}</p>}
              {form.latitude && form.longitude && (
                <p className="text-body-xs text-ink-muted mt-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  Pin: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block eyebrow text-ink-muted mb-1.5">{t('Delivery Note (optional)')}</label>
              <textarea className={`${inputCls} min-h-28 resize-y`} value={form.delivery_note} onChange={set('delivery_note')} placeholder={t('Comments for the courier…')} />
            </div>
            {customer?.id && (
              <label className="sm:col-span-2 flex items-center gap-3 text-body-md text-ink-muted cursor-pointer">
                <input type="checkbox" checked={form.save_address} onChange={(e) => setForm({ ...form, save_address: e.target.checked })} className="accent-accent w-4 h-4" />
                {t('Save this address for future orders')}
              </label>
            )}
          </div>
        </div>

        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-surface-muted/70 border border-border/10 rounded-xl p-8 lg:sticky lg:top-32">
            <h2 className="font-display text-headline-md text-ink mb-8 pb-4 border-b border-border/10">{t('Order Summary')}</h2>
            <div className="flex flex-col gap-6 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-14 h-16 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-headline-md text-ink-muted/25 uppercase">{item.product_name?.charAt(0)}</span></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-body-md text-ink truncate">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-body-sm text-ink-muted">
                      {item.color && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-black/15" style={{ background: item.color_hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }} />
                          {item.color}
                        </span>
                      )}
                      {item.size && <span>{t('Size')}: {item.size}</span>}
                      <span>× {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-display text-body-md text-ink flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 text-body-md text-ink border-t border-border/10 pt-6 pb-6 mb-6 border-b">
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder={t('Promo code')}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button className="btn-secondary" onClick={applyPromo}>{t('Apply')}</button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-ink">{t('Promo applied')}: <strong>{appliedPromo.code}</strong></span>
                  <button className="text-body-sm text-link underline" onClick={removePromo}>{t('Remove')}</button>
                </div>
              )}
              {promoError && <p className={errCls}>{promoError}</p>}
              <div className="flex justify-between">
                <span className="text-ink-muted">{t('Subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">{t('Discount')}</span>
                <span>{appliedPromo ? `-$${appliedPromo.discount.toFixed(2)}` : '$0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">{t('Delivery')}</span>
                <span>{deliveryFee === 0 ? t('Complimentary') : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-body-xs text-ink-muted">{t('Free delivery on orders over $500')}</p>
              )}
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="font-display text-body-lg text-ink font-medium">{t('Total')}</span>
              <span className="font-display text-headline-md text-ink">${total.toFixed(2)}</span>
            </div>
            <button className="btn-primary w-full py-5" onClick={placeOrder} disabled={placing}>
              {placing ? t('Placing order…') : t('Place Order')}
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </button>
            <p className="eyebrow text-ink-muted mt-6 text-center leading-relaxed">
              {t('By placing the order, you agree to our Terms of Service and Privacy Policy.')}
            </p>
          </div>
        </aside>
      </div>
      {showMap && <MapPicker lat={form.latitude} lon={form.longitude} onClose={() => setShowMap(false)} onPick={pickLocation} />}
    </div>
  )
}