import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { t } from '../i18n'

export default function Product() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [variant, setVariant] = useState(null)
  const { addToCart } = useCart()
  const toast = useToast()

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => { setProduct(r.data); setVariant(r.data.variants?.[0] || null) }).catch(() => {})
  }, [slug])

  if (!product) return <div className="text-ink-muted">Loading...</div>

  const handleAdd = async () => {
    if (!variant) return
    await addToCart(variant.id, 1)
    toast?.addToast(t('product.added_to_cart'), 'success')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-ink">{product.name}</h1>
      <p className="text-ink-muted mb-4">{product.description}</p>
      <div className="flex gap-2 mb-4">
        {product.variants?.map((v) => (
          <button key={v.id} onClick={() => setVariant(v)} className={`px-3 py-1 rounded-control text-sm border transition-colors ${variant?.id === v.id ? 'bg-accent text-accent-ink border-accent' : 'border-border text-ink-muted hover:border-accent hover:text-ink'}`}>{v.size} {v.color}</button>
        ))}
      </div>
      {variant && (
        <p className="text-xl font-display font-semibold mb-4 text-accent">{t('product.price').replace('{price}', variant.selling_price)}</p>
      )}
      {variant && variant.quantity > 0 ? (
        <button onClick={handleAdd} className="bg-accent text-accent-ink px-6 py-2.5 rounded-control font-medium hover:bg-accent-hover transition-colors">{t('product.add_to_cart')}</button>
      ) : (
        <p className="text-danger font-medium">{t('product.out_of_stock')}</p>
      )}
    </div>
  )
}