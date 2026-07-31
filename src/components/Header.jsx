import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useI18n, getLanguages } from '../i18n'

const NAV = [
  { to: '/catalog', label: 'Collections' },
  { to: '/market', label: 'New Arrivals' },
]

export default function Header() {
  const { count } = useCart()
  const { customer } = useAuth()
  const { mode, setTheme } = useTheme()
  const { t, lang, setLanguage } = useI18n()
  const langs = getLanguages()

  const themeIcon = mode === 'dark' ? 'light_mode' : mode === 'light' ? 'dark_mode' : 'contrast'
  const cycleTheme = () => {
    const next = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark'
    setTheme(next)
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-xl border-b border-border/10">
      <div className="flex justify-between items-center w-full px-mobile-margin md:px-section-padding-h py-5 mx-auto max-w-container-max">
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `eyebrow transition-colors duration-500 ${isActive ? 'text-ink border-b border-ink pb-1' : 'text-ink-muted hover:text-ink'}`
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        {/* Brand wordmark */}
        <Link to="/" className="font-display text-headline-md font-bold tracking-tighter text-ink uppercase">
          Aurelius
        </Link>

        {/* Trailing actions */}
        <div className="flex items-center gap-5 md:gap-6">
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-0 border-b border-border/60 text-label-sm uppercase tracking-widest text-ink-muted focus:border-accent focus:outline-none cursor-pointer py-0.5"
            aria-label="Language"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code} className="bg-surface text-ink">{l.label}</option>
            ))}
          </select>

          <button
            onClick={cycleTheme}
            className="text-ink-muted hover:text-ink transition-colors duration-500"
            title={t(mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System')}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-[20px]">{themeIcon}</span>
          </button>

          <Link to="/cart" className="relative text-ink-muted hover:text-ink transition-colors duration-500" aria-label="Cart">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-ink text-[10px] flex items-center justify-center">{count}</span>
            )}
          </Link>

          {customer ? (
            <Link to="/account" className="text-ink-muted hover:text-ink transition-colors duration-500" aria-label="Account">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          ) : (
            <Link to="/login" className="eyebrow text-accent hover:text-accent-hover transition-colors duration-500">
              {t("Sign In")}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
