import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useI18n } from '../i18n'

export default function Catalog() {
  const { t } = useI18n()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')

  const catLabel = (c) => {
    const tr = t(`category.${c.slug}`)
    return tr === `category.${c.slug}` ? c.name : tr
  }

  useEffect(() => {
    api.get('/products/').then((r) => setProducts(r.data.items || [])).catch(() => {})
    api.get('/categories/').then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-gutter gap-y-16">
        {filtered.map((p) => {
          const img = p.images?.[0]?.image_url || p.image_url
          const price = p.variants?.length
            ? Math.min(...p.variants.map((v) => Number(v.selling_price) || 0))
            : 0
          return (
            <Link key={p.id} to={`/products/${p.slug}`} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-6 bg-surface-muted">
                {img ? (
                  <img src={img} alt={p.name} className="w-full h-full object-cover product-image" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-headline-md text-ink-muted/30 uppercase tracking-tighter">{p.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="eyebrow text-ink-muted">{p.category_slug ? (t(`category.${p.category_slug}`) === `category.${p.category_slug}` ? p.category_name : t(`category.${p.category_slug}`)) : (p.category_name || t("Catalog"))}</span>
                <h3 className="font-display text-body-lg text-ink font-medium truncate">{p.name}</h3>
                <span className="text-body-md text-ink-muted">{price ? `$${price}` : ''}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-body-md text-ink-muted py-24 text-center">{t("Your cart is empty")}</p>
      )}
    </div>
  )
}
