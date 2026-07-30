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
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('catalog.title')}</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setSelectedCat('')} className={`px-3 py-1 rounded text-sm ${!selectedCat ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{t('catalog.all')}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSelectedCat(c.id.toString())} className={`px-3 py-1 rounded text-sm ${selectedCat === c.id.toString() ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{c.name}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {filtered.map((p) => (
          <Link key={p.id} to={`/products/${p.slug}`} className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-4 hover:shadow-md transition-shadow">
            <h2 className="font-semibold dark:text-white">{p.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{p.category_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
