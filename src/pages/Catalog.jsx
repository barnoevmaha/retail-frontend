import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import { useI18n } from '../i18n'

const ProductCard = ({ p, label }) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const toast = useToast()
  const { customer } = useAuth()
  const { faves, toggle: toggleFav } = useFavorites()
  const [hoverColorId, setHoverColorId] = useState(null)

  const handleFav = async (e) => {
    e.preventDefault()
    if (!customer) { navigate('/login'); return }
    const ok = await toggleFav(p.id)
    toast?.addToast(ok ? (faves.has(p.id) ? t("Removed from favorites") : t("Added to favorites")) : t("Something went wrong"), ok ? 'success' : 'error')
  }

  const colors = [...new Map(p.variants.filter((v) => v.color_name || v.color).map((v) => [v.color_name || v.color, v])).values()]
    .map((v) => ({ name: v.color_name || v.color, id: v.color_id, hex: v.color_hex }))
  const img = p.images?.find((i) => hoverColorId && i.color_id === hoverColorId)?.image_url
    || p.images?.[0]?.image_url
    || p.image_url
  const price = p.variants?.length
    ? Math.min(...p.variants.map((v) => Number(v.selling_price) || 0))
    : 0

  return (
    <Link to={`/products/${p.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-6 bg-surface-muted">
        {img ? (
          <img src={img} alt={p.name} className="w-full h-full object-cover product-image" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-headline-md text-ink-muted/30 uppercase tracking-tighter">{p.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          type="button"
          onClick={handleFav}
          aria-label={t("Toggle favorite")}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-bg/85 backdrop-blur-sm flex items-center justify-center border border-border/10 transition-colors ${faves.has(p.id) ? 'text-danger' : 'text-ink hover:border-ink'}`}
        >
          <span className={`material-symbols-outlined text-[20px] ${faves.has(p.id) ? 'filled' : ''}`}>{faves.has(p.id) ? 'favorite' : 'favorite_border'}</span>
        </button>
        {(price > 0 || colors.length > 0) && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-bg/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between gap-4">
            <span className="text-body-md text-ink font-medium whitespace-nowrap">{price ? `$${price}` : ''}</span>
            {colors.length > 0 && (
              <div className="flex items-center gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={(e) => e.preventDefault()}
                    onMouseEnter={() => setHoverColorId(c.id)}
                    onMouseLeave={() => setHoverColorId(null)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border border-black/15 transition-transform ${hoverColorId === c.id ? 'scale-110 border-ink' : ''}`}
                    style={{ background: c.hex || 'linear-gradient(135deg,#e5e5e5 50%,#d4d4d4 50%)' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="eyebrow text-ink-muted">{label}</span>
        <h3 className="font-display text-body-lg text-ink font-medium truncate">{p.name}</h3>
        <span className="text-body-md text-ink-muted">{price ? `$${price}` : ''}</span>
      </div>
    </Link>
  )
}

export default function Catalog() {
  const { t } = useI18n()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [loaded, setLoaded] = useState(false)

  const catLabel = (c) => {
    const tr = t(`category.${c.slug}`)
    return tr === `category.${c.slug}` ? c.name : tr
  }

  useEffect(() => {
    api.get('/products/').then((r) => setProducts(r.data.items || [])).catch(() => {})
    api.get('/categories/').then((r) => setCategories(r.data || [])).catch(() => {}).finally(() => setLoaded(true))
  }, [])

  const prodCatLabel = (p) => p.category_slug
    ? (t(`category.${p.category_slug}`) === `category.${p.category_slug}` ? p.category_name : t(`category.${p.category_slug}`))
    : (p.category_name || t("Catalog"))

  const filtered = selectedCat ? products.filter((p) => p.category_id === parseInt(selectedCat)) : products

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-end mb-12 border-b border-border/10 pb-6">
        <div>
          <h1 className="font-display text-headline-lg text-ink">{t("Catalog")}</h1>
          <p className="text-body-md text-ink-muted mt-2">{filtered.length} {t("Items")}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-14">
        <button
          onClick={() => setSelectedCat('')}
          className={`eyebrow px-5 py-2.5 border transition-colors duration-300 ${!selectedCat ? 'bg-ink text-bg border-ink' : 'border-border/60 text-ink-muted hover:text-ink hover:border-ink/50'}`}
        >
          {t("All")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id.toString())}
            className={`eyebrow px-5 py-2.5 border transition-colors duration-300 ${selectedCat === c.id.toString() ? 'bg-ink text-bg border-ink' : 'border-border/60 text-ink-muted hover:text-ink hover:border-ink/50'}`}
          >
            {catLabel(c)}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-gutter gap-y-16">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} label={prodCatLabel(p)} />
        ))}
      </div>

      {loaded && filtered.length === 0 && (
        <p className="text-body-md text-ink-muted py-24 text-center">{t("No products found")}</p>
      )}
    </div>
  )
}
