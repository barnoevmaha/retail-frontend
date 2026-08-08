import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { orderStatus, paymentMethodLabel, paymentStatusLabel } from '../utils/orders'
import { OrderSummary, DeliveryInfo } from '../components/OrderSummary'

export default function OrderDetails() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const { customer, loading } = useAuth()
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading') // loading | found | notfound | error

  useEffect(() => {
    if (loading) return
    if (!customer) { navigate('/login'); return }
    setState('loading')
    api.get(`/customer/orders/${id}`)
      .then((r) => { setOrder(r.data); setState('found') })
      .catch((err) => setState(err.response?.status === 404 ? 'notfound' : 'error'))
  }, [id, customer, loading, navigate])

  if (loading || state === 'loading') return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>

  if (state === 'error') {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">error_outline</span>
        <p className="text-body-lg text-ink-muted mb-6">{t("Could not load this order. Please try again.")}</p>
        <button onClick={() => navigate(0)} className="btn-primary">{t("Retry")}</button>
      </div>
    )
  }

  if (state === 'notfound') {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">receipt_long</span>
        <p className="text-body-lg text-ink-muted mb-10">{t("Order not found")}</p>
        <Link to="/account" className="btn-primary">{t("Back to My Account")}</Link>
      </div>
    )
  }

  if (!order) return null

  const date = order.created_at ? new Date(order.created_at).toLocaleDateString() : ''

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-display text-headline-lg text-ink">{t("Order #")}{order.id}</h1>
          <p className="text-body-md text-ink-muted mt-2">{date} — <span className="text-accent">{orderStatus(order.status, t)}</span></p>
        </div>
        <Link to="/account" className="eyebrow text-ink-muted hover:text-ink transition-colors flex items-center gap-2 group">
          {t("Back to My Account")}
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        </Link>
      </div>

      <OrderSummary order={order} heading={t("Items")} />

      <div className="glass-panel rounded-xl p-8 flex flex-col sm:flex-row gap-6 justify-between text-body-md text-ink-muted">
        <div>
          <p className="eyebrow text-ink mb-2">{t("Payment")}</p>
          <p>{paymentMethodLabel(order.payment_method, t)}</p>
          <p>{paymentStatusLabel(order.payment_status, t)}</p>
        </div>
        <div>
          <p className="eyebrow text-ink mb-2">{t("Order Status")}</p>
          <p className="text-ink font-medium">{orderStatus(order.status, t)}</p>
        </div>
        <div>
          <p className="eyebrow text-ink mb-2">{t("Order #")}</p>
          <p>#{order.id}</p>
        </div>
      </div>

      <DeliveryInfo order={order} className="mt-10" />
    </div>
  )
}