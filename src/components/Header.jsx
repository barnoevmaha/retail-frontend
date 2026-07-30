import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { t, setLanguage, getLanguage, getLanguages } from '../i18n'

export default function Header() {
  const { count } = useCart()
  const { customer } = useAuth()
  const { mode, setTheme } = useTheme()
  const langs = getLanguages()

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg dark:text-white">{t('app.name')}</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/catalog" className="hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-300">{t('nav.catalog')}</Link>
          <Link to="/cart" className="relative hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-300">
            {t('nav.cart')}
            {count > 0 && <span className="absolute -top-2 -right-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
          </Link>

          <select
            value={getLanguage()}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs border rounded px-1 py-0.5 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={() => setTheme(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
            className="text-sm hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-300"
            title={t(`theme.${mode}`)}
          >
            {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻'}
          </button>

          {customer ? (
            <Link to="/account" className="hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-300">{customer.first_name}</Link>
          ) : (
            <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-300">{t('nav.signin')}</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
