import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useI18n } from '../i18n'

const norm = (s) => (s || '').trim().toLowerCase()

// ponytail: resolved once per page load — the colors table is tiny and maps
// image.color_id / variant.color_id to a stable name+hex without guessing.
const colorCache = { p: null }

export default function Product() {
  const { slug } = useParams()
  const { t } = useI18n()
  const { addToCart, items } = useCart()
  const { customer } = useAuth()
  const navigate = useNavigate()
  const { faves, toggle: toggleFav } = useFavorites()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [failed, setFailed] = useState(false)
  const [colorKey, setColorKey] = useState(null)
  const [size, setSize] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [hoverColor, setHoverColor] = useState(null)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [colors, setColors] = useState([])

  const closeDrawer = () => {
    setClosing(true)
    setTimeout(() => { setSizeOpen(false); setClosing(false) }, 260)
  }

  const colorOf = (v, list = colors) => {
    if (!v) return null
    const id = v.color_id != null ? v.color_id : (() => {
      const name = v.color_name || v.color || null
      if (!name) return null
      const match = (list || []).find((c) => norm(c.name) === norm(name))
      return match ? match.id : null
    })()
    if (id != null) {
      const c = (list || []).find((x) => x.id === id)
      return { key: `cid:${id}`, name: c?.name || v.color_name || v.color || null, hex: c?.hex_value || v.color_hex || null }
    }
    const name = v.color_name || v.color || null
    return name ? { key: `name:${norm(name)}`, name, hex: v.color_hex || null } : null
  }

  const variantsOfColor = (p, key, list = colors) =>
    (p?.variants || []).filter((v) => colorOf(v, list)?.key === key)

  const imagesOfColor = (p, key) => {
    const imgs = (p?.images || []).filter((i) => i.color_id != null && `cid:${i.color_id}` === key)
    if (imgs.length) return [...imgs].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
    return []
  }

  useEffect(() => {
    let alive = true
    setFailed(false)
    setProduct(null)
    setColorKey(null)
    setSize(null)
    setImgIdx(0)
    Promise.all([
      api.get(`/products/${slug}`),
      colorCache.p ? Promise.resolve({ data: colorCache.p }) : api.get('/colors/'),
    ]).then(([pr, cr]) => {
      if (!alive) return
      colorCache.p = cr.data || []
      setColors(colorCache.p)
      setProduct(pr.data)
      const v = pr.data.variants?.[0] || null
      setColorKey(colorOf(v, colorCache.p)?.key || null)
      setSize(v?.size || null)
    }).catch(() => setFailed(true))
    return () => { alive = false }
  }, [slug])

  if (failed) {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">inventory_2</span>
        <p className="text-body-lg text-ink-muted mb-2">{t("Product not found")}</p>
        <p className="text-body-md text-ink-muted/70 mb-10">{t("The product you're looking for may have been removed or is no longer available.")}</p>
        <Link to="/catalog" className="btn-primary px-10 py-5">{t("Back to Catalog")}</Link>
      </div>
    )
  }

  if (!product) {
    return <div className="py-24 text-center text-body-md text-ink-muted">{t("Loading...")}</div>
  }

  // Real color list for this product: from variant colors (incl. resolved ids)
  // plus any image color assignments. Deduped by color_id / normalized name.
  const colorOptionsFor = (p, list) => {
    const seen = new Map()
    for (const v of p.variants) {
      const c = colorOf(v, list)
      if (c && !seen.has(c.key)) seen.set(c.key, { key: c.key, name: c.name, hex: c.hex })
    }
    for (const img of p.images || []) {
      if (img.color_id == null) continue
      const key = `cid:${img.color_id}`
      if (seen.has(key)) continue
      const c = (list || []).find((x) => x.id === img.color_id)
      seen.set(key, { key, name: c?.name || 'Color', hex: c?.hex_value || null })
    }
    return [...seen.values()]
  }

  const productColors = colorOptionsFor(product, colors)
  const selectedColor = productColors.find((c) => c.key === colorKey) || productColors[0] || null
  const colorVariants = selectedColor ? variantsOfColor(product, selectedColor.key) : []
  const sizeOptions = [...new Set(colorVariants.map((v) => v.size).filter(Boolean))]
  const chosenVariant = colorVariants.find((v) => v.size === size) || colorVariants[0] || null

  // Gallery: images belonging to the selected color; unassigned images (or
  // all images) when the color has none attached.
  const colorImages = selectedColor ? imagesOfColor(product, selectedColor.key) : []
  const unassigned = (product.images || []).filter((i) => i.color_id == null)
  const gallery = colorImages.length ? colorImages : (unassigned.length ? unassigned : (product.images || []))
  const shown = gallery[Math.min(imgIdx, gallery.length - 1)]
  const mainImage = shown?.image_url || product.images?.[0]?.image_url

  const inCart = items.find((i) => i.variant_id === chosenVariant?.id)?.quantity || 0

  const selectColor = (key) => {
    setColorKey(key)
    setImgIdx(0)
    const cv = variantsOfColor(product, key)
    if (!cv.some((v) => v.size === size)) setSize(cv[0]?.size || null)
  }

  const selectSize = (s) => {
    setSize(s)
    setImgIdx(0)
  }

  const handleAdd = async () => {
    if (!chosenVariant) return
    try {
      await addToCart(chosenVariant.id, 1)
      toast?.addToast(t("Added to cart"), 'success')
    } catch (err) {
      toast?.addToast(err.response?.data?.detail || t("Could not add to cart"), 'error')
    }
  }

  const handleFav = async () => {
    if (!customer) { navigate('/login'); return }
    const ok = await toggleFav(product.id)
    const now = faves.has(product.id)
    toast?.addToast(ok ? (now ? t("Removed from favorites") : t("Added to favorites")) : t("Something went wrong"), ok ? 'success' : 'error')
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
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover product-image" />
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
              <span className={`material-symbols-outlined text-[22px] ${faves.has(product.id) ? 'filled' : ''}`}>{faves.has(product.id) ? 'favorite' : 'favorite_border'}</span>
            </button>
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${i === Math.min(imgIdx, gallery.length - 1) ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky info panel */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32 flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <p className="eyebrow text-ink-muted">{product.category_slug ? (t(`category.${product.category_slug}`) === `category.${product.category_slug}` ? product.category_name : t(`category.${product.category_slug}`)) : (product.category_name || t("Catalog"))}</p>
              <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink tracking-tight">{product.name}</h1>
              {chosenVariant && (
                <p className="text-body-lg text-ink-muted">${chosenVariant.selling_price} USD</p>
              )}
            </div>

            <p className="text-body-md text-ink-muted leading-relaxed">
              {product.description || t("An exploration of enduring style. Precision tailoring meets modern sensibility.")}
            </p>

            {/* Color selection — real colors only, resolved from variants + images */}
            {productColors.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="eyebrow text-ink">{t("Color")}</span>
                <div className="flex flex-wrap gap-3">
                  {productColors.map((c) => {
                    const active = c.key === selectedColor?.key
                    return (
                      <div key={c.key} className="relative">
                        <button
                          type="button"
                          onClick={() => selectColor(c.key)}
                          onMouseEnter={() => setHoverColor(c.key)}
                          onMouseLeave={() => setHoverColor(null)}
                          aria-label={c.name}
                          className={`w-8 h-8 rounded-full border transition-all duration-200 ${
                            active
                              ? 'border-ink ring-2 ring-inset ring-ink scale-110'
                              : 'border-black/15 hover:scale-110'
                          }`}
                          style={{ background: c.hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }}
                        />
                        {hoverColor === c.key && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-[11px] uppercase tracking-widest bg-ink text-bg rounded pointer-events-none">
                            {c.name}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selection — only sizes available for the selected color */}
            {sizeOptions.length > 0 && (
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
                        {sizeOptions.filter((s) => colorVariants.some((v) => v.size === s && v.quantity > 0)).length} {t("sizes available")}
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
                      {sizeOptions.map((s) => {
                        const v = colorVariants.find((x) => x.size === s)
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
              {inCart > 0 && (
                <p className="eyebrow text-ink-muted flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  {t("In cart: {n}", { n: inCart })}
                </p>
              )}
              {chosenVariant && chosenVariant.quantity > 0 ? (
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