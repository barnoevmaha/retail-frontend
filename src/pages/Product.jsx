import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useI18n } from '../i18n'

export default function Product() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { slug } = useParams()
  const { customer } = useAuth()
  const { faves, toggle: toggleFav } = useFavorites()
  const [product, setProduct] = useState(null)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [hoverColor, setHoverColor] = useState(null)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  const closeDrawer = () => {
    setClosing(true)
    setTimeout(() => { setSizeOpen(false); setClosing(false) }, 260)
  }
  const { addToCart } = useCart()
  const toast = useToast()

  const colorOf = (v) => v && (v.color_name || v.color || null)

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => {
      setProduct(r.data)
      const v = r.data.variants?.[0] || null
      setColor(colorOf(v))
      setSize(v?.size || null)
    }).catch(() => {})
  }, [slug])

  if (!product) {
    return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>
  }

  const colors = [...new Set(product.variants.map(colorOf).filter(Boolean))]
  const variant = product.variants.find((v) => colorOf(v) === color && v.size === size)
    || product.variants.find((v) => colorOf(v) === color)
    || product.variants.find((v) => v.size === size)
    || product.variants[0]
  const productImg = product.images?.find((i) => variant?.color_id && i.color_id === variant.color_id)?.image_url
    || product.images?.[0]?.image_url

  const selectColor = (c) => {
    setColor(c)
    if (!product.variants.find((v) => colorOf(v) === c && v.size === size)) {
      const firstOfColor = product.variants.find((v) => colorOf(v) === c)
      if (firstOfColor) setSize(firstOfColor.size)
    }
  }

  const selectSize = (s) => {
    setSize(s)
    if (!product.variants.find((v) => colorOf(v) === color && v.size === s)) {
      const firstWithSize = product.variants.find((v) => v.size === s)
      if (firstWithSize) setColor(colorOf(firstWithSize))
    }
  }

  const handleAdd = async () => {
    if (!variant) return
    await addToCart(variant.id, 1)
    toast?.addToast(t("Added to cart"), 'success')
  }

  const handleFav = async () => {
    if (!customer) { navigate('/login'); return }
    const ok = await toggleFav(product.id)
    toast?.addToast(ok ? (faves.has(product.id) ? t("Removed from favorites") : t("Added to favorites")) : t("Something went wrong"), ok ? 'success' : 'error')
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="eyebrow text-ink-muted mb-10 hidden md:block">
        <Link to="/" className="hover:text-ink transition-colors">{t("Home")}</Link> <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:text-ink transition-colors">{t("Catalog")}</Link> <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-gutter">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[3/4] w-full bg-surface-muted rounded-lg overflow-hidden group">
            {variant?.image_url || productImg ? (
              <img src={variant?.image_url || productImg} alt={product.name} className="w-full h-full object-cover product-image" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-display-lg text-ink-muted/20 uppercase tracking-tighter">{product.name.charAt(0)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleFav}
              aria-label={t("Toggle favorite")}
              className={`absolute top-4 right-4 w-11 h-11 rounded-full bg-bg/85 backdrop-blur-sm flex items-center justify-center border border-border/10 transition-colors ${faves.has(product.id) ? 'text-danger' : 'text-ink hover:border-ink'}`}
            >
              <span className="material-symbols-outlined text-[22px]">{faves.has(product.id) ? 'favorite' : 'favorite_border'}</span>
            </button>
          </div>
        </div>

        {/* Sticky info panel */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32 flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <p className="eyebrow text-ink-muted">{product.category_slug ? (t(`category.${product.category_slug}`) === `category.${product.category_slug}` ? product.category_name : t(`category.${product.category_slug}`)) : (product.category_name || t("Catalog"))}</p>
              <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink tracking-tight">{product.name}</h1>
              {variant && (
                <p className="text-body-lg text-ink-muted">${variant.selling_price} USD</p>
              )}
            </div>

            <p className="text-body-md text-ink-muted leading-relaxed">
              {product.description || t("An exploration of enduring style. Precision tailoring meets modern sensibility.")}
            </p>

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="eyebrow text-ink">{t("Color")}</span>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const hex = product.variants.find((v) => colorOf(v) === c)?.color_hex
                    const active = color === c
                    return (
                      <div key={c} className="relative">
                        <button
                          type="button"
                          onClick={() => selectColor(c)}
                          onMouseEnter={() => setHoverColor(c)}
                          onMouseLeave={() => setHoverColor(null)}
                          aria-label={c}
                          className={`w-8 h-8 rounded-full border transition-all duration-200 ${
                            active
                              ? 'border-ink ring-2 ring-inset ring-ink scale-110'
                              : 'border-black/15 hover:scale-110'
                          }`}
                          style={{ background: hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }}
                        />
                        {hoverColor === c && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-[11px] uppercase tracking-widest bg-ink text-bg rounded pointer-events-none">
                            {c}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size / variant selection */}
            {product.variants?.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="eyebrow text-ink">{t("Select Size")}</span>
                <button
                  type="button"
                  onClick={() => setSizeOpen(true)}
                  className="w-full flex items-center justify-between py-4 border-y border-border/10 text-body-md cursor-pointer hover:text-ink-muted transition-colors"
                >
                  <span className={size ? 'text-ink font-medium' : 'text-ink-muted'}>{size || t("Select Size")}</span>
                  <span className="material-symbols-outlined text-[18px] text-ink-muted">chevron_right</span>
                </button>
              </div>
            )}

            {/* Size drawer — portal to body so it always sits above the header */}
            {sizeOpen && createPortal(
              <div className="fixed inset-0 z-[100]">
                <div className={`absolute inset-0 bg-ink/25 ${closing ? 'opacity-0 transition-opacity duration-200' : 'drawer-fade'}`} onClick={closeDrawer} />
                <div className={`absolute top-0 right-0 h-full w-[400px] max-w-[92vw] bg-bg shadow-2xl flex flex-col ${closing ? 'drawer-out' : 'drawer-in'}`}>
                  <div className="flex items-start justify-between gap-4 px-6 md:px-8 pt-8 pb-6">
                    <div>
                      <h2 className="font-display text-headline-lg md:text-headline-xl text-ink tracking-tight">{t("Choose your size")}</h2>
                      <p className="eyebrow text-ink-muted mt-2">
                        {product.variants.filter((v) => colorOf(v) === color && v.quantity > 0).length} {t("sizes available")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      aria-label={t("Close")}
                      className="w-11 h-11 rounded-full border border-border/60 flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink transition-colors flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <div className="mx-6 md:mx-8 border-t border-border/10" />
                  <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {[...new Set(product.variants.map((v) => v.size))].map((s) => {
                        const v = product.variants.find((x) => colorOf(x) === color && x.size === s)
                        const available = !!v && v.quantity > 0
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={!available}
                            onClick={() => { selectSize(s); closeDrawer() }}
                            className={`py-4 border text-body-md font-medium transition-colors duration-200 ${
                              size === s && available
                                ? 'bg-ink text-bg border-ink'
                                : available
                                  ? 'border-border/60 text-ink hover:border-ink'
                                  : 'border-border/20 text-ink-muted/40 line-through cursor-not-allowed'
                            }`}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-2">
              {variant && variant.quantity > 0 ? (
                <button onClick={handleAdd} className="btn-primary w-full py-5">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  {t("Add to Bag")}
                </button>
              ) : (
                <p className="text-danger font-medium">{t("Out of stock")}</p>
              )}
            </div>

            {/* Accordions */}
            <div className="mt-4 border-t border-border/20 divide-y divide-border/20">
              <details className="group py-6" open>
                <summary className="flex justify-between items-center eyebrow cursor-pointer list-none text-ink">
                  <span>{t("The Craft")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-[18px]">expand_more</span>
                </summary>
                <div className="mt-5 text-body-md text-ink-muted flex flex-col gap-3">
                  <p>{product.description || t("Constructed in our atelier, this garment requires over 30 hours of hand-finishing. The canvas is floating, allowing the garment to mold to the wearer over time.")}</p>
                </div>
              </details>
              <details className="group py-6">
                <summary className="flex justify-between items-center eyebrow cursor-pointer list-none text-ink">
                  <span>{t("Shipping & Returns")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-[18px]">expand_more</span>
                </summary>
                <div className="mt-5 text-body-md text-ink-muted flex flex-col gap-3">
                  <p>{t("Complimentary express shipping on all orders above $500. Deliveries arrive within 2-4 business days globally.")}</p>
                  <p>{t("Returns are accepted within 14 days of receipt, provided the garment is in original condition with all tags attached.")}</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
