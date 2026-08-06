import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { orderStatus } from '../utils/orders'

export default function OrderConfirmation() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  if (!order) return <Navigate to="/" replace />

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