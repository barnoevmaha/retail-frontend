import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { orderStatus, paymentMethodLabel, paymentStatusLabel } from '../utils/orders'

const cacheKey = (id) => `order_conf_${id}`

export default function OrderConfirmation() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const { customer, loading } = useAuth()
  const location = useLocation()
  const stateOrder = location.state?.order
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (loading) return
    const orderId = Number(id)
    if (!orderId) { setNotFound(true); return }

    let cached = null
    if (stateOrder && Number(stateOrder.id) === orderId) {
      cached = stateOrder
      sessionStorage.setItem(cacheKey(orderId), JSON.stringify(stateOrder))
    }

    if (customer) {
      // /customer/orders/:id enforces ownership (404 for another customer's order).
      api.get(`/customer/orders/${orderId}`)
        .then((r) => { setOrder(r.data); sessionStorage.setItem(cacheKey(orderId), JSON.stringify(r.data)) })
        .catch(() => setNotFound(true))
    } else {
      if (!cached) {
        try { cached = JSON.parse(sessionStorage.getItem(cacheKey(orderId))) } catch { /* corrupt cache */ }
      }
      // Guests cannot re-auth; only a same-session cached checkout response is usable.
      if (cached) setOrder(cached)
      else setNotFound(true)
    }
  }, [id, customer, loading, stateOrder])

  if (loading) return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>

  if (notFound) {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">receipt_long</span>
        <p className="text-body-lg text-ink-muted mb-2">{t("Order not found")}</p>
        <p className="text-body-md text-ink-muted/70 mb-10">{t("The order may have been removed, or you don't have access to it.")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {customer ? (
            <Link to="/account" className="btn-primary px-10 py-5">{t("Back to My Account")}</Link>
          ) : (
            <Link to="/" className="btn-primary px-10 py-5">{t("Back to Home")}</Link>
          )}
        </div>
      </div>
    )
  }

  if (!order) return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <span className="w-20 h-20 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-[40px]">check</span>
        </span>
        <h1 className="font-display text-headline-lg text-ink mb-4">{t("Thank you for your order")}</h1>
        <p className="text-body-lg text-ink-muted">
          {t("Order #")}{order.id} — <span className="text-accent">{orderStatus(order.status, t)}</span>
        </p>
        <p className="text-body-sm text-ink-muted mt-3">
          {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-accent/25 bg-accent/[0.04] px-6 py-4 text-body-sm text-ink-muted text-left">
          <span className="material-symbols-outlined text-[22px] text-accent shrink-0">payments</span>
          <span className="leading-relaxed">
            <strong className="text-ink">{t('Payment method')}:</strong> {paymentMethodLabel(order.payment_method, t)} · {paymentStatusLabel(order.payment_status, t)}<br />
            {t('Online card payment is not currently available. We will contact you to confirm payment before your order is shipped.')}
          </span>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-8 mb-10">
        <h2 className="font-display text-headline-md text-ink mb-8 pb-4 border-b border-border/10">{t("Order Details")}</h2>
        <div className="flex flex-col gap-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-5">
              <div className="w-16 h-20 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url
                  ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-headline-md text-ink-muted/25 uppercase">{item.product_name?.charAt(0)}</span></div>}
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.product_slug}`} className="font-display text-body-lg text-ink hover:opacity-70 transition-opacity">{item.product_name}</Link>
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
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/10">
          <span className="font-display text-body-lg text-ink font-medium">{t("Total")}</span>
          <span className="font-display text-headline-md text-ink">${Number(order.total_amount || 0).toFixed(2)}</span>
        </div>
      </div>

      {(order.customer_name || order.city || order.address || order.customer_phone) && (
        <div className="glass-panel rounded-xl p-8 mb-10">
          <h2 className="font-display text-headline-md text-ink mb-6">{t("Delivery Information")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-body-md text-ink-muted">
            {order.customer_name && <p><span className="eyebrow text-ink block mb-1">{t("Recipient")}</span>{order.customer_name}</p>}
            {order.customer_phone && <p><span className="eyebrow text-ink block mb-1">{t("Phone")}</span>{order.customer_phone}</p>}
            {order.city && <p><span className="eyebrow text-ink block mb-1">{t("City")}</span>{order.city}</p>}
            {order.address && <p><span className="eyebrow text-ink block mb-1">{t("Address")}</span>{order.address}{order.apartment ? `, ${order.apartment}` : ''}</p>}
            {order.latitude != null && order.longitude != null && (
              <p>
                <span className="eyebrow text-ink block mb-1">{t("Location")}</span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${order.latitude}&mlon=${order.longitude}#map=17/${order.latitude}/${order.longitude}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  {t("View on map")}
                </a>
              </p>
            )}
          </div>
          {order.delivery_note && (
            <p className="mt-5 text-body-md text-ink-muted"><span className="eyebrow text-ink block mb-1">{t("Delivery Note")}</span>{order.delivery_note}</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {order.customer_id ? (
          <Link to={`/orders/${order.id}`} className="btn-primary px-10 py-5">
            {t("View Order Details")}
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          </Link>
        ) : (
          <Link to="/register" className="btn-primary px-10 py-5" state={{ fromCheckout: true }}>
            {t("Track Order in My Account")}
            <span className="material-symbols-outlined text-[18px]">person_add</span>
          </Link>
        )}
        <button onClick={() => navigate('/catalog')} className="btn-ghost px-10 py-5">
          {t("Continue Shopping")}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}