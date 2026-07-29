import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [selected, setSelected] = useState(null)
  const [images, setImages] = useState([])
  const [activeImage, setActiveImage] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => {
      setProduct(r.data)
      api.get('/variants/', { params: { product_id: r.data.id } })
        .then((v) => {
          setVariants(v.data.items)
          if (v.data.items.length > 0) setSelected(v.data.items[0])
        })
      api.get(`/products/${r.data.id}/images/`).then((res) => {
        setImages(res.data)
        const main = res.data.find((i) => i.is_main) || res.data[0]
        if (main) setActiveImage(main.image_url)
      }).catch(() => {})
    }).catch(() => {})
  }, [slug])

  if (!product) return <div className="text-gray-500">Loading...</div>

  const current = selected || variants[0]

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center mb-3 overflow-hidden">
          {activeImage ? (
            <img src={activeImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-lg">Product Photo</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img) => (
              <button key={img.id} onClick={() => setActiveImage(img.image_url)}
                className={`w-16 h-16 rounded border-2 overflow-hidden ${
                  activeImage === img.image_url ? 'border-gray-900' : 'border-transparent'
                }`}>
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-500 text-sm mb-4">{product.description || 'No description'}</p>

        {variants.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Size / Color</div>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button key={v.id}
                  onClick={() => setSelected(v)}
                  className={`border px-3 py-1 rounded text-sm ${
                    selected?.id === v.id ? 'border-gray-900 bg-gray-900 text-white' : 'hover:border-gray-400'
                  }`}>
                  {v.size} / {v.color}
                </button>
              ))}
            </div>
          </div>
        )}

        {current && (
          <div className="mb-4">
            <div className="text-2xl font-bold">${parseFloat(current.selling_price).toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">SKU: {current.sku} | Barcode: {current.barcode}</div>
          </div>
        )}

        <button onClick={() => current && addToCart(current.id)}
          className="bg-gray-900 text-white px-8 py-3 rounded font-medium hover:bg-gray-800">
          Add to Cart
        </button>
      </div>
    </div>
  )
}
