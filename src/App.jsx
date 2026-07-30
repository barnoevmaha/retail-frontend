import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Header from './components/Header'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Account from './pages/Account'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
              <Header />
              <main className="max-w-6xl mx-auto px-4 py-6">
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="catalog" element={<Catalog />} />
                  <Route path="products/:slug" element={<Product />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="account" element={<Account />} />
                </Routes>
              </main>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  )
}
