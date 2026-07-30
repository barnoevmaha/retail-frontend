import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { t } from '../i18n'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')

  useEffect(() => {
    api.get('/products/').then((r) => setProducts(r.data)).catch(() => {})
    api.get('/categories/').then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  const filtered = selectedCat ? products.filter((p) => p.category_id === parseInt(selectedCat)) : products

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-ink">{t('catalog.title')}</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setSelectedCat('')} className={`px-3 py-1 rounded-control text-sm transition-colors ${!selectedCat ? 'bg-accent text-accent-ink' : 'bg-surface-muted text-ink-muted hover:text-ink'}`}>{t('catalog.all')}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSelectedCat(c.id.toString())} className={`px-3 py-1 rounded-control text-sm transition-colors ${selectedCat === c.id.toString() ? 'bg-accent text-accent-ink' : 'bg-surface-muted text-ink-muted hover:text-ink'}`}>{c.name}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {filtered.map((p) => (
          <Link key={p.id} to={`/products/${p.slug}`} className="bg-surface border border-border rounded-card shadow-card p-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <h2 className="font-semibold text-ink">{p.name}</h2>
            <p className="text-sm text-ink-muted">{p.category_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}