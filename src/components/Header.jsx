import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { count } = useCart()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">Clothes Shop</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/catalog" className="hover:text-gray-600">Catalog</Link>
          <Link to="/cart" className="relative hover:text-gray-600">
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-4 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
