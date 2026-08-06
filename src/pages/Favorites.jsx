import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useI18n } from '../i18n'

export default function Favorites() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { customer } = useAuth()
  const { faves, refresh } = useFavorites()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!customer) return
    api.get('/favorites/').then((r) => setItems(r.data || [])).catch(() => {})
  }, [customer, faves])

  const remove = async (productId) => {
    await api.delete(`/favorites/${productId}`).catch(() => {})
    refresh()
  }

  if (!customer) {
    return (
      <div className="py-32 text-center">
        <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">favorite_border</span>
        <p className="text-body-lg text-ink-muted mb-10">{t("Sign in to see your favorites")}</p>
        <button onClick={() => navigate('/login')} className="btn-primary">{t("Sign In")}</button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12 border-b border-border/10 pb-6">
        <h1 className="font-display text-headline-lg text-ink">{t("Favorites")}</h1>
        <p className="text-body-md text-ink-muted mt-2">{items.length} {t("Items")}</p>
      </div>

      {items.length === 0 ? (
        <div className="py-32 text-center">
          <span className="material-symbols-outlined text-[56px] text-ink-muted/30 block mb-6">favorite_border</span>
          <p className="text-body-lg text-ink-muted mb-10">{t("No favorites yet")}</p>
          <Link to="/catalog" className="btn-primary">{t("Explore Collection")}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-gutter gap-y-16">
          {items.map((f) => (
            <div key={f.product_id} className="group flex flex-col">
              <Link to={`/products/${f.product_slug}`} className="relative overflow-hidden rounded-lg aspect-[3/4] mb-6 bg-surface-muted block">
                {f.image_url ? (
                  <img src={f.image_url} alt={f.product_name} className="w-full h-full object-cover product-image" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-headline-md text-ink-muted/30 uppercase tracking-tighter">{f.product_name?.charAt(0)}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); remove(f.product_id) }}
                  aria-label={t("Remove from favorites")}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-bg/85 backdrop-blur-sm flex items-center justify-center text-ink border border-border/10 hover:border-ink transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </Link>
              <Link to={`/products/${f.product_slug}`} className="hover:opacity-70 transition-opacity">
                <h3 className="font-display text-body-lg text-ink font-medium truncate">{f.product_name}</h3>
              </Link>
              <span className="text-body-md text-ink-muted">{f.price ? `$${f.price}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}