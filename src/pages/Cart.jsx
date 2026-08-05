import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'

export default function Cart() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { customer } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const { refresh } = useCart()

  useEffect(() => {
    const key = sessionStorage.getItem('session_key') || 'guest_' + Math.random().toString(36).slice(2)
    if (!sessionStorage.getItem('session_key')) sessionStorage.setItem('session_key', key)
    api.get('/cart/', { headers: { 'X-Session-Key': key } }).then((r) => {
      setItems(r.data.items || [])
      setTotal(r.data.total || 0)
    }).catch(() => {})
  }, [])

  const remove = async (itemId) => {
    const key = sessionStorage.getItem('session_key')
    try {
      await api.delete(`/cart/items/${itemId}`, { headers: { 'X-Session-Key': key } })
      setItems(items.filter((i) => i.id !== itemId))
      refresh()
    } catch {}
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-12 border-b border-border/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-display text-headline-lg text-ink">{t("Shopping Bag")}</h1>
          <p className="text-body-md text-ink-muted mt-2">{items.length} {t("Items")}</p>
        </div>
        <Link to="/catalog" className="eyebrow text-ink-muted hover:text-ink transition-colors flex items-center gap-2 group">
          {t("Continue Shopping")}
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-32 text-center">
          <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">shopping_bag</span>
          <p className="text-body-lg text-ink-muted mb-10">{t("Your cart is empty")}</p>
          <Link to="/catalog" className="btn-primary">{t("Explore Collection")}</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Items list */}
          <div className="flex-1 flex flex-col gap-10">
            {items.map((item) => (
              <article key={item.id} className="flex gap-6 md:gap-8 group">
                <div className="w-28 h-36 md:w-44 md:h-56 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-headline-lg text-ink-muted/25 uppercase">{item.product_name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between py-2 flex-grow">
                  <div>
                    <p className="eyebrow text-ink-muted mb-2">{t("Catalog")}</p>
                    <h3 className="font-display text-body-lg text-ink">{item.product_name}</h3>
                    <p className="text-body-md text-ink-muted mt-1">
                      {t("Qty: {qty}").replace('{qty}', item.quantity)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/10 pb-4">
                    <span className="font-display text-body-lg text-ink">${item.price}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="eyebrow text-ink-muted hover:text-danger transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      {t("Remove")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Order summary */}
          <aside className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-surface-muted/70 border border-border/10 rounded-xl p-8 lg:sticky lg:top-32">
              <h2 className="font-display text-headline-md text-ink mb-8 pb-4 border-b border-border/10">
                {t("Order Summary")}
              </h2>
              <div className="flex flex-col gap-4 text-body-md text-ink mb-8 pb-8 border-b border-border/10">
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("Subtotal")}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("Estimated Shipping")}</span>
                  <span>{t("Complimentary")}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-display text-body-lg text-ink font-medium">{t("Total")}</span>
                <span className="font-display text-headline-md text-ink">${total.toFixed(2)}</span>
              </div>
              <button className="btn-primary w-full py-5" onClick={() => { if (!customer) navigate('/login') }}>
                {t("Proceed to Secure Checkout")}
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </button>
              <p className="eyebrow text-ink-muted mt-6 text-center leading-relaxed">
                {t("By proceeding, you agree to our Terms of Service and Privacy Policy. Secure, encrypted transaction.")}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
