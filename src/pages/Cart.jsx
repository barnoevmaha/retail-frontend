import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useI18n } from '../i18n'

export default function Cart() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const toast = useToast()
  const [qtyLoading, setQtyLoading] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart()

  const changeQty = async (item, qty) => {
    if (qty < 1 || qty === item.quantity || qtyLoading) return
    setQtyLoading(item.id)
    try {
      await updateQuantity(item.id, qty)
    } catch (err) {
      toast?.addToast(err.response?.data?.detail || t("Could not update quantity"), 'error')
    } finally {
      setQtyLoading(null)
    }
  }

  const goCheckout = () => {
    if (checkoutLoading) return
    setCheckoutLoading(true)
    navigate('/checkout')
  }

  return (
    <div>
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
          <div className="flex-1 flex flex-col gap-10">
            {items.map((item) => (
              <article key={item.id} className="flex gap-6 md:gap-8">
                <Link to={`/products/${item.product_slug}`} className="w-28 h-36 md:w-44 md:h-56 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0 group">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-headline-lg text-ink-muted/25 uppercase">{item.product_name.charAt(0)}</span>
                    </div>
                  )}
                </Link>
                <div className="flex flex-col justify-between py-2 flex-grow">
                  <div>
                    <Link to={`/products/${item.product_slug}`} className="hover:opacity-70 transition-opacity">
                      <h3 className="font-display text-body-lg text-ink">{item.product_name}</h3>
                    </Link>
                    {(item.color || item.size) && (
                      <div className="flex items-center gap-3 mt-2">
                        {item.color && (
                          <span className="flex items-center gap-2 text-body-sm text-ink-muted">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15"
                              style={{ background: item.color_hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }}
                            />
                            {item.color}
                          </span>
                        )}
                        {item.size && <span className="text-body-sm text-ink-muted">{t("Size")}: {item.size}</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => changeQty(item, item.quantity - 1)}
                        disabled={qtyLoading === item.id || item.quantity <= 1}
                        className="w-8 h-8 border border-border/60 flex items-center justify-center text-ink hover:border-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={t("Decrease")}
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-8 text-center text-body-md text-ink">
                        {qtyLoading === item.id ? '…' : item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item, item.quantity + 1)}
                        disabled={qtyLoading === item.id || item.quantity >= item.stock}
                        className="w-8 h-8 border border-border/60 flex items-center justify-center text-ink hover:border-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={t("Increase")}
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                      {item.quantity >= item.stock && item.stock > 0 && (
                        <span className="text-body-xs text-ink-muted">{t("Only {n} available").replace('{n}', item.stock)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/10 pb-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display text-body-lg text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                      <span className="text-body-sm text-ink-muted">${item.price} {t("each")}</span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
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

          <aside className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-surface-muted/70 border border-border/10 rounded-xl p-8 lg:sticky lg:top-32">
              <h2 className="font-display text-headline-md text-ink mb-8 pb-4 border-b border-border/10">
                {t("Order Summary")}
              </h2>
              <div className="flex flex-col gap-4 text-body-md text-ink mb-8 pb-8 border-b border-border/10">
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("Subtotal")}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("Discount")}</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("Delivery")}</span>
                  <span>{deliveryFee === 0 ? t("Complimentary") : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-body-xs text-ink-muted">{t("Free delivery on orders over $500")}</p>
                )}
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-display text-body-lg text-ink font-medium">{t("Total")}</span>
                <span className="font-display text-headline-md text-ink">${total.toFixed(2)}</span>
              </div>
              <button
                className="btn-primary w-full py-5"
                onClick={goCheckout}
                disabled={checkoutLoading}
              >
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