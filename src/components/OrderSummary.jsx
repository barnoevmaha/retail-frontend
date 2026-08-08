import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export function OrderSummary({ order, heading }) {
  const { t } = useI18n()
  return (
    <div className="glass-panel rounded-xl p-8 mb-10">
      <h2 className="font-display text-headline-md text-ink mb-8 pb-4 border-b border-border/10">{heading || t("Order Details")}</h2>
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
  )
}

export function DeliveryInfo({ order, className = '' }) {
  const { t } = useI18n()
  if (!(order.customer_name || order.city || order.address || order.customer_phone)) return null
  return (
    <div className={`glass-panel rounded-xl p-8 ${className}`}>
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
  )
}