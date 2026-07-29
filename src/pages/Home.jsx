import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Home() {
  const [cats, setCats] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('/categories/').then((r) => setCats(r.data)).catch(() => {})
    api.get('/products/', { params: { limit: 8 } })
      .then((r) => setProducts(r.data.items))
      .catch(() => {})
  }, [])

  return (
    <div>
      <section className="bg-gray-900 text-white rounded-2xl p-12 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">New Collection</h1>
        <p className="text-gray-400 mb-4">Premium men's clothing</p>
        <Link to="/catalog" className="inline-block bg-white text-gray-900 px-6 py-2 rounded font-medium hover:bg-gray-100">
          Shop Now
        </Link>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-4 gap-4">
          {cats.map((c) => (
            <Link key={c.id} to={`/catalog?category=${c.id}`}
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition">
              <div className="font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Latest Products</h2>
        <div className="grid grid-cols-4 gap-4">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center text-gray-400">Photo</div>
              <div className="font-medium text-sm">{p.name}</div>
              <div className="text-gray-500 text-xs mt-1">{p.slug}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
