import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/client'

export default function Catalog() {
  const [params] = useSearchParams()
  const [products, setProducts] = useState([])
  const [cats, setCats] = useState([])
  const [q, setQ] = useState('')
  const categoryId = params.get('category')

  useEffect(() => {
    api.get('/categories/').then((r) => setCats(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/products/', { params: { q, category_id: categoryId || undefined, limit: 50 } })
      .then((r) => setProducts(r.data.items))
      .catch(() => {})
  }, [q, categoryId])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catalog</h1>
      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search products..."
          className="border p-2 rounded flex-1"
          value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border p-2 rounded" value={categoryId || ''}
          onChange={(e) => { const url = e.target.value ? `?category=${e.target.value}` : '/catalog'; window.location.href = url }}>
          <option value="">All Categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.slug}`}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
            <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center text-gray-400">Photo</div>
            <div className="font-medium text-sm">{p.name}</div>
          </Link>
        ))}
      </div>
      {products.length === 0 && <div className="text-center text-gray-400 py-12">No products found</div>}
    </div>
  )
}
