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

  if (!product) return <div className="dark:text-gray-300">Loading...</div>

  const handleAdd = async () => {
    if (!variant) return
    await addToCart(variant.id, 1)
    toast?.addToast(t('product.added_to_cart'), 'success')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{product.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{product.description}</p>
      <div className="flex gap-2 mb-4">
        {product.variants?.map((v) => (
          <button key={v.id} onClick={() => setVariant(v)} className={`px-3 py-1 rounded text-sm border dark:border-gray-700 ${variant?.id === v.id ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white' : 'dark:text-gray-300'}`}>{v.size} {v.color}</button>
        ))}
      </div>
      {variant && (
        <p className="text-lg font-bold mb-4 dark:text-white">{t('product.price').replace('{price}', variant.selling_price)}</p>
      )}
      {variant && variant.quantity > 0 ? (
        <button onClick={handleAdd} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('product.add_to_cart')}</button>
      ) : (
        <p className="text-red-500">{t('product.out_of_stock')}</p>
      )}
    </div>
  )
}
