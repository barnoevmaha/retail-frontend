import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { t } from '../i18n'

export default function Cart() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const { refresh } = useCart()

  useEffect(() => {
    const key = sessionStorage.getItem('session_key') || 'guest_' + Math.random().toString(36).slice(2)
    if (!sessionStorage.getItem('session_key')) sessionStorage.setItem('session_key', key)
    api.get('/cart/', { headers: { 'X-Session-Key': key } }).then((r) => {
      setItems(r.data.items || [])
      setTotal(r.data.total || 0)
    }).catch(() => {})
  }, [])

  const remove = async (itemId) => {
    const key = sessionStorage.getItem('session_key')
    try {
      await api.delete(`/cart/items/${itemId}`, { headers: { 'X-Session-Key': key } })
      setItems(items.filter((i) => i.id !== itemId))
      refresh()
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('cart.title')}</h1>
      {items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{t('cart.empty')}</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-3 flex justify-between items-center">
              <div className="dark:text-gray-300">
                <p className="font-medium dark:text-white">{item.product_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('cart.quantity').replace('{qty}', item.quantity)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium dark:text-white">${item.price}</span>
                <button onClick={() => remove(item.id)} className="text-red-500 text-sm hover:text-red-700">{t('cart.remove')}</button>
              </div>
            </div>
          ))}
          <div className="text-right mt-4">
            <p className="text-xl font-bold dark:text-white">{t('cart.total').replace('{total}', total.toFixed(2))}</p>
            <button className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-2 rounded mt-2 hover:bg-gray-800 dark:hover:bg-gray-200">{t('cart.checkout')}</button>
          </div>
        </>
      )}
    </div>
  )
}
