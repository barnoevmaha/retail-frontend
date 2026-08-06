import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useI18n } from '../i18n'

function sessionKey() {
  let key = sessionStorage.getItem('session_key')
  if (!key) {
    key = 'guest_' + Math.random().toString(36).slice(2)
    sessionStorage.setItem('session_key', key)
  }
  return key
}

export default function Checkout() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const toast = useToast()
  const { refresh } = useCart()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    api.get('/cart/', { headers: { 'X-Session-Key': sessionKey() } })
      .then((r) => { setItems(r.data.items || []); setTotal(r.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const placeOrder = async () => {
    if (placing || items.length === 0) return
    setPlacing(true)
    try {
      await api.post('/checkout/', { payment_method: 'card', session_key: sessionKey() },
        { headers: { 'X-Session-Key': sessionKey() } })
      refresh()
      toast?.addToast(t("Order placed successfully"), 'success')
      navigate('/')
    } catch (err) {
      toast?.addToast(err.response?.data?.detail || t("Checkout failed. Please try again."), 'error')
      setPlacing(false)
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>
  }

  if (items.length === 0) {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">shopping_bag</span>
        <p className="text-body-lg text-ink-muted mb-10">{t("Your cart is empty")}</p>
        <Link to="/catalog" className="btn-primary">{t("Explore Collection")}</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12 border-b border-border/10 pb-6">
        <h1 className="font-display text-headline-lg text-ink">{t("Secure Checkout")}</h1>
        <p className="text-body-md text-ink-muted mt-2">{t("Review your order before placing it.")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        <div className="flex-1 flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-5 border-b border-border/10 pb-6">
              <div className="w-20 h-24 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url
                  ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-headline-md text-ink-muted/25 uppercase">{item.product_name.charAt(0)}</span></div>}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-body-lg text-ink">{item.product_name}</h3>
                <div className="flex items-center gap-3 mt-1 text-body-sm text-ink-muted">
                  {item.color && (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ background: item.color_hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }} />
                      {item.color}
                    </span>
                  )}
                  {item.size && <span>{t("Size")}: {item.size}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="font-display text-body-md text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                <span className="block text-body-sm text-ink-muted">{t("Qty: {qty}").replace('{qty}', item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-surface-muted/70 border border-border/10 rounded-xl p-8 lg:sticky lg:top-32">
            <h2 className="font-display text-headline-md text-ink mb-8 pb-4 border-b border-border/10">{t("Order Summary")}</h2>
            <div className="flex justify-between text-body-md text-ink mb-4">
              <span className="text-ink-muted">{t("Subtotal")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-md text-ink mb-8 pb-8 border-b border-border/10">
              <span className="text-ink-muted">{t("Estimated Shipping")}</span>
              <span>{t("Complimentary")}</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="font-display text-body-lg text-ink font-medium">{t("Total")}</span>
              <span className="font-display text-headline-md text-ink">${total.toFixed(2)}</span>
            </div>
            <button className="btn-primary w-full py-5" onClick={placeOrder} disabled={placing}>
              {placing ? t("Placing order…") : t("Place Order")}
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </button>
            <p className="eyebrow text-ink-muted mt-6 text-center leading-relaxed">
              {t("By placing the order, you agree to our Terms of Service and Privacy Policy.")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}