import { Routes, Route, Link } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { I18nProvider } from './context/LanguageContext'
import Header from './components/Header'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Account from './pages/Account'
import Market from './pages/Market'
import { useI18n } from './i18n'

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="bg-surface-muted/40 border-t border-border/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-mobile-margin md:px-section-padding-h py-16 max-w-container-max mx-auto">
        <div className="flex flex-col gap-4 md:col-span-1">
          <span className="font-display text-headline-md font-bold tracking-tighter text-ink uppercase">Aurelius</span>
          <p className="text-body-md text-ink-muted max-w-[260px]">
            {t("Defining modern masculine elegance through precise tailoring and quiet luxury.")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/catalog" className="text-body-md text-ink-muted hover:text-ink transition-colors duration-300">{t("Collections")}</Link>
          <Link to="/market" className="text-body-md text-ink-muted hover:text-ink transition-colors duration-300">{t("New Arrivals")}</Link>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/cart" className="text-body-md text-ink-muted hover:text-ink transition-colors duration-300">{t("Shopping Bag")}</Link>
          <Link to="/account" className="text-body-md text-ink-muted hover:text-ink transition-colors duration-300">{t("My Account")}</Link>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/login" className="text-body-md text-ink-muted hover:text-ink transition-colors duration-300">{t("Sign In")}</Link>
          <Link to="/register" className="text-body-md text-ink-muted hover:text-ink transition-colors duration-300">{t("Create Account")}</Link>
        </div>
        <div className="md:col-span-4 mt-8 pt-8 border-t border-border/10">
          <p className="text-label-sm text-ink-muted tracking-widest uppercase">© 2024 Aurelius Monochrome. {t("All rights reserved.")}</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <ThemeProvider>
              <ToastProvider>
              <div className="min-h-screen bg-bg transition-colors flex flex-col">
                <Header />
                <main className="flex-1 w-full max-w-container-max mx-auto px-mobile-margin md:px-section-padding-h pt-28 md:pt-32 pb-section-padding-v">
                  <Routes>
                    <Route index element={<Home />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="products/:slug" element={<Product />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="favorites" element={<Favorites />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="account" element={<Account />} />
                    <Route path="market" element={<Market />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </ThemeProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
