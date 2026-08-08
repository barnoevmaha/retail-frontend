import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { orderStatus, paymentMethodLabel, paymentStatusLabel } from '../utils/orders'
import { OrderSummary, DeliveryInfo } from '../components/OrderSummary'

const cacheKey = (id) => `order_conf_${id}`

export default function OrderConfirmation() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const { customer, loading } = useAuth()
  const location = useLocation()
  const stateOrder = location.state?.order
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading') // loading | found | notfound | error

  useEffect(() => {
    if (loading) return
    const orderId = Number(id)
    if (!orderId) { setState('notfound'); return }

    let cached = null
    if (stateOrder && Number(stateOrder.id) === orderId) {
      cached = stateOrder
      sessionStorage.setItem(cacheKey(orderId), JSON.stringify(stateOrder))
    }

    if (customer) {
      // /customer/orders/:id enforces ownership (404 for another customer's order).
      api.get(`/customer/orders/${orderId}`)
        .then((r) => { setOrder(r.data); setState('found'); sessionStorage.setItem(cacheKey(orderId), JSON.stringify(r.data)) })
        .catch((err) => setState(err.response?.status === 404 ? 'notfound' : 'error'))
    } else {
      if (!cached) {
        try { cached = JSON.parse(sessionStorage.getItem(cacheKey(orderId))) } catch { /* corrupt cache */ }
      }
      // Guests cannot re-auth; only a same-session cached checkout response is usable.
      if (cached) { setOrder(cached); setState('found') }
      else setState('notfound')
    }
  }, [id, customer, loading, stateOrder])

  if (loading || state === 'loading') return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>

  if (state === 'error') {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">error_outline</span>
        <p className="text-body-lg text-ink-muted mb-10">{t("Could not load this order. Please try again.")}</p>
        <button onClick={() => navigate(0)} className="btn-primary">{t("Retry")}</button>
      </div>
    )
  }

  if (state === 'notfound') {
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

  if (!order) return null

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

      <OrderSummary order={order} />

      <DeliveryInfo order={order} className="mb-10" />

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