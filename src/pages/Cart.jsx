import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const { refresh } = useCart()

  const load = () => {
    api.get('/cart/', { headers: { 'X-Session-Key': sessionStorage.getItem('session_key') || '' } })
      .then((r) => setCart(r.data))
      .catch(() => {})
  }

  useEffect(load, [])

  const remove = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`, {
      headers: { 'X-Session-Key': sessionStorage.getItem('session_key') || '' }
    })
    load()
    refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-4">Your cart is empty</p>
          <Link to="/catalog" className="bg-gray-900 text-white px-6 py-2 rounded">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 mb-3 flex items-center gap-4">
                <div className="bg-gray-100 w-20 h-20 rounded flex items-center justify-center text-gray-400 text-xs">Photo</div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.size} / {item.color}</div>
                  <div className="text-sm">Barcode: {item.barcode}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-sm text-gray-500">x{item.quantity}</div>
                </div>
                <button onClick={() => remove(item.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow p-4 h-fit">
            <div className="text-lg font-bold mb-2">Order Summary</div>
            <div className="flex justify-between mb-4">
              <span>Total</span>
              <span className="font-bold text-xl">${cart.total.toFixed(2)}</span>
            </div>
            <button onClick={() => alert('Checkout via API — integrate payment')}
              className="w-full bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-800">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
