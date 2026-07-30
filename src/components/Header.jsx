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
    <header className="bg-surface shadow-sm border-b border-border transition-colors">
      <div className="max-w-6xl mx-auto px-gutter h-14 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-lg text-ink">{t('app.name')}</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/catalog" className="text-ink-muted hover:text-accent transition-colors">{t('nav.catalog')}</Link>
          <Link to="/cart" className="relative text-ink-muted hover:text-accent transition-colors">
            {t('nav.cart')}
            {count > 0 && <span className="absolute -top-2 -right-4 bg-accent text-accent-ink text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
          </Link>

          <select
            value={getLanguage()}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs border border-border rounded-control px-1.5 py-0.5 bg-surface text-ink-muted"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={() => setTheme(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
            className="text-sm text-ink-muted hover:text-accent transition-colors"
            title={t(`theme.${mode}`)}
          >
            {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻'}
          </button>

          {customer ? (
            <Link to="/account" className="text-ink-muted hover:text-accent transition-colors">{customer.first_name}</Link>
          ) : (
            <Link to="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">{t('nav.signin')}</Link>
          )}
        </nav>
      </div>
    </header>
  )
}