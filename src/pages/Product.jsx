import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useI18n } from '../i18n'

export default function Product() {
  const { t } = useI18n()
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
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
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const hex = product.variants.find((v) => colorOf(v) === c)?.color_hex
                    return (
                      <button
                        key={c}
                        onClick={() => selectColor(c)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 border text-body-md transition-colors ${
                          color === c
                            ? 'border-ink bg-ink text-bg'
                            : 'border-border/60 text-ink hover:border-ink/60'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 flex-shrink-0"
                          style={{ background: hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }}
                        />
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size / variant selection */}
            {product.variants?.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="eyebrow text-ink">{t("Select Size")}</span>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectSize(v.size)}
                      className={`py-3 border text-body-md transition-colors ${
                        size === v.size
                          ? 'border-ink bg-ink text-bg'
                          : 'border-border/60 text-ink hover:border-ink/60'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
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
